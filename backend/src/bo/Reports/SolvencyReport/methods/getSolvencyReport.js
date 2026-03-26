import DBMS from '../../../../dbms/dbms.js';

function toOptionalIso(value, fieldName) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new Error(`${fieldName} invalida`);
  }
  return date.toISOString();
}

export const getSolvencyReport = async function (params = {}) {
  const { period_id, as_of_date, status, user_id } = params || {};

  const normalizedStatus = String(status || 'all')
    .trim()
    .toLowerCase();
  const validStatuses = new Set(['all', 'solvent', 'non_solvent']);
  if (!validStatuses.has(normalizedStatus)) {
    throw new Error('status invalido');
  }

  const asOfDate = toOptionalIso(as_of_date, 'as_of_date');
  const normalizedPeriodId = period_id ? Number(period_id) : null;
  const normalizedUserId = user_id ? Number(user_id) : null;

  const dbms = new DBMS();
  await dbms.init();

  const sql = `
    WITH user_scope AS (
      SELECT u.id, u.name, u.email, u.is_solvency
      FROM public."user" u
      WHERE u.deleted_at IS NULL
        AND ($1::bigint IS NULL OR u.id = $1::bigint)
    ),
    overdue AS (
      SELECT m.user_id, COUNT(*)::int AS overdue_loans
      FROM public.movement m
      WHERE m.type_id = (SELECT id FROM public.movement_type WHERE name = 'loan')
        AND m.actual_return_date IS NULL
        AND m.estimated_return_date < COALESCE($2::timestamptz, NOW())
        AND ($3::bigint IS NULL OR m.period_id = $3::bigint)
      GROUP BY m.user_id
    ),
    pending_comp AS (
      SELECT c.borrower_user_id AS user_id, COUNT(*)::int AS pending_compensations
      FROM public.compensation c
      LEFT JOIN public.movement_detail md ON md.id = c.movement_detail_id
      LEFT JOIN public.movement m ON m.id = md.movement_id
      WHERE c.deleted_at IS NULL
        AND c.amount_paid <= 0
        AND ($3::bigint IS NULL OR m.period_id = $3::bigint)
      GROUP BY c.borrower_user_id
    )
    SELECT
      us.id AS user_id,
      us.name AS user_name,
      us.email,
      us.is_solvency,
      COALESCE(o.overdue_loans, 0) AS overdue_loans,
      COALESCE(pc.pending_compensations, 0) AS pending_compensations,
      (COALESCE(o.overdue_loans, 0) = 0 AND COALESCE(pc.pending_compensations, 0) = 0) AS computed_solvency
    FROM user_scope us
    LEFT JOIN overdue o ON o.user_id = us.id
    LEFT JOIN pending_comp pc ON pc.user_id = us.id
    WHERE (
      $4::text = 'all'
      OR ($4::text = 'solvent' AND us.is_solvency = TRUE)
      OR ($4::text = 'non_solvent' AND us.is_solvency = FALSE)
    )
    ORDER BY us.id ASC
  `;

  const result = await dbms.query(sql, [
    normalizedUserId,
    asOfDate,
    normalizedPeriodId,
    normalizedStatus,
  ]);

  const rows = result?.rows || [];

  return {
    filters: {
      period_id: normalizedPeriodId,
      as_of_date: asOfDate,
      status: normalizedStatus,
      user_id: normalizedUserId,
    },
    summary: {
      total_users: rows.length,
      solvent_users: rows.filter((r) => r.is_solvency).length,
      non_solvent_users: rows.filter((r) => !r.is_solvency).length,
      inconsistent_users: rows.filter(
        (r) => Boolean(r.is_solvency) !== Boolean(r.computed_solvency),
      ).length,
    },
    users: rows.map((row) => ({
      user_id: Number(row.user_id),
      user_name: row.user_name,
      email: row.email,
      is_solvency: row.is_solvency,
      overdue_loans: Number(row.overdue_loans),
      pending_compensations: Number(row.pending_compensations),
      computed_solvency: row.computed_solvency,
    })),
  };
};
