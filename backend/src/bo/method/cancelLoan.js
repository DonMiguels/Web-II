import DBMS from "../../dbms/dbms.js";
import { msg } from "../../../utils/messages.js";

/**
 * Cancela un préstamo reserved/active sin ítems entregados o devolviendo stock.
 * Body: { loan_id, observations? }
 */
export const cancelLoan = async function ({ loan_id, observations } = {}) {
  if (!loan_id) {
    throw new Error(msg('loan_id_required'));
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
    if (["returned", "cancelled"].includes(loan.status_name)) {
      throw new Error(msg('loan_already_closed', { status: loan.status_name }));
    }

    const itemsRes = await client.query(
      `SELECT li.*, i.is_consumable, i.id AS item_id
       FROM public.loan_item li
       JOIN public.stock st ON st.id = li.stock_id
       JOIN public.item i ON i.id = st.item_id
       WHERE li.loan_id = $1
       FOR UPDATE`,
      [loan_id],
    );

    const availableStatus = await client.query(
      `SELECT id FROM public.item_status WHERE name = 'Disponible' LIMIT 1`,
    );
    const stockStatus = await client.query(
      `SELECT id FROM public.item_status WHERE name = 'Stock' LIMIT 1`,
    );
    const availableStatusId = availableStatus.rows[0]?.id ?? null;
    const stockStatusId = stockStatus.rows[0]?.id ?? null;

    for (const li of itemsRes.rows) {
      const pending = Number(li.quantity) - Number(li.returned_quantity);
      if (pending > 0) {
        await client.query(
          `UPDATE public.stock SET quantity = quantity + $2, updated_at = NOW() WHERE id = $1`,
          [li.stock_id, pending],
        );
        await client.query(
          `UPDATE public.loan_item
           SET returned_quantity = quantity, updated_at = NOW()
           WHERE id = $1`,
          [li.id],
        );
        const restoreStatus = li.is_consumable ? stockStatusId : availableStatusId;
        if (restoreStatus) {
          await client.query(
            `UPDATE public.item SET status_id = $2, updated_at = NOW() WHERE id = $1`,
            [li.item_id, restoreStatus],
          );
        }
      }
    }

    const cancelled = await client.query(
      `SELECT id FROM public.loan_status WHERE name = 'cancelled' LIMIT 1`,
    );
    const cancelledId = cancelled.rows[0]?.id;
    if (!cancelledId) {
      throw new Error(msg('loan_cancel_status_missing'));
    }

    const upd = await client.query(
      `UPDATE public.loan
       SET status_id = $2,
           observations = COALESCE(NULLIF($3, ''), observations),
           updated_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [loan_id, cancelledId, observations || ""],
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
