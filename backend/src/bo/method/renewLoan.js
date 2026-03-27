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

const DEFAULT_MAX_LOAN_RENEWALS = 2;

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

export const renewLoan = async function({
    loan_id,
    estimated_return_date,
    observations,
    processed_by_user_id,
    _session_user_id,
  }) {
  const processContext = startProcessContext('renewLoan');
  

  const processedByUserId = Number(
    processed_by_user_id || _session_user_id || 0,
  );

  if (!loan_id || !estimated_return_date) {
    throwDomainError({
      statusCode: 422,
      code: DOMAIN_ERROR_CODES.VALIDATION_ERROR,
      message: 'loan_id y estimated_return_date son obligatorios',
    });
  }

  if (!Number.isInteger(processedByUserId) || processedByUserId <= 0) {
    throwDomainError({
      statusCode: 422,
      code: DOMAIN_ERROR_CODES.VALIDATION_ERROR,
      message: 'processed_by_user_id es obligatorio',
    });
  }

  const nextEstimatedReturnDate = parseDateStrict(
    estimated_return_date,
    'estimated_return_date',
  );

  const runtimeEnv = getRuntimeEnvSync();
  const maxLoanRenewals = Number(
    runtimeEnv?.limits?.maxLoanRenewals || DEFAULT_MAX_LOAN_RENEWALS,
  );

  const dbms = new DBMS();
  await dbms.init();
  const client = await dbms.beginTransaction();

  try {
    await client.query('SET TRANSACTION ISOLATION LEVEL SERIALIZABLE');

    const loanResult = await client.query(
      `
        SELECT id, user_id, booking_date, estimated_return_date, actual_return_date, period_id, renewal_count
        FROM public.movement
        WHERE id = $1
          AND type_id = (SELECT id FROM public.movement_type WHERE name = 'loan')
        FOR UPDATE
      `,
      [loan_id],
    );

    if (loanResult.rowCount === 0) {
      throwDomainError({
        statusCode: 404,
        code: DOMAIN_ERROR_CODES.NOT_FOUND,
        message: 'Prestamo no encontrado',
      });
    }

    const loanRow = loanResult.rows[0];

    if (loanRow.actual_return_date) {
      throwDomainError({
        statusCode: 409,
        code: DOMAIN_ERROR_CODES.CONFLICT,
        message: 'No se puede renovar un prestamo cerrado',
      });
    }

    const now = new Date();
    if (
      loanRow.estimated_return_date &&
      new Date(loanRow.estimated_return_date) < now
    ) {
      throwDomainError({
        statusCode: 409,
        code: DOMAIN_ERROR_CODES.CONFLICT,
        message: 'No se puede renovar un prestamo vencido',
      });
    }

    const currentEstimatedReturnDate = parseDateStrict(
      loanRow.estimated_return_date,
      'current_estimated_return_date',
    );
    if (nextEstimatedReturnDate <= currentEstimatedReturnDate) {
      throwDomainError({
        statusCode: 422,
        code: DOMAIN_ERROR_CODES.VALIDATION_ERROR,
        message:
          'estimated_return_date debe ser mayor a la fecha de devolucion actual',
      });
    }

    const bookingDate = parseDateStrict(loanRow.booking_date, 'booking_date');
    if (nextEstimatedReturnDate < bookingDate) {
      throwDomainError({
        statusCode: 422,
        code: DOMAIN_ERROR_CODES.VALIDATION_ERROR,
        message: 'estimated_return_date no puede ser menor que booking_date',
      });
    }

    const periodResult = await client.query(
      `
        SELECT id, is_active
        FROM public.period
        WHERE id = $1
        FOR SHARE
      `,
      [loanRow.period_id],
    );

    if (periodResult.rowCount === 0) {
      throwDomainError({
        statusCode: 404,
        code: DOMAIN_ERROR_CODES.NOT_FOUND,
        message: `Periodo no encontrado: ${loanRow.period_id}`,
      });
    }

    if (!periodResult.rows[0].is_active) {
      throwDomainError({
        statusCode: 422,
        code: DOMAIN_ERROR_CODES.VALIDATION_ERROR,
        message: 'No se puede renovar un prestamo en periodo inactivo',
      });
    }

    if (Number(loanRow.renewal_count || 0) >= maxLoanRenewals) {
      throwDomainError({
        statusCode: 409,
        code: DOMAIN_ERROR_CODES.CONFLICT,
        message: `Se alcanzo el limite de ${maxLoanRenewals} renovaciones por prestamo`,
      });
    }

    const updated = await client.query(
      `
        UPDATE public.movement
        SET estimated_return_date = $2,
            observations = COALESCE($3, observations),
            renewal_count = renewal_count + 1,
            updated_at = NOW()
        WHERE id = $1
        RETURNING id AS loan_id, estimated_return_date, renewal_count
      `,
      [loan_id, estimated_return_date, observations || null],
    );

    const solvency = await recomputeUserSolvency({
      client,
      userId: loanRow.user_id,
    });

    const auditId = await appendBusinessAudit({
      client,
      actorUserId: processedByUserId,
      method: 'renewLoan',
      entityName: 'movement',
      details: {
        loan_id: Number(loan_id),
        borrower_user_id: Number(loanRow.user_id),
        renewal_count: Number(updated.rows[0].renewal_count),
      },
    });

    await dbms.commitTransaction(client);
    return {
      ...updated.rows[0],
      processed_by_user_id: processedByUserId,
      is_solvency: solvency.is_solvency,
      audit_id: auditId,
      status: 'loan_renewed',
      observability: buildProcessMetadata(processContext, 200),
    };
  } catch (err) {
    await dbms.rollbackTransaction(client);
    if (err?.code === '40001' || err?.code === '40P01') {
      throwDomainError({
        statusCode: 409,
        code: DOMAIN_ERROR_CODES.CONFLICT,
        message: 'Conflicto concurrente detectado al renovar prestamo',
      });
    }
    rethrowAsDomainError(err, 'Error ejecutando renewLoan');
  } finally {
    await dbms.endTransaction(client);
  }
};
