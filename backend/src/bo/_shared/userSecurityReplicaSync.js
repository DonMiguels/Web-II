import { DOMAIN_ERROR_CODES, throwDomainError } from './domainError.js';

function valuesMatch(expected, actual) {
  if (expected === undefined) return true;
  if (expected === null) return actual === null;

  if (typeof expected === 'boolean') {
    return Boolean(actual) === expected;
  }

  if (typeof expected === 'number') {
    return Number(actual) === Number(expected);
  }

  return String(actual ?? '') === String(expected);
}

export async function assertSecurityReplicaSynced({
  dbms,
  userId,
  expected = {},
}) {
  const normalizedUserId = Number(userId || 0);
  if (!Number.isInteger(normalizedUserId) || normalizedUserId <= 0) {
    throwDomainError({
      statusCode: 422,
      code: DOMAIN_ERROR_CODES.VALIDATION_ERROR,
      message: 'userId invalido para sincronizacion de replica de seguridad',
    });
  }

  const replicaResult = await dbms.query(
    `
      SELECT
        id,
        name,
        email,
        is_solvency,
        is_active,
        person_id,
        deleted_at
      FROM public."user"
      WHERE id = $1
      LIMIT 1
    `,
    [normalizedUserId],
  );

  if (!replicaResult || replicaResult.rowCount === 0) {
    throwDomainError({
      statusCode: 500,
      code: DOMAIN_ERROR_CODES.UNEXPECTED_ERROR,
      message: 'Replica de seguridad no disponible para el usuario canonico',
      details: {
        user_id: normalizedUserId,
      },
    });
  }

  const row = replicaResult.rows[0];

  const checks = [
    ['name', expected.name],
    ['email', expected.email],
    ['is_solvency', expected.is_solvency],
    ['is_active', expected.is_active],
    ['person_id', expected.person_id],
  ];

  for (const [field, expectedValue] of checks) {
    if (!valuesMatch(expectedValue, row[field])) {
      throwDomainError({
        statusCode: 409,
        code: DOMAIN_ERROR_CODES.CONFLICT,
        message: `Replica de seguridad desalineada en campo ${field}`,
        details: {
          user_id: normalizedUserId,
          field,
          expected: expectedValue,
          actual: row[field],
        },
      });
    }
  }

  return {
    user_id: normalizedUserId,
    synced: true,
    synced_at: new Date().toISOString(),
  };
}
