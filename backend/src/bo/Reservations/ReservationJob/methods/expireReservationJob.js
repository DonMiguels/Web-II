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
import { appendBusinessAudit } from '../../../_shared/auditTrail.js';
import { syncItemOperationalStateTx } from '../../../_shared/itemStatusFlow.js';

export const expireReservationJob = async function (params = {}) {
  const processContext = startProcessContext('expireReservationJob');
  const { limit = 100, processed_by_user_id, _session_user_id } = params || {};
  const normalizedLimit = Number(limit);
  const processedByUserId = Number(
    processed_by_user_id || _session_user_id || 0,
  );

  if (!Number.isInteger(normalizedLimit) || normalizedLimit <= 0) {
    throwDomainError({
      statusCode: 422,
      code: DOMAIN_ERROR_CODES.VALIDATION_ERROR,
      message: 'limit debe ser un entero positivo',
    });
  }

  if (!Number.isInteger(processedByUserId) || processedByUserId <= 0) {
    throwDomainError({
      statusCode: 422,
      code: DOMAIN_ERROR_CODES.VALIDATION_ERROR,
      message: 'processed_by_user_id es obligatorio',
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
          SELECT md.inventory_id, md.amount, inv.item_id
          FROM public.movement_detail md
          JOIN public.inventory inv ON inv.id = md.inventory_id
          WHERE movement_id = $1
        `,
        [reservation.id],
      );

      const touchedItemIds = new Set();

      for (const detail of details.rows) {
        touchedItemIds.add(Number(detail.item_id));
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

      for (const itemId of touchedItemIds) {
        await syncItemOperationalStateTx({
          client,
          itemId,
        });
      }
    }

    const auditId = await appendBusinessAudit({
      client,
      actorUserId: processedByUserId,
      method: 'expireReservationJob',
      entityName: 'movement',
      details: {
        expired_count: Number(expiredReservations.rowCount || 0),
        released_items: releasedItems,
      },
    });

    await dbms.commitTransaction(client);

    return {
      expired_count: expiredReservations.rowCount,
      released_items: releasedItems,
      processed_by_user_id: processedByUserId,
      audit_id: auditId,
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
