import { DOMAIN_ERROR_CODES, throwDomainError } from './domainError.js';

function toPositiveInt(value, fieldName) {
  const normalized = Number(value);
  if (!Number.isInteger(normalized) || normalized <= 0) {
    throwDomainError({
      statusCode: 422,
      code: DOMAIN_ERROR_CODES.VALIDATION_ERROR,
      message: `${fieldName} debe ser un entero positivo`,
    });
  }
  return normalized;
}

export async function recomputeUserSolvency({ client, userId }) {
  const normalizedUserId = toPositiveInt(userId, 'user_id');

  const userResult = await client.query(
    `
      SELECT id
      FROM public."user"
      WHERE id = $1
        AND deleted_at IS NULL
      FOR UPDATE
    `,
    [normalizedUserId],
  );

  if (userResult.rowCount === 0) {
    throwDomainError({
      statusCode: 404,
      code: DOMAIN_ERROR_CODES.NOT_FOUND,
      message: `Usuario no encontrado para recalculo de solvencia: ${normalizedUserId}`,
    });
  }

  const pendingCompensation = await client.query(
    `
      SELECT COUNT(*)::int AS total
      FROM public.compensation
      WHERE borrower_user_id = $1
        AND deleted_at IS NULL
        AND amount_paid <= 0
    `,
    [normalizedUserId],
  );

  const overdueLoan = await client.query(
    `
      SELECT COUNT(*)::int AS total
      FROM public.movement m
      WHERE m.user_id = $1
        AND m.type_id = (SELECT id FROM public.movement_type WHERE name = 'loan')
        AND m.actual_return_date IS NULL
        AND m.estimated_return_date < NOW()
    `,
    [normalizedUserId],
  );

  const pendingCompensations = Number(pendingCompensation.rows[0].total || 0);
  const overdueLoans = Number(overdueLoan.rows[0].total || 0);
  const isSolvent = pendingCompensations === 0 && overdueLoans === 0;

  await client.query(
    `
      UPDATE public."user"
      SET is_solvency = $2,
          updated_at = NOW()
      WHERE id = $1
    `,
    [normalizedUserId, isSolvent],
  );

  return {
    user_id: normalizedUserId,
    is_solvency: isSolvent,
    pending_compensations: pendingCompensations,
    overdue_loans: overdueLoans,
  };
}
