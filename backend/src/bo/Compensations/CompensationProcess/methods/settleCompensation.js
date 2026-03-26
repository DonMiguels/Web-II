import DBMS from '../../../../dbms/dbms.js';

function throwBusinessError(statusCode, message) {
  throw new Error(
    JSON.stringify({
      statusCode,
      message,
    }),
  );
}

function toOptionalIso(value) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new Error('payment_date invalida');
  }
  return date.toISOString();
}

export const settleCompensation = async function (params = {}) {
  const {
    compensation_id,
    processed_by_user_id,
    payment_method_type_id,
    amount_paid,
    payment_date,
    observations,
  } = params || {};

  if (!compensation_id || !processed_by_user_id || !payment_method_type_id) {
    throw new Error(
      'compensation_id, processed_by_user_id y payment_method_type_id son obligatorios',
    );
  }

  const paidAmount = Number(amount_paid);
  if (!Number.isFinite(paidAmount) || paidAmount <= 0) {
    throw new Error('amount_paid debe ser numerico y mayor a cero');
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
      [compensation_id],
    );

    if (compensationResult.rowCount === 0) {
      throw new Error('Compensacion no encontrada');
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
        compensation_id,
        processed_by_user_id,
        payment_method_type_id,
        paidAmount,
        normalizedPaymentDate,
        observations || null,
      ],
    );

    const pendingCompensation = await client.query(
      `
        SELECT 1
        FROM public.compensation
        WHERE borrower_user_id = $1
          AND deleted_at IS NULL
          AND amount_paid <= 0
        LIMIT 1
      `,
      [borrowerUserId],
    );

    const overdueLoan = await client.query(
      `
        SELECT 1
        FROM public.movement m
        WHERE m.user_id = $1
          AND m.type_id = (SELECT id FROM public.movement_type WHERE name = 'loan')
          AND m.actual_return_date IS NULL
          AND m.estimated_return_date < NOW()
        LIMIT 1
      `,
      [borrowerUserId],
    );

    const isSolvent =
      pendingCompensation.rowCount === 0 && overdueLoan.rowCount === 0;

    await client.query(
      `
        UPDATE public."user"
        SET is_solvency = $2,
            updated_at = NOW()
        WHERE id = $1
      `,
      [borrowerUserId, isSolvent],
    );

    await dbms.commitTransaction(client);

    return {
      compensation_id: Number(compensation_id),
      borrower_user_id: borrowerUserId,
      amount_paid: paidAmount,
      is_solvency: isSolvent,
      status: 'settled',
    };
  } catch (err) {
    await dbms.rollbackTransaction(client);

    if (
      typeof err.message === 'string' &&
      err.message.toLowerCase().includes('violates foreign key')
    ) {
      throwBusinessError(422, 'payment_method_type_id invalido');
    }

    throw new Error(err.message);
  } finally {
    await dbms.endTransaction(client);
  }
};
