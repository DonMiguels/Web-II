import DBMS from '../../../../dbms/dbms.js';

function normalizeDate(value) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new Error('Fecha de filtro invalida');
  }
  return date.toISOString();
}

function normalizeState(value) {
  if (!value) return 'all';
  const state = String(value).trim().toLowerCase();
  const allowed = new Set(['all', 'pending_on_time', 'pending_overdue']);
  if (!allowed.has(state)) {
    throw new Error('pending_state invalido');
  }
  return state;
}

function normalizeProfile(value) {
  return String(value || '').trim().toLowerCase();
}

function toRowsByLoan(rows) {
  const grouped = new Map();

  for (const row of rows) {
    const loanId = Number(row.loan_id);
    if (!grouped.has(loanId)) {
      grouped.set(loanId, {
        loan_id: loanId,
        user: {
          user_id: Number(row.user_id),
          name: row.user_name,
        },
        booking_date: row.booking_date,
        estimated_return_date: row.estimated_return_date,
        days_overdue: Number(row.days_overdue || 0),
        pending_state: row.pending_state,
        totals: {
          detail_count: 0,
          total_loaned_amount: 0,
          total_returned_amount: 0,
          total_pending_amount: 0,
        },
        details: [],
      });
    }

    const loan = grouped.get(loanId);

    const detail = {
      movement_detail_id: Number(row.movement_detail_id),
      inventory_id: Number(row.inventory_id),
      item_id: Number(row.item_id),
      item_code: row.item_code,
      item_name: row.item_name,
      item_type: row.item_type,
      amount_loaned: Number(row.amount_loaned),
      amount_returned: Number(row.amount_returned),
      amount_pending: Number(row.amount_pending),
    };

    loan.details.push(detail);
    loan.totals.detail_count += 1;
    loan.totals.total_loaned_amount += detail.amount_loaned;
    loan.totals.total_returned_amount += detail.amount_returned;
    loan.totals.total_pending_amount += detail.amount_pending;
  }

  return [...grouped.values()];
}

export const getPendingLoansByUser = async function (params = {}) {
  const {
    user_id,
    booking_date_from,
    booking_date_to,
    pending_state,
    item_type,
    search_text,
    _session_user_id,
    _session_profile,
  } = params || {};

  const sessionProfile = normalizeProfile(_session_profile);
  const sessionUserId = Number(_session_user_id || 0);
  const targetUserId = Number(user_id || 0);

  if (!targetUserId || !Number.isInteger(targetUserId) || targetUserId <= 0) {
    throw new Error('user_id es obligatorio para el reporte');
  }

  if (sessionProfile === 'user' && targetUserId !== sessionUserId) {
    throw new Error(
      JSON.stringify({
        statusCode: 403,
        message: 'Perfil user solo puede consultar su propio reporte',
      }),
    );
  }

  const normalizedState = normalizeState(pending_state);
  const dateFrom = normalizeDate(booking_date_from);
  const dateTo = normalizeDate(booking_date_to);

  const dbms = new DBMS();
  await dbms.init();

  const sql = `
    WITH detail_balance AS (
      SELECT
        ld.id AS movement_detail_id,
        ld.movement_id AS loan_id,
        ld.inventory_id,
        i.id AS item_id,
        i.code AS item_code,
        i.name AS item_name,
        ct.name AS item_type,
        ld.amount::int AS amount_loaned,
        COALESCE(SUM(rd.amount), 0)::int AS amount_returned,
        (ld.amount - COALESCE(SUM(rd.amount), 0))::int AS amount_pending
      FROM public.movement_detail ld
      JOIN public.inventory inv ON inv.id = ld.inventory_id
      JOIN public.item i ON i.id = inv.item_id
      LEFT JOIN public.category c ON c.id = i.category_id
      LEFT JOIN public.category_type ct ON ct.id = c.type_id
      LEFT JOIN public.movement_detail rd ON rd.source_movement_detail_id = ld.id
      WHERE ld.movement_id IN (
        SELECT m.id
        FROM public.movement m
        WHERE m.type_id = (SELECT id FROM public.movement_type WHERE name = 'loan')
          AND m.actual_return_date IS NULL
          AND m.user_id = $1
          AND ($2::timestamptz IS NULL OR m.booking_date >= $2::timestamptz)
          AND ($3::timestamptz IS NULL OR m.booking_date <= $3::timestamptz)
      )
      GROUP BY ld.id, ld.movement_id, ld.inventory_id, i.id, i.code, i.name, ct.name, ld.amount
    )
    SELECT
      m.id AS loan_id,
      m.user_id,
      u.name AS user_name,
      m.booking_date,
      m.estimated_return_date,
      CASE
        WHEN m.estimated_return_date < NOW() THEN 'pending_overdue'
        ELSE 'pending_on_time'
      END AS pending_state,
      CASE
        WHEN m.estimated_return_date < NOW() THEN GREATEST(0, FLOOR(EXTRACT(EPOCH FROM (NOW() - m.estimated_return_date)) / 86400))::int
        ELSE 0
      END AS days_overdue,
      db.movement_detail_id,
      db.inventory_id,
      db.item_id,
      db.item_code,
      db.item_name,
      db.item_type,
      db.amount_loaned,
      db.amount_returned,
      db.amount_pending
    FROM public.movement m
    JOIN public."user" u ON u.id = m.user_id
    JOIN detail_balance db ON db.loan_id = m.id
    WHERE m.type_id = (SELECT id FROM public.movement_type WHERE name = 'loan')
      AND m.actual_return_date IS NULL
      AND m.user_id = $1
      AND db.amount_pending > 0
      AND (
        $4::text = 'all'
        OR ($4::text = 'pending_overdue' AND m.estimated_return_date < NOW())
        OR ($4::text = 'pending_on_time' AND m.estimated_return_date >= NOW())
      )
      AND ($5::text IS NULL OR db.item_type = $5::text)
      AND (
        $6::text IS NULL
        OR db.item_code ILIKE '%' || $6::text || '%'
        OR db.item_name ILIKE '%' || $6::text || '%'
      )
    ORDER BY m.booking_date DESC, m.id DESC, db.movement_detail_id ASC
  `;

  const result = await dbms.query(sql, [
    targetUserId,
    dateFrom,
    dateTo,
    normalizedState,
    item_type || null,
    search_text || null,
  ]);

  const rows = result?.rows || [];
  const loans = toRowsByLoan(rows);

  const summary = {
    user_id: targetUserId,
    total_loans: loans.length,
    total_items: loans.reduce((acc, loan) => acc + loan.totals.detail_count, 0),
    total_pending_amount: loans.reduce(
      (acc, loan) => acc + loan.totals.total_pending_amount,
      0,
    ),
    total_overdue: loans.filter((loan) => loan.pending_state === 'pending_overdue')
      .length,
  };

  return {
    summary,
    loans,
  };
};
