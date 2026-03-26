import DBMS from '../../../../dbms/dbms.js';
import { getRuntimeEnvSync } from '../../../../../config/env/runtime.js';
import {
  DOMAIN_ERROR_CODES,
  rethrowAsDomainError,
  throwDomainError,
} from '../../../_shared/domainError.js';
import {
  buildProcessMetadata,
  startProcessContext,
} from '../../../_shared/processObservability.js';
import { recomputeUserSolvency } from '../../../_shared/solvency.js';
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

function assertDates({
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

export const convertReservationToLoan = async function (params = {}) {
  const processContext = startProcessContext('convertReservationToLoan');
  const {
    reservation_id,
    booking_date,
    estimated_return_date,
    reservation_expires_at,
    observations,
    processed_by_user_id,
    _session_user_id,
  } = params || {};

  const processedByUserId = Number(
    processed_by_user_id || _session_user_id || 0,
  );

  if (!reservation_id || !booking_date || !reservation_expires_at) {
    throwDomainError({
      statusCode: 422,
      code: DOMAIN_ERROR_CODES.VALIDATION_ERROR,
      message:
        'reservation_id, booking_date y reservation_expires_at son obligatorios',
    });
  }

  if (!Number.isInteger(processedByUserId) || processedByUserId <= 0) {
    throwDomainError({
      statusCode: 422,
      code: DOMAIN_ERROR_CODES.VALIDATION_ERROR,
      message: 'processed_by_user_id es obligatorio',
    });
  }

  assertDates({ booking_date, reservation_expires_at, estimated_return_date });

  const runtimeEnv = getRuntimeEnvSync();
  const maxActiveLoans = Number(runtimeEnv?.limits?.maxActiveLoansGlobal || 5);

  const dbms = new DBMS();
  await dbms.init();
  const client = await dbms.beginTransaction();

  try {
    await client.query('SET TRANSACTION ISOLATION LEVEL SERIALIZABLE');

    const reserveMovement = await client.query(
      `
        SELECT id, user_id, period_id, reservation_expires_at, actual_return_date
        FROM public.movement
        WHERE id = $1
          AND type_id = (SELECT id FROM public.movement_type WHERE name = 'reserve')
        FOR UPDATE
      `,
      [reservation_id],
    );

    if (reserveMovement.rowCount === 0) {
      throwDomainError({
        statusCode: 404,
        code: DOMAIN_ERROR_CODES.NOT_FOUND,
        message: 'Reserva no encontrada',
      });
    }

    const reserve = reserveMovement.rows[0];
    if (reserve.actual_return_date) {
      throwDomainError({
        statusCode: 409,
        code: DOMAIN_ERROR_CODES.CONFLICT,
        message: 'La reserva ya fue cerrada',
      });
    }

    const isExpired =
      new Date(reserve.reservation_expires_at).getTime() < Date.now();
    if (isExpired) {
      throwDomainError({
        statusCode: 409,
        code: DOMAIN_ERROR_CODES.CONFLICT,
        message: 'La reserva ya expiro y no puede convertirse',
      });
    }

    const periodResult = await client.query(
      `
        SELECT id, is_active
        FROM public.period
        WHERE id = $1
        FOR UPDATE
      `,
      [reserve.period_id],
    );

    if (periodResult.rowCount === 0) {
      throwDomainError({
        statusCode: 404,
        code: DOMAIN_ERROR_CODES.NOT_FOUND,
        message: `Periodo no encontrado: ${reserve.period_id}`,
      });
    }

    if (!periodResult.rows[0].is_active) {
      throwDomainError({
        statusCode: 422,
        code: DOMAIN_ERROR_CODES.VALIDATION_ERROR,
        message: 'No se puede convertir reserva en un periodo inactivo',
      });
    }

    const borrower = await client.query(
      `
        SELECT id, is_solvency, is_active
        FROM public."user"
        WHERE id = $1
        FOR UPDATE
      `,
      [reserve.user_id],
    );

    if (borrower.rowCount === 0) {
      throwDomainError({
        statusCode: 404,
        code: DOMAIN_ERROR_CODES.NOT_FOUND,
        message: 'Usuario no existe para convertir reserva',
      });
    }

    const borrowerRow = borrower.rows[0];
    if (!borrowerRow.is_active) {
      throwDomainError({
        statusCode: 422,
        code: DOMAIN_ERROR_CODES.VALIDATION_ERROR,
        message: 'Usuario inactivo no puede convertir reserva',
      });
    }
    if (!borrowerRow.is_solvency) {
      throwDomainError({
        statusCode: 409,
        code: DOMAIN_ERROR_CODES.CONFLICT,
        message: 'Usuario no solvente no puede convertir reserva a prestamo',
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
      [reserve.user_id],
    );

    if (overdueLoanResult.rowCount > 0) {
      throwDomainError({
        statusCode: 409,
        code: DOMAIN_ERROR_CODES.CONFLICT,
        message:
          'El usuario tiene prestamos vencidos y no puede convertir reserva a prestamo',
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
      [reserve.user_id],
    );

    const activeLoanCount = Number(activeLoanCountResult.rows[0]?.total || 0);
    if (activeLoanCount >= maxActiveLoans) {
      throwDomainError({
        statusCode: 409,
        code: DOMAIN_ERROR_CODES.CONFLICT,
        message: `Se alcanzo el limite de ${maxActiveLoans} prestamos activos por usuario`,
      });
    }

    const reserveDetails = await client.query(
      `
        SELECT md.inventory_id, md.amount, md.observations, inv.item_id
        FROM public.movement_detail md
        JOIN public.inventory inv ON inv.id = md.inventory_id
        WHERE movement_id = $1
      `,
      [reservation_id],
    );

    if (reserveDetails.rowCount === 0) {
      throwDomainError({
        statusCode: 409,
        code: DOMAIN_ERROR_CODES.CONFLICT,
        message: 'Reserva sin detail no puede convertirse a prestamo',
      });
    }

    const loanInsert = await client.query(
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
        reserve.user_id,
        reserve.period_id,
        booking_date,
        reservation_expires_at,
        estimated_return_date || null,
        observations || `Converted from reservation ${reservation_id}`,
      ],
    );

    const loanId = loanInsert.rows[0].id;
    const touchedItemIds = new Set();

    for (const detail of reserveDetails.rows) {
      touchedItemIds.add(Number(detail.item_id));
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
          detail.amount,
          detail.observations || null,
          detail.inventory_id,
          loanId,
        ],
      );
    }

    await client.query(
      `
        UPDATE public.movement
        SET actual_return_date = NOW(),
            observations = COALESCE($2, observations),
            updated_at = NOW()
        WHERE id = $1
      `,
      [reservation_id, `Reservation converted to loan ${loanId}`],
    );

    for (const itemId of touchedItemIds) {
      await syncItemOperationalStateTx({
        client,
        itemId,
      });
    }

    const solvency = await recomputeUserSolvency({
      client,
      userId: reserve.user_id,
    });

    const auditId = await appendBusinessAudit({
      client,
      actorUserId: processedByUserId,
      method: 'convertReservationToLoan',
      entityName: 'movement',
      details: {
        reservation_id: Number(reservation_id),
        loan_id: Number(loanId),
        borrower_user_id: Number(reserve.user_id),
      },
    });

    await dbms.commitTransaction(client);

    return {
      loan_id: loanId,
      reservation_id,
      processed_by_user_id: processedByUserId,
      is_solvency: solvency.is_solvency,
      audit_id: auditId,
      status: 'reservation_converted',
      observability: buildProcessMetadata(processContext, 200),
    };
  } catch (err) {
    await dbms.rollbackTransaction(client);
    if (err?.code === '40001' || err?.code === '40P01') {
      throwDomainError({
        statusCode: 409,
        code: DOMAIN_ERROR_CODES.CONFLICT,
        message: 'Conflicto concurrente detectado al convertir reserva',
      });
    }
    rethrowAsDomainError(err, 'Error ejecutando convertReservationToLoan');
  } finally {
    await dbms.endTransaction(client);
  }
};
