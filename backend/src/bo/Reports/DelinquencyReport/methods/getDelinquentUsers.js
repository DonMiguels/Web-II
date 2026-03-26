import DBMS from '../../../../dbms/dbms.js';

function toOptionalIso(value, fieldName) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new Error(`${fieldName} invalida`);
  }
  return date.toISOString();
}

export const getDelinquentUsers = async function (params = {}) {
  const {
    period_id,
    booking_date_from,
    booking_date_to,
    status,
    min_days_overdue,
  } = params || {};

  const dateFrom = toOptionalIso(booking_date_from, 'booking_date_from');
  const dateTo = toOptionalIso(booking_date_to, 'booking_date_to');

  const normalizedStatus = String(status || 'all')
    .trim()
    .toLowerCase();
  const validStatuses = new Set([
    'all',
    'with_compensation',
    'without_compensation',
  ]);
  if (!validStatuses.has(normalizedStatus)) {
    throw new Error('status invalido');
  }

  const normalizedPeriodId = period_id ? Number(period_id) : null;
  const minDays = Number(min_days_overdue || 0);
  if (!Number.isInteger(minDays) || minDays < 0) {
    throw new Error('min_days_overdue invalido');
  }

  const dbms = new DBMS();
  await dbms.init();

  const sql = `
    WITH overdue_loan AS (
      SELECT
        m.id AS loan_id,
        m.user_id,
        m.period_id,
        m.booking_date,
        m.estimated_return_date,
        GREATEST(0, FLOOR(EXTRACT(EPOCH FROM (NOW() - m.estimated_return_date)) / 86400))::int AS days_overdue
      FROM public.movement m
      WHERE m.type_id = (SELECT id FROM public.movement_type WHERE name = 'loan')
        AND m.actual_return_date IS NULL
        AND m.estimated_return_date < NOW()
        AND ($1::bigint IS NULL OR m.period_id = $1::bigint)
        AND ($2::timestamptz IS NULL OR m.booking_date >= $2::timestamptz)
        AND ($3::timestamptz IS NULL OR m.booking_date <= $3::timestamptz)
    ),
    debt_signal AS (
      SELECT
        ol.user_id,
        COUNT(*)::int AS overdue_loans,
        MAX(ol.days_overdue)::int AS max_days_overdue,
        SUM(CASE WHEN c.id IS NOT NULL AND c.deleted_at IS NULL THEN 1 ELSE 0 END)::int AS compensations_linked
      FROM overdue_loan ol
      LEFT JOIN public.movement_detail md ON md.movement_id = ol.loan_id
      LEFT JOIN public.compensation c ON c.movement_detail_id = md.id
      GROUP BY ol.user_id
    )
    SELECT
      u.id AS user_id,
      u.name AS user_name,
      u.email,
      ds.overdue_loans,
      ds.max_days_overdue,
      ds.compensations_linked,
      CASE WHEN ds.compensations_linked > 0 THEN 'with_compensation' ELSE 'without_compensation' END AS compensation_status
    FROM debt_signal ds
    JOIN public."user" u ON u.id = ds.user_id
    WHERE ds.max_days_overdue >= $4::int
      AND (
        $5::text = 'all'
        OR ($5::text = 'with_compensation' AND ds.compensations_linked > 0)
        OR ($5::text = 'without_compensation' AND ds.compensations_linked = 0)
      )
    ORDER BY ds.max_days_overdue DESC, ds.overdue_loans DESC, u.id ASC
  `;

  const result = await dbms.query(sql, [
    normalizedPeriodId,
    dateFrom,
    dateTo,
    minDays,
    normalizedStatus,
  ]);

  const rows = result?.rows || [];

  return {
    filters: {
      period_id: normalizedPeriodId,
      booking_date_from: dateFrom,
      booking_date_to: dateTo,
      status: normalizedStatus,
      min_days_overdue: minDays,
    },
    summary: {
      total_users: rows.length,
      users_with_compensation: rows.filter(
        (r) => r.compensation_status === 'with_compensation',
      ).length,
      users_without_compensation: rows.filter(
        (r) => r.compensation_status === 'without_compensation',
      ).length,
    },
    users: rows.map((row) => ({
      user_id: Number(row.user_id),
      user_name: row.user_name,
      email: row.email,
      overdue_loans: Number(row.overdue_loans),
      max_days_overdue: Number(row.max_days_overdue),
      compensations_linked: Number(row.compensations_linked),
      compensation_status: row.compensation_status,
    })),
  };
};
