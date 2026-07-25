import DBMS from "../../dbms/dbms.js";
import { msg } from "../../../utils/messages.js";

async function getStatusId(client, name) {
  const res = await client.query(
    `SELECT id FROM public.loan_status WHERE name = $1 LIMIT 1`,
    [name],
  );
  if (!res.rows[0]) {
    throw new Error(msg('loan_status_not_found', { name }));
  }
  return res.rows[0].id;
}

async function getItemStatusId(client, name) {
  const res = await client.query(
    `SELECT id FROM public.item_status WHERE name = $1 LIMIT 1`,
    [name],
  );
  return res.rows[0]?.id ?? null;
}

/**
 * Registra devolución parcial o total de un préstamo.
 * Body:
 * {
 *   loan_id,
 *   items: [{
 *     loan_item_id,
 *     returned_quantity?,
 *     return_condition_id?,
 *     fine?,
 *     observations?
 *   }]
 * }
 */
export const returnLoan = async function (params = {}) {
  const { loan_id, items = [] } = params;

  if (!loan_id) {
    throw new Error(msg('loan_id_required'));
  }
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error(msg('loan_return_items_required'));
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

    const availableStatusId = await getItemStatusId(client, "Disponible");
    const stockStatusId = await getItemStatusId(client, "Stock");
    const updatedItems = [];

    for (const line of items) {
      const loanItemId = Number(line.loan_item_id);
      if (!loanItemId) {
        throw new Error(msg('loan_item_id_required'));
      }

      const liRes = await client.query(
        `SELECT li.*, i.is_consumable, i.id AS item_id
         FROM public.loan_item li
         JOIN public.stock st ON st.id = li.stock_id
         JOIN public.item i ON i.id = st.item_id
         WHERE li.id = $1 AND li.loan_id = $2
         FOR UPDATE`,
        [loanItemId, loan_id],
      );
      const loanItem = liRes.rows[0];
      if (!loanItem) {
        throw new Error(msg('loan_item_not_in_loan', { loanItemId, loanId: loan_id }));
      }

      const pending = Number(loanItem.quantity) - Number(loanItem.returned_quantity);
      const returnedQty = Number(line.returned_quantity ?? pending);
      if (returnedQty <= 0 || returnedQty > pending) {
        throw new Error(
          msg('loan_return_quantity_invalid', { loanItemId, pending }),
        );
      }

      const newReturned = Number(loanItem.returned_quantity) + returnedQty;
      const fine = Number(line.fine ?? loanItem.fine ?? 0);

      const upd = await client.query(
        `UPDATE public.loan_item
         SET returned_quantity = $2,
             fine = $3,
             return_condition_id = COALESCE($4, return_condition_id),
             observations = COALESCE(NULLIF($5, ''), observations),
             updated_at = NOW()
         WHERE id = $1
         RETURNING *`,
        [
          loanItemId,
          newReturned,
          fine,
          line.return_condition_id || null,
          line.observations || "",
        ],
      );
      updatedItems.push(upd.rows[0]);

      await client.query(
        `UPDATE public.stock SET quantity = quantity + $2, updated_at = NOW() WHERE id = $1`,
        [loanItem.stock_id, returnedQty],
      );

      if (newReturned >= Number(loanItem.quantity)) {
        const restoreStatus = loanItem.is_consumable ? stockStatusId : availableStatusId;
        if (restoreStatus) {
          await client.query(
            `UPDATE public.item SET status_id = $2, updated_at = NOW()
             WHERE id = $1 AND deleted_at IS NULL`,
            [loanItem.item_id, restoreStatus],
          );
        }
      }
    }

    const pendingRes = await client.query(
      `SELECT COUNT(*)::int AS pending
       FROM public.loan_item
       WHERE loan_id = $1 AND returned_quantity < quantity`,
      [loan_id],
    );
    const stillPending = pendingRes.rows[0].pending > 0;

    let finalLoan = loan;
    if (!stillPending) {
      const returnedStatusId = await getStatusId(client, "returned");
      const closed = await client.query(
        `UPDATE public.loan
         SET status_id = $2, returned_at = NOW(), updated_at = NOW()
         WHERE id = $1
         RETURNING *`,
        [loan_id, returnedStatusId],
      );
      finalLoan = closed.rows[0];
    }

    await dbms.commitTransaction(client);
    return { ...finalLoan, items: updatedItems, fully_returned: !stillPending };
  } catch (err) {
    await dbms.rollbackTransaction(client);
    throw new Error(err.message);
  } finally {
    await dbms.endTransaction(client);
  }
};
