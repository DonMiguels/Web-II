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

function toOptionalPositiveInt(value, fieldName) {
  if (value === undefined || value === null || value === '') return null;
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throwDomainError({
      statusCode: 422,
      code: DOMAIN_ERROR_CODES.VALIDATION_ERROR,
      message: `${fieldName} debe ser un entero positivo`,
    });
  }
  return parsed;
}

export const getReservationsByUser = async function (params = {}) {
  const processContext = startProcessContext('getReservationsByUser');
  const { user_id, only_open = false, limit = 100, offset = 0 } = params || {};

  const normalizedUserId = toOptionalPositiveInt(user_id, 'user_id');
  const normalizedLimit = toOptionalPositiveInt(limit, 'limit') || 100;
  const normalizedOffset = Number(offset);

  if (!Number.isInteger(normalizedOffset) || normalizedOffset < 0) {
    throwDomainError({
      statusCode: 422,
      code: DOMAIN_ERROR_CODES.VALIDATION_ERROR,
      message: 'offset debe ser un entero mayor o igual a cero',
    });
  }

  const dbms = new DBMS();
  await dbms.init();

  try {
    const result = await dbms.query(
      `
        SELECT
          m.id AS reservation_id,
          m.user_id,
          m.period_id,
          m.booking_date,
          m.reservation_expires_at,
          m.estimated_return_date,
          m.actual_return_date,
          m.observations,
          m.created_at,
          m.updated_at,
          COUNT(md.id)::int AS detail_count,
          COALESCE(SUM(md.amount), 0)::int AS total_reserved_amount,
          CASE
            WHEN m.actual_return_date IS NULL AND m.reservation_expires_at >= NOW() THEN 'open'
            WHEN m.actual_return_date IS NULL AND m.reservation_expires_at < NOW() THEN 'expired_pending_close'
            WHEN m.actual_return_date IS NOT NULL AND COALESCE(m.observations, '') ILIKE '%converted to loan%' THEN 'converted'
            WHEN m.actual_return_date IS NOT NULL AND COALESCE(m.observations, '') ILIKE '%expired by job%' THEN 'expired'
            WHEN m.actual_return_date IS NOT NULL AND COALESCE(m.observations, '') ILIKE '%cancelled%' THEN 'cancelled'
            ELSE 'closed'
          END AS reservation_state
        FROM public.movement m
        LEFT JOIN public.movement_detail md ON md.movement_id = m.id
        WHERE m.type_id = (SELECT id FROM public.movement_type WHERE name = 'reserve')
          AND ($1::bigint IS NULL OR m.user_id = $1::bigint)
          AND ($2::boolean = FALSE OR (m.actual_return_date IS NULL AND m.reservation_expires_at >= NOW()))
        GROUP BY m.id
        ORDER BY m.booking_date DESC, m.id DESC
        LIMIT $3
        OFFSET $4
      `,
      [normalizedUserId, Boolean(only_open), normalizedLimit, normalizedOffset],
    );

    return {
      total: result.rowCount,
      reservations: result.rows,
      observability: buildProcessMetadata(processContext, 200),
    };
  } catch (err) {
    rethrowAsDomainError(err, 'Error ejecutando getReservationsByUser');
  }
};
