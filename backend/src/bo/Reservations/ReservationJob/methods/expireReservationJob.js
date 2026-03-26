import DBMS from '../../../../dbms/dbms.js';
import {
  DOMAIN_ERROR_CODES,
  rethrowAsDomainError,
  throwDomainError,
} from '../../../_shared/domainError.js';
import {
  buildProcessMetadata,
  startProcessContext,
} from '../../../_shared/processObservability.js';

export const expireReservationJob = async function (params = {}) {
  const processContext = startProcessContext('expireReservationJob');
  const { limit = 100 } = params || {};
  const normalizedLimit = Number(limit);

  if (!Number.isInteger(normalizedLimit) || normalizedLimit <= 0) {
    throwDomainError({
      statusCode: 422,
      code: DOMAIN_ERROR_CODES.VALIDATION_ERROR,
      message: 'limit debe ser un entero positivo',
    });
  }

  const dbms = new DBMS();
  await dbms.init();
  const client = await dbms.beginTransaction();

  try {
    await client.query('SET TRANSACTION ISOLATION LEVEL SERIALIZABLE');

    const expiredReservations = await client.query(
      `
        SELECT id
        FROM public.movement
        WHERE type_id = (SELECT id FROM public.movement_type WHERE name = 'reserve')
          AND actual_return_date IS NULL
          AND reservation_expires_at < NOW()
        ORDER BY reservation_expires_at ASC
        LIMIT $1
        FOR UPDATE SKIP LOCKED
      `,
      [normalizedLimit],
    );

    let releasedItems = 0;

    for (const reservation of expiredReservations.rows) {
      const details = await client.query(
        `
          SELECT inventory_id, amount
          FROM public.movement_detail
          WHERE movement_id = $1
        `,
        [reservation.id],
      );

      for (const detail of details.rows) {
        await client.query(
          `
            UPDATE public.inventory
            SET amount = amount + $2,
                updated_at = NOW()
            WHERE id = $1
          `,
          [detail.inventory_id, detail.amount],
        );
        releasedItems += Number(detail.amount);
      }

      await client.query(
        `
          UPDATE public.movement
          SET actual_return_date = NOW(),
              observations = COALESCE(observations, 'Reservation expired by job'),
              updated_at = NOW()
          WHERE id = $1
        `,
        [reservation.id],
      );
    }

    await dbms.commitTransaction(client);

    return {
      expired_count: expiredReservations.rowCount,
      released_items: releasedItems,
      observability: buildProcessMetadata(processContext, 200),
    };
  } catch (err) {
    await dbms.rollbackTransaction(client);
    if (err?.code === '40001' || err?.code === '40P01') {
      throwDomainError({
        statusCode: 409,
        code: DOMAIN_ERROR_CODES.CONFLICT,
        message: 'Conflicto concurrente detectado en expireReservationJob',
      });
    }
    rethrowAsDomainError(err, 'Error ejecutando expireReservationJob');
  } finally {
    await dbms.endTransaction(client);
  }
};
