import { DOMAIN_ERROR_CODES, throwDomainError } from './domainError.js';

async function resolveBusinessAuditTypeId(client) {
  const preferred = await client.query(
    `
      SELECT id
      FROM public.audit_type
      WHERE name = 'business'
        AND deleted_at IS NULL
      LIMIT 1
    `,
  );

  if (preferred.rowCount > 0) {
    return Number(preferred.rows[0].id);
  }

  const fallback = await client.query(
    `
      SELECT id
      FROM public.audit_type
      WHERE deleted_at IS NULL
      ORDER BY id ASC
      LIMIT 1
    `,
  );

  if (fallback.rowCount > 0) {
    return Number(fallback.rows[0].id);
  }

  throwDomainError({
    statusCode: 500,
    code: DOMAIN_ERROR_CODES.UNEXPECTED_ERROR,
    message: 'No existe audit_type disponible para registrar auditoria',
  });
}

export async function appendBusinessAudit({
  client,
  actorUserId,
  method,
  entityName,
  details,
}) {
  const normalizedActor = Number(actorUserId);
  if (!Number.isInteger(normalizedActor) || normalizedActor <= 0) {
    throwDomainError({
      statusCode: 422,
      code: DOMAIN_ERROR_CODES.VALIDATION_ERROR,
      message: 'actorUserId invalido para auditoria',
    });
  }

  const typeId = await resolveBusinessAuditTypeId(client);

  const result = await client.query(
    `
      INSERT INTO public.audit (
        entity_name,
        method,
        details,
        user_id,
        type_id,
        event_at,
        updated_at
      )
      VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
      RETURNING id
    `,
    [
      String(entityName || 'business_process'),
      String(method || 'unknown_method'),
      JSON.stringify(details || {}),
      normalizedActor,
      typeId,
    ],
  );

  return Number(result.rows[0].id);
}
