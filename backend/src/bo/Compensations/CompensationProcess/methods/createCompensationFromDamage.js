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

function normalizeAmount(value, defaultValue = 0) {
  if (value === undefined || value === null || value === '') {
    return defaultValue;
  }

  const amount = Number(value);
  if (!Number.isFinite(amount) || amount < 0) {
    throwDomainError({
      statusCode: 422,
      code: DOMAIN_ERROR_CODES.VALIDATION_ERROR,
      message: 'amount_paid debe ser numerico y no negativo',
    });
  }

  return amount;
}

export const createCompensationFromDamage = async function (params = {}) {
  const processContext = startProcessContext('createCompensationFromDamage');
  const {
    movement_detail_id,
    processed_by_user_id,
    _session_user_id,
    borrower_user_id,
    payment_method_type_id,
    amount_paid,
    payment_date,
    observations,
  } = params || {};

  const processedByUserId = Number(
    processed_by_user_id || _session_user_id || 0,
  );

  const movementDetailId = Number(movement_detail_id || 0);
  if (!Number.isInteger(movementDetailId) || movementDetailId <= 0) {
    throwDomainError({
      statusCode: 422,
      code: DOMAIN_ERROR_CODES.VALIDATION_ERROR,
      message: 'movement_detail_id es obligatorio y debe ser entero positivo',
    });
  }

  if (!Number.isInteger(processedByUserId) || processedByUserId <= 0) {
    throwDomainError({
      statusCode: 422,
      code: DOMAIN_ERROR_CODES.VALIDATION_ERROR,
      message: 'processed_by_user_id es obligatorio y debe ser entero positivo',
    });
  }

  const dbms = new DBMS();
  await dbms.init();
  const client = await dbms.beginTransaction();

  try {
    const detailResult = await client.query(
      `
        SELECT
          md.id,
          md.movement_id,
          m.user_id AS borrower_user_id,
          m.type_id
        FROM public.movement_detail md
        JOIN public.movement m ON m.id = md.movement_id
        WHERE md.id = $1
        FOR UPDATE
      `,
      [movementDetailId],
    );

    if (detailResult.rowCount === 0) {
      throwDomainError({
        statusCode: 404,
        code: DOMAIN_ERROR_CODES.NOT_FOUND,
        message: 'movement_detail_id no existe',
      });
    }

    const detail = detailResult.rows[0];

    const movementType = await client.query(
      `SELECT name FROM public.movement_type WHERE id = $1 LIMIT 1`,
      [detail.type_id],
    );

    const movementTypeName = movementType.rows[0]?.name;
    if (movementTypeName !== 'loan') {
      throwDomainError({
        statusCode: 422,
        code: DOMAIN_ERROR_CODES.VALIDATION_ERROR,
        message: 'La compensacion solo se puede asociar a details de prestamos',
      });
    }

    const resolvedBorrowerId = Number(
      borrower_user_id || detail.borrower_user_id,
    );

    if (!Number.isInteger(resolvedBorrowerId) || resolvedBorrowerId <= 0) {
      throwDomainError({
        statusCode: 422,
        code: DOMAIN_ERROR_CODES.VALIDATION_ERROR,
        message: 'borrower_user_id invalido para crear compensacion',
      });
    }

    const duplicatePending = await client.query(
      `
        SELECT id
        FROM public.compensation
        WHERE movement_detail_id = $1
          AND deleted_at IS NULL
          AND amount_paid = 0
        LIMIT 1
      `,
      [movement_detail_id],
    );

    if (duplicatePending.rowCount > 0) {
      throwDomainError({
        statusCode: 409,
        code: DOMAIN_ERROR_CODES.CONFLICT,
        message:
          'Ya existe una compensacion pendiente para este detail de prestamo',
      });
    }

    const methodTypeId = Number(payment_method_type_id || 0);
    let resolvedMethodTypeId = methodTypeId;

    if (!resolvedMethodTypeId) {
      const defaultMethod = await client.query(
        `
          SELECT id
          FROM public.payment_method_type
          WHERE name = 'cash'
          LIMIT 1
        `,
      );

      if (defaultMethod.rowCount === 0) {
        throwDomainError({
          statusCode: 404,
          code: DOMAIN_ERROR_CODES.NOT_FOUND,
          message: 'No existe payment_method_type por defecto',
        });
      }

      resolvedMethodTypeId = Number(defaultMethod.rows[0].id);
    }

    const initialAmount = normalizeAmount(amount_paid, 0);

    const inserted = await client.query(
      `
        INSERT INTO public.compensation (
          movement_detail_id,
          processed_by_user_id,
          borrower_user_id,
          payment_method_type_id,
          amount_paid,
          payment_date,
          observations,
          updated_at
        )
        VALUES ($1, $2, $3, $4, $5, COALESCE($6::timestamptz, NOW()), $7, NOW())
        RETURNING id, borrower_user_id, amount_paid, payment_date
      `,
      [
        movement_detail_id,
        processedByUserId,
        resolvedBorrowerId,
        resolvedMethodTypeId,
        initialAmount,
        payment_date || null,
        observations || null,
      ],
    );

    const solvency = await recomputeUserSolvency({
      client,
      userId: resolvedBorrowerId,
    });

    const compensationId = Number(inserted.rows[0].id);
    const auditId = await appendBusinessAudit({
      client,
      actorUserId: processedByUserId,
      method: 'createCompensationFromDamage',
      entityName: 'compensation',
      details: {
        compensation_id: compensationId,
        movement_detail_id: movementDetailId,
        borrower_user_id: resolvedBorrowerId,
      },
    });

    await dbms.commitTransaction(client);

    return {
      compensation_id: compensationId,
      borrower_user_id: Number(inserted.rows[0].borrower_user_id),
      processed_by_user_id: processedByUserId,
      amount_paid: Number(inserted.rows[0].amount_paid),
      is_solvency: solvency.is_solvency,
      audit_id: auditId,
      payment_date: inserted.rows[0].payment_date,
      status: initialAmount > 0 ? 'created_with_payment' : 'created_pending',
      observability: buildProcessMetadata(processContext, 200),
    };
  } catch (err) {
    await dbms.rollbackTransaction(client);
    rethrowAsDomainError(err, 'Error ejecutando createCompensationFromDamage');
  } finally {
    await dbms.endTransaction(client);
  }
};
