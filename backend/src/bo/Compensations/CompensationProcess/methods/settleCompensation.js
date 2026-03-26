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
import { recomputeUserSolvency } from '../../../_shared/solvency.js';
import { appendBusinessAudit } from '../../../_shared/auditTrail.js';

function toOptionalIso(value) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throwDomainError({
      statusCode: 422,
      code: DOMAIN_ERROR_CODES.VALIDATION_ERROR,
      message: 'payment_date invalida',
    });
  }
  return date.toISOString();
}

export const settleCompensation = async function (params = {}) {
  const processContext = startProcessContext('settleCompensation');
  const {
    compensation_id,
    processed_by_user_id,
    _session_user_id,
    payment_method_type_id,
    amount_paid,
    payment_date,
    observations,
  } = params || {};

  const processedByUserId = Number(
    processed_by_user_id || _session_user_id || 0,
  );
  const compensationId = Number(compensation_id || 0);
  const paymentMethodTypeId = Number(payment_method_type_id || 0);

  if (!Number.isInteger(compensationId) || compensationId <= 0) {
    throwDomainError({
      statusCode: 422,
      code: DOMAIN_ERROR_CODES.VALIDATION_ERROR,
      message: 'compensation_id es obligatorio y debe ser entero positivo',
    });
  }

  if (!Number.isInteger(processedByUserId) || processedByUserId <= 0) {
    throwDomainError({
      statusCode: 422,
      code: DOMAIN_ERROR_CODES.VALIDATION_ERROR,
      message: 'processed_by_user_id es obligatorio y debe ser entero positivo',
    });
  }

  if (!Number.isInteger(paymentMethodTypeId) || paymentMethodTypeId <= 0) {
    throwDomainError({
      statusCode: 422,
      code: DOMAIN_ERROR_CODES.VALIDATION_ERROR,
      message:
        'payment_method_type_id es obligatorio y debe ser entero positivo',
    });
  }

  const paidAmount = Number(amount_paid);
  if (!Number.isFinite(paidAmount) || paidAmount <= 0) {
    throwDomainError({
      statusCode: 422,
      code: DOMAIN_ERROR_CODES.VALIDATION_ERROR,
      message: 'amount_paid debe ser numerico y mayor a cero',
    });
  }

  const normalizedPaymentDate = toOptionalIso(payment_date);

  const dbms = new DBMS();
  await dbms.init();
  const client = await dbms.beginTransaction();

  try {
    const compensationResult = await client.query(
      `
        SELECT id, borrower_user_id, amount_paid
        FROM public.compensation
        WHERE id = $1
          AND deleted_at IS NULL
        FOR UPDATE
      `,
      [compensationId],
    );

    if (compensationResult.rowCount === 0) {
      throwDomainError({
        statusCode: 404,
        code: DOMAIN_ERROR_CODES.NOT_FOUND,
        message: 'Compensacion no encontrada',
      });
    }

    const compensation = compensationResult.rows[0];
    const borrowerUserId = Number(compensation.borrower_user_id);

    await client.query(
      `
        UPDATE public.compensation
        SET processed_by_user_id = $2,
            payment_method_type_id = $3,
            amount_paid = $4,
            payment_date = COALESCE($5::timestamptz, NOW()),
            observations = COALESCE($6, observations),
            updated_at = NOW()
        WHERE id = $1
      `,
      [
        compensationId,
        processedByUserId,
        paymentMethodTypeId,
        paidAmount,
        normalizedPaymentDate,
        observations || null,
      ],
    );

    const solvency = await recomputeUserSolvency({
      client,
      userId: borrowerUserId,
    });

    const auditId = await appendBusinessAudit({
      client,
      actorUserId: processedByUserId,
      method: 'settleCompensation',
      entityName: 'compensation',
      details: {
        compensation_id: Number(compensation_id),
        borrower_user_id: borrowerUserId,
        amount_paid: paidAmount,
      },
    });

    await dbms.commitTransaction(client);

    return {
      compensation_id: compensationId,
      borrower_user_id: borrowerUserId,
      processed_by_user_id: processedByUserId,
      amount_paid: paidAmount,
      is_solvency: solvency.is_solvency,
      audit_id: auditId,
      status: 'settled',
      observability: buildProcessMetadata(processContext, 200),
    };
  } catch (err) {
    await dbms.rollbackTransaction(client);

    if (
      typeof err.message === 'string' &&
      err.message.toLowerCase().includes('violates foreign key')
    ) {
      throwDomainError({
        statusCode: 422,
        code: DOMAIN_ERROR_CODES.VALIDATION_ERROR,
        message: 'payment_method_type_id invalido',
      });
    }

    rethrowAsDomainError(err, 'Error ejecutando settleCompensation');
  } finally {
    await dbms.endTransaction(client);
  }
};
