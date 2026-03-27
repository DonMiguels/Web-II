import DBMS from '../../dbms/dbms.js';
import { getRuntimeEnvSync } from '../../../config/env/runtime.js';
import {
  DOMAIN_ERROR_CODES,
  rethrowAsDomainError,
  throwDomainError,
} from '../_shared/domainError.js';
import {
  buildProcessMetadata,
  startProcessContext,
} from '../_shared/processObservability.js';
import { recomputeUserSolvency } from '../_shared/solvency.js';
import { appendBusinessAudit } from '../_shared/auditTrail.js';
import { syncItemOperationalStateTx } from '../_shared/itemStatusFlow.js';

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

function assertLoanDates({
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
      message: 'El prestamo requiere al menos un detail',
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

export const createLoanWithDetails = async function({
    user_id,
    period_id,
    booking_date,
    reservation_expires_at,
    estimated_return_date,
    observations,
    details,
    processed_by_user_id,
    _session_user_id,
  }) {
  const processContext = startProcessContext('createLoanWithDetails');
  

  const processedByUserId = Number(
    processed_by_user_id || _session_user_id || 0,
  );

  if (!user_id || !period_id || !booking_date || !reservation_expires_at) {
    throwDomainError({
      statusCode: 422,
      code: DOMAIN_ERROR_CODES.VALIDATION_ERROR,
      message: 'Faltan campos obligatorios para crear prestamo',
    });
  }

  if (!Number.isInteger(processedByUserId) || processedByUserId <= 0) {
    throwDomainError({
      statusCode: 422,
      code: DOMAIN_ERROR_CODES.VALIDATION_ERROR,
      message: 'processed_by_user_id es obligatorio',
    });
  }

  assertLoanDates({
    booking_date,
    reservation_expires_at,
    estimated_return_date,
  });
  const normalizedDetails = buildNormalizedDetails(details);

  const runtimeEnv = getRuntimeEnvSync();
  const maxActiveLoans = Number(runtimeEnv?.limits?.maxActiveLoansGlobal || 5);

  const dbms = new DBMS();
  await dbms.init();

  const client = await dbms.beginTransaction();

  try {
    await client.query('SET TRANSACTION ISOLATION LEVEL SERIALIZABLE');

    const periodResult = await client.query(
      `
        SELECT id, is_active, start_date, end_date
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

    const periodRow = periodResult.rows[0];
    if (!periodRow.is_active) {
      throwDomainError({
        statusCode: 422,
        code: DOMAIN_ERROR_CODES.VALIDATION_ERROR,
        message: 'No se puede crear prestamo en un periodo inactivo',
      });
    }

    const borrower = await client.query(
      `
        SELECT id, is_solvency, is_active
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
        message: 'Usuario no existe para prestamo',
      });
    }

    const borrowerRow = borrower.rows[0];
    if (!borrowerRow.is_active) {
      throwDomainError({
        statusCode: 422,
        code: DOMAIN_ERROR_CODES.VALIDATION_ERROR,
        message: 'Usuario inactivo no puede solicitar prestamo',
      });
    }
    if (!borrowerRow.is_solvency) {
      throwDomainError({
        statusCode: 409,
        code: DOMAIN_ERROR_CODES.CONFLICT,
        message: 'Usuario no solvente no puede solicitar prestamo',
      });
    }

    const overdueLoanResult = await client.query(
      `
        SELECT 1
        FROM public.movement
        WHERE user_id = $1
          AND type_id = (SELECT id FROM public.movement_type WHERE name = 'loan')
          AND actual_return_date IS NULL
          AND estimated_return_date < NOW()
        LIMIT 1
      `,
      [user_id],
    );

    if (overdueLoanResult.rowCount > 0) {
      throwDomainError({
        statusCode: 409,
        code: DOMAIN_ERROR_CODES.CONFLICT,
        message:
          'El usuario tiene prestamos vencidos y no puede generar nuevos prestamos',
      });
    }

    const activeLoanCountResult = await client.query(
      `
        SELECT COUNT(*)::int AS total
        FROM public.movement
        WHERE user_id = $1
          AND type_id = (SELECT id FROM public.movement_type WHERE name = 'loan')
          AND actual_return_date IS NULL
      `,
      [user_id],
    );

    const activeLoanCount = Number(activeLoanCountResult.rows[0].total || 0);
    if (activeLoanCount >= maxActiveLoans) {
      throwDomainError({
        statusCode: 409,
        code: DOMAIN_ERROR_CODES.CONFLICT,
        message: `Se alcanzo el limite de ${maxActiveLoans} prestamos activos por usuario`,
      });
    }

    const movementInsert = await client.query(
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
          (SELECT id FROM public.movement_type WHERE name = 'loan'),
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

    const loanId = movementInsert.rows[0].id;
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

      const stockRow = stockResult.rows[0];
      touchedItemIds.add(Number(stockRow.item_id));
      if (Number(stockRow.amount) < amount) {
        throwDomainError({
          statusCode: 409,
          code: DOMAIN_ERROR_CODES.CONFLICT,
          message: `Stock insuficiente en inventario ${inventoryId}`,
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
          loanId,
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

    const solvency = await recomputeUserSolvency({
      client,
      userId: user_id,
    });

    const auditId = await appendBusinessAudit({
      client,
      actorUserId: processedByUserId,
      method: 'createLoanWithDetails',
      entityName: 'movement',
      details: {
        loan_id: loanId,
        borrower_user_id: Number(user_id),
        detail_count: normalizedDetails.length,
      },
    });

    await dbms.commitTransaction(client);

    return {
      loan_id: loanId,
      detail_count: normalizedDetails.length,
      processed_by_user_id: processedByUserId,
      is_solvency: solvency.is_solvency,
      audit_id: auditId,
      status: 'loan_created',
      observability: buildProcessMetadata(processContext, 200),
    };
  } catch (err) {
    await dbms.rollbackTransaction(client);
    if (err?.code === '40001' || err?.code === '40P01') {
      throwDomainError({
        statusCode: 409,
        code: DOMAIN_ERROR_CODES.CONFLICT,
        message: 'Conflicto concurrente detectado al crear prestamo',
      });
    }
    if (err?.message?.includes('Stock insuficiente')) {
      rethrowAsDomainError(err, 'Conflicto de stock para crear prestamo');
    }
    rethrowAsDomainError(err, 'Error ejecutando createLoanWithDetails');
  } finally {
    await dbms.endTransaction(client);
  }
};
