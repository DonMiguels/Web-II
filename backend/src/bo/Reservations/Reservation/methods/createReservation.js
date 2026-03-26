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

function parseDateStrict(rawValue, fieldName) {
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

function assertReservationDates({
  booking_date,
  reservation_expires_at,
  estimated_return_date,
}) {
  const bookingDate = parseDateStrict(booking_date, 'booking_date');
  const reservationExpirationDate = parseDateStrict(
    reservation_expires_at,
    'reservation_expires_at',
  );

  if (reservationExpirationDate < bookingDate) {
    throwDomainError({
      statusCode: 422,
      code: DOMAIN_ERROR_CODES.VALIDATION_ERROR,
      message: 'reservation_expires_at no puede ser menor que booking_date',
    });
  }

  if (estimated_return_date !== undefined && estimated_return_date !== null) {
    const estimatedReturnDate = parseDateStrict(
      estimated_return_date,
      'estimated_return_date',
    );

    if (estimatedReturnDate < bookingDate) {
      throwDomainError({
        statusCode: 422,
        code: DOMAIN_ERROR_CODES.VALIDATION_ERROR,
        message: 'estimated_return_date no puede ser menor que booking_date',
      });
    }
  }
}

function buildNormalizedDetails(details) {
  if (!Array.isArray(details) || details.length === 0) {
    throwDomainError({
      statusCode: 422,
      code: DOMAIN_ERROR_CODES.VALIDATION_ERROR,
      message: 'La reserva requiere al menos un detail',
    });
  }

  const groupedDetails = new Map();

  for (const detail of details) {
    const inventoryId = Number(detail?.inventory_id);
    const amount = Number(detail?.amount);

    if (!detail || !Number.isInteger(inventoryId)) {
      throwDomainError({
        statusCode: 422,
        code: DOMAIN_ERROR_CODES.VALIDATION_ERROR,
        message: 'Cada detail requiere inventory_id valido',
      });
    }

    if (!Number.isInteger(amount) || amount <= 0) {
      throwDomainError({
        statusCode: 422,
        code: DOMAIN_ERROR_CODES.VALIDATION_ERROR,
        message: 'Cada detail requiere amount mayor a cero',
      });
    }

    const key = String(inventoryId);
    const current = groupedDetails.get(key);
    if (!current) {
      groupedDetails.set(key, {
        inventory_id: inventoryId,
        amount,
        observations: detail?.observations || null,
      });
      continue;
    }

    current.amount += amount;
  }

  return Array.from(groupedDetails.values()).sort(
    (left, right) => left.inventory_id - right.inventory_id,
  );
}

export const createReservation = async function (params = {}) {
  const processContext = startProcessContext('createReservation');
  const {
    user_id,
    period_id,
    booking_date,
    reservation_expires_at,
    estimated_return_date,
    observations,
    details,
    processed_by_user_id,
    _session_user_id,
  } = params || {};

  const processedByUserId = Number(
    processed_by_user_id || _session_user_id || 0,
  );

  if (!user_id || !period_id || !booking_date || !reservation_expires_at) {
    throwDomainError({
      statusCode: 422,
      code: DOMAIN_ERROR_CODES.VALIDATION_ERROR,
      message: 'Faltan campos obligatorios para crear reserva',
    });
  }

  if (!Number.isInteger(processedByUserId) || processedByUserId <= 0) {
    throwDomainError({
      statusCode: 422,
      code: DOMAIN_ERROR_CODES.VALIDATION_ERROR,
      message: 'processed_by_user_id es obligatorio',
    });
  }

  assertReservationDates({
    booking_date,
    reservation_expires_at,
    estimated_return_date,
  });
  const normalizedDetails = buildNormalizedDetails(details);

  const dbms = new DBMS();
  await dbms.init();
  const client = await dbms.beginTransaction();

  try {
    await client.query('SET TRANSACTION ISOLATION LEVEL SERIALIZABLE');

    const periodResult = await client.query(
      `
        SELECT id, is_active
        FROM public.period
        WHERE id = $1
        FOR UPDATE
      `,
      [period_id],
    );

    if (periodResult.rowCount === 0) {
      throwDomainError({
        statusCode: 404,
        code: DOMAIN_ERROR_CODES.NOT_FOUND,
        message: `Periodo no encontrado: ${period_id}`,
      });
    }

    if (!periodResult.rows[0].is_active) {
      throwDomainError({
        statusCode: 422,
        code: DOMAIN_ERROR_CODES.VALIDATION_ERROR,
        message: 'No se puede crear reserva en un periodo inactivo',
      });
    }

    const borrower = await client.query(
      `
        SELECT id, is_active
        FROM public."user"
        WHERE id = $1
        FOR UPDATE
      `,
      [user_id],
    );

    if (borrower.rowCount === 0) {
      throwDomainError({
        statusCode: 404,
        code: DOMAIN_ERROR_CODES.NOT_FOUND,
        message: 'Usuario no existe para reserva',
      });
    }

    if (!borrower.rows[0].is_active) {
      throwDomainError({
        statusCode: 422,
        code: DOMAIN_ERROR_CODES.VALIDATION_ERROR,
        message: 'Usuario inactivo no puede generar reserva',
      });
    }

    const reservationInsert = await client.query(
      `
        INSERT INTO public.movement (
          user_id,
          type_id,
          period_id,
          booking_date,
          reservation_expires_at,
          estimated_return_date,
          observations,
          updated_at
        )
        VALUES (
          $1,
          (SELECT id FROM public.movement_type WHERE name = 'reserve'),
          $2,
          $3,
          $4,
          $5,
          $6,
          NOW()
        )
        RETURNING id
      `,
      [
        user_id,
        period_id,
        booking_date,
        reservation_expires_at,
        estimated_return_date || null,
        observations || null,
      ],
    );

    const reservationId = reservationInsert.rows[0].id;
    const touchedItemIds = new Set();

    for (const detail of normalizedDetails) {
      const inventoryId = Number(detail.inventory_id);
      const amount = Number(detail.amount);

      const stockResult = await client.query(
        `
          SELECT id, amount, item_id
          FROM public.inventory
          WHERE id = $1
          FOR UPDATE
        `,
        [inventoryId],
      );

      if (stockResult.rowCount === 0) {
        throwDomainError({
          statusCode: 404,
          code: DOMAIN_ERROR_CODES.NOT_FOUND,
          message: `Inventario no encontrado: ${inventoryId}`,
        });
      }

      const stock = Number(stockResult.rows[0].amount);
      touchedItemIds.add(Number(stockResult.rows[0].item_id));
      if (stock < amount) {
        throwDomainError({
          statusCode: 409,
          code: DOMAIN_ERROR_CODES.CONFLICT,
          message: `Stock insuficiente para reserva en inventario ${inventoryId}`,
        });
      }

      await client.query(
        `
          INSERT INTO public.movement_detail (
            movement_date,
            amount,
            fine,
            observations,
            inventory_id,
            movement_id,
            updated_at
          )
          VALUES ($1, $2, 0, $3, $4, $5, NOW())
        `,
        [
          booking_date,
          amount,
          detail.observations || null,
          inventoryId,
          reservationId,
        ],
      );

      await client.query(
        `
          UPDATE public.inventory
          SET amount = amount - $2,
              updated_at = NOW()
          WHERE id = $1
        `,
        [inventoryId, amount],
      );
    }

    for (const itemId of touchedItemIds) {
      await syncItemOperationalStateTx({
        client,
        itemId,
      });
    }

    const auditId = await appendBusinessAudit({
      client,
      actorUserId: processedByUserId,
      method: 'createReservation',
      entityName: 'movement',
      details: {
        reservation_id: reservationId,
        borrower_user_id: Number(user_id),
        detail_count: normalizedDetails.length,
      },
    });

    await dbms.commitTransaction(client);
    return {
      reservation_id: reservationId,
      detail_count: normalizedDetails.length,
      processed_by_user_id: processedByUserId,
      audit_id: auditId,
      status: 'reservation_created',
      observability: buildProcessMetadata(processContext, 200),
    };
  } catch (err) {
    await dbms.rollbackTransaction(client);
    if (err?.code === '40001' || err?.code === '40P01') {
      throwDomainError({
        statusCode: 409,
        code: DOMAIN_ERROR_CODES.CONFLICT,
        message: 'Conflicto concurrente detectado al crear reserva',
      });
    }
    rethrowAsDomainError(err, 'Error ejecutando createReservation');
  } finally {
    await dbms.endTransaction(client);
  }
};
