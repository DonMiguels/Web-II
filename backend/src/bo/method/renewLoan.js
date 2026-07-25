import DBMS from "../../dbms/dbms.js";
import { msg } from "../../../utils/messages.js";

/**
 * Renueva la fecha de devolución de un préstamo activo/vencido.
 * Body: { loan_id, due_at, observations? }
 */
export const renewLoan = async function ({ loan_id, due_at, observations } = {}) {
  if (!loan_id || !due_at) {
    throw new Error(msg('loan_renew_required'));
  }

  const dbms = new DBMS();
  await dbms.init();
  const client = await dbms.beginTransaction();

  try {
    const loanRes = await client.query(
      `SELECT l.*, ls.name AS status_name
       FROM public.loan l
       JOIN public.loan_status ls ON ls.id = l.status_id
       WHERE l.id = $1
       FOR UPDATE`,
      [loan_id],
    );
    const loan = loanRes.rows[0];
    if (!loan) {
      throw new Error(msg('loan_not_found', { loanId: loan_id }));
    }
    if (!["active", "reserved", "overdue"].includes(loan.status_name)) {
      throw new Error(msg('loan_renew_invalid_status', { status: loan.status_name }));
    }

    const activeStatus = await client.query(
      `SELECT id FROM public.loan_status WHERE name = 'active' LIMIT 1`,
    );
    const activeStatusId = activeStatus.rows[0]?.id ?? loan.status_id;

    const upd = await client.query(
      `UPDATE public.loan
       SET due_at = $2::timestamptz,
           status_id = $3,
           observations = COALESCE(NULLIF($4, ''), observations),
           updated_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [loan_id, due_at, activeStatusId, observations || ""],
    );

    await dbms.commitTransaction(client);
    return upd.rows[0];
  } catch (err) {
    await dbms.rollbackTransaction(client);
    throw new Error(err.message);
  } finally {
    await dbms.endTransaction(client);
  }
};
