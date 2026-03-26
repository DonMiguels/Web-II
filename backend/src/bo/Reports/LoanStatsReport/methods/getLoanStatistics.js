import DBMS from '../../../../dbms/dbms.js';

function toOptionalIso(value, fieldName) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new Error(`${fieldName} invalida`);
  }
  return date.toISOString();
}

export const getLoanStatistics = async function (params = {}) {
  const { period_id, booking_date_from, booking_date_to, pending_state } =
    params || {};

  const dateFrom = toOptionalIso(booking_date_from, 'booking_date_from');
  const dateTo = toOptionalIso(booking_date_to, 'booking_date_to');

  const normalizedPendingState = String(pending_state || 'all')
    .trim()
    .toLowerCase();
  const validStates = new Set(['all', 'open', 'closed']);
  if (!validStates.has(normalizedPendingState)) {
    throw new Error('pending_state invalido');
  }

  const normalizedPeriodId = period_id ? Number(period_id) : null;

  const dbms = new DBMS();
  await dbms.init();

  const summarySql = `
    WITH base_loan AS (
      SELECT
        m.id AS loan_id,
        m.period_id,
        m.booking_date,
        m.estimated_return_date,
        m.actual_return_date,
        CASE WHEN m.actual_return_date IS NULL THEN 'open' ELSE 'closed' END AS loan_state,
        CASE
          WHEN m.actual_return_date IS NOT NULL AND m.actual_return_date > m.estimated_return_date THEN 1
          ELSE 0
        END AS returned_late
      FROM public.movement m
      WHERE m.type_id = (SELECT id FROM public.movement_type WHERE name = 'loan')
        AND ($1::bigint IS NULL OR m.period_id = $1::bigint)
        AND ($2::timestamptz IS NULL OR m.booking_date >= $2::timestamptz)
        AND ($3::timestamptz IS NULL OR m.booking_date <= $3::timestamptz)
    )
    SELECT
      COUNT(*)::int AS total_loans,
      SUM(CASE WHEN loan_state = 'open' THEN 1 ELSE 0 END)::int AS open_loans,
      SUM(CASE WHEN loan_state = 'closed' THEN 1 ELSE 0 END)::int AS closed_loans,
      SUM(returned_late)::int AS late_returns,
      AVG(
        CASE
          WHEN actual_return_date IS NOT NULL
          THEN EXTRACT(EPOCH FROM (actual_return_date - booking_date)) / 86400.0
          ELSE NULL
        END
      )::numeric(10,2) AS avg_return_days
    FROM base_loan
    WHERE ($4::text = 'all' OR loan_state = $4::text)
  `;

  const topItemsSql = `
    WITH base_loan AS (
      SELECT
        m.id AS loan_id,
        CASE WHEN m.actual_return_date IS NULL THEN 'open' ELSE 'closed' END AS loan_state
      FROM public.movement m
      WHERE m.type_id = (SELECT id FROM public.movement_type WHERE name = 'loan')
        AND ($1::bigint IS NULL OR m.period_id = $1::bigint)
        AND ($2::timestamptz IS NULL OR m.booking_date >= $2::timestamptz)
        AND ($3::timestamptz IS NULL OR m.booking_date <= $3::timestamptz)
    )
    SELECT
      i.id AS item_id,
      i.code AS item_code,
      i.name AS item_name,
      COUNT(DISTINCT bl.loan_id)::int AS total_loans,
      SUM(md.amount)::int AS total_loaned_amount
    FROM base_loan bl
    JOIN public.movement_detail md ON md.movement_id = bl.loan_id
    JOIN public.inventory inv ON inv.id = md.inventory_id
    JOIN public.item i ON i.id = inv.item_id
    WHERE ($4::text = 'all' OR bl.loan_state = $4::text)
    GROUP BY i.id, i.code, i.name
    ORDER BY total_loaned_amount DESC, total_loans DESC, i.id ASC
    LIMIT 10
  `;

  const [summaryResult, topItemsResult] = await Promise.all([
    dbms.query(summarySql, [
      normalizedPeriodId,
      dateFrom,
      dateTo,
      normalizedPendingState,
    ]),
    dbms.query(topItemsSql, [
      normalizedPeriodId,
      dateFrom,
      dateTo,
      normalizedPendingState,
    ]),
  ]);

  const summaryRow = summaryResult?.rows?.[0] || {};
  const topItemsRows = topItemsResult?.rows || [];

  return {
    filters: {
      period_id: normalizedPeriodId,
      booking_date_from: dateFrom,
      booking_date_to: dateTo,
      pending_state: normalizedPendingState,
    },
    summary: {
      total_loans: Number(summaryRow.total_loans || 0),
      open_loans: Number(summaryRow.open_loans || 0),
      closed_loans: Number(summaryRow.closed_loans || 0),
      late_returns: Number(summaryRow.late_returns || 0),
      avg_return_days: Number(summaryRow.avg_return_days || 0),
    },
    top_items: topItemsRows.map((row) => ({
      item_id: Number(row.item_id),
      item_code: row.item_code,
      item_name: row.item_name,
      total_loans: Number(row.total_loans),
      total_loaned_amount: Number(row.total_loaned_amount),
    })),
  };
};
