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

function parseOptionalDate(rawValue, fieldName) {
  if (!rawValue) return new Date();
  const parsed = new Date(rawValue);
  if (Number.isNaN(parsed.getTime())) {
    throwDomainError({
      statusCode: 422,
      code: DOMAIN_ERROR_CODES.VALIDATION_ERROR,
      message: `Fecha invalida para ${fieldName}`,
    });
  }
  return parsed;
}

function resolveProcessedBy(params) {
  const resolved = Number(
    params?.processed_by_user_id || params?._session_user_id || 0,
  );

  if (!Number.isInteger(resolved) || resolved <= 0) {
    throwDomainError({
      statusCode: 422,
      code: DOMAIN_ERROR_CODES.VALIDATION_ERROR,
      message: 'processed_by_user_id es obligatorio',
    });
  }

  return resolved;
}

export const cancelReservation = async function (params = {}) {
  const processContext = startProcessContext('cancelReservation');
  const { reservation_id, cancellation_reason } = params || {};

  const reservationId = Number(reservation_id);
  const processedByUserId = resolveProcessedBy(params);
  const cancellationDate = parseOptionalDate(
    params?.cancellation_date,
    'cancellation_date',
  );
  const cancellationReason = String(cancellation_reason || '').trim();

  if (!Number.isInteger(reservationId) || reservationId <= 0) {
    throwDomainError({
      statusCode: 422,
      code: DOMAIN_ERROR_CODES.VALIDATION_ERROR,
      message: 'reservation_id debe ser un entero positivo',
    });
  }

  if (!cancellationReason) {
    throwDomainError({
      statusCode: 422,
      code: DOMAIN_ERROR_CODES.VALIDATION_ERROR,
      message: 'cancellation_reason es obligatorio para cancelar la reserva',
    });
  }

  const dbms = new DBMS();
  await dbms.init();
  const client = await dbms.beginTransaction();

  try {
    await client.query('SET TRANSACTION ISOLATION LEVEL SERIALIZABLE');

    const reservationResult = await client.query(
      `
        SELECT id, actual_return_date
        FROM public.movement
        WHERE id = $1
          AND type_id = (SELECT id FROM public.movement_type WHERE name = 'reserve')
        FOR UPDATE
      `,
      [reservationId],
    );

    if (reservationResult.rowCount === 0) {
      throwDomainError({
        statusCode: 404,
        code: DOMAIN_ERROR_CODES.NOT_FOUND,
        message: 'Reserva no encontrada',
      });
    }

    const reservationRow = reservationResult.rows[0];
    if (reservationRow.actual_return_date) {
      throwDomainError({
        statusCode: 409,
        code: DOMAIN_ERROR_CODES.CONFLICT,
        message: 'La reserva ya fue cerrada y no puede cancelarse',
      });
    }

    const detailsResult = await client.query(
      `
        SELECT md.inventory_id, md.amount, inv.item_id
        FROM public.movement_detail md
        JOIN public.inventory inv ON inv.id = md.inventory_id
        WHERE movement_id = $1
        FOR UPDATE
      `,
      [reservationId],
    );

    let releasedItems = 0;
    const touchedItemIds = new Set();
    for (const detail of detailsResult.rows) {
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

    const cancellationObservation = `Reservation cancelled by operator ${processedByUserId}. Reason: ${cancellationReason}`;

    await client.query(
      `
        UPDATE public.movement
        SET actual_return_date = $2,
            observations = CASE
              WHEN observations IS NULL OR observations = '' THEN $3
              ELSE observations || ' | ' || $3
            END,
            updated_at = NOW()
        WHERE id = $1
      `,
      [reservationId, cancellationDate.toISOString(), cancellationObservation],
    );

    for (const itemId of touchedItemIds) {
      await syncItemOperationalStateTx({
        client,
        itemId,
      });
    }

    const auditId = await appendBusinessAudit({
      client,
      actorUserId: processedByUserId,
      method: 'cancelReservation',
      entityName: 'movement',
      details: {
        reservation_id: reservationId,
        released_items: releasedItems,
        cancellation_reason: cancellationReason,
      },
    });

    await dbms.commitTransaction(client);

    return {
      reservation_id: reservationId,
      released_items: releasedItems,
      processed_by_user_id: processedByUserId,
      audit_id: auditId,
      status: 'reservation_cancelled',
      observability: buildProcessMetadata(processContext, 200),
    };
  } catch (err) {
    await dbms.rollbackTransaction(client);

    if (err?.code === '40001' || err?.code === '40P01') {
      throwDomainError({
        statusCode: 409,
        code: DOMAIN_ERROR_CODES.CONFLICT,
        message: 'Conflicto concurrente detectado al cancelar reserva',
      });
    }

    rethrowAsDomainError(err, 'Error ejecutando cancelReservation');
  } finally {
    await dbms.endTransaction(client);
  }
};
