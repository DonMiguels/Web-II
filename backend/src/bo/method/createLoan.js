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
 * Crea un préstamo con sus ítems y descuenta stock.
 * Body:
 * {
 *   borrower_user_id,
 *   processed_by_user_id?,
 *   due_at,
 *   booked_at?,
 *   observations?,
 *   status?: 'active' | 'reserved',
 *   items: [{ stock_id, quantity }]
 * }
 */
export const createLoan = async function (params = {}) {
  const {
    borrower_user_id,
    processed_by_user_id,
    due_at,
    booked_at,
    observations,
    status = "active",
    items = [],
  } = params;

  if (!borrower_user_id || !due_at) {
    throw new Error(msg('loan_borrower_due_required'));
  }
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error(msg('loan_items_required'));
  }

  const dbms = new DBMS();
  await dbms.init();
  const client = await dbms.beginTransaction();

  try {
    const statusId = await getStatusId(client, status);
    const occupiedStatusId = await getItemStatusId(client, "Ocupado");
    const assignedStatusId = await getItemStatusId(client, "Asignado");

    const loanRes = await client.query(
      `INSERT INTO public.loan
        (borrower_user_id, processed_by_user_id, status_id, booked_at, due_at, observations)
       VALUES ($1, $2, $3, COALESCE($4::timestamptz, NOW()), $5::timestamptz, NULLIF($6, ''))
       RETURNING *`,
      [
        borrower_user_id,
        processed_by_user_id || null,
        statusId,
        booked_at || null,
        due_at,
        observations || "",
      ],
    );
    const loan = loanRes.rows[0];
    const loanItems = [];

    for (const line of items) {
      const stockId = Number(line.stock_id);
      const quantity = Number(line.quantity ?? 1);
      if (!stockId || quantity <= 0) {
        throw new Error(msg('loan_item_stock_quantity_required'));
      }

      const stockRes = await client.query(
        `SELECT st.id, st.quantity, st.item_id, i.is_consumable, i.name
         FROM public.stock st
         JOIN public.item i ON i.id = st.item_id
         WHERE st.id = $1
         FOR UPDATE`,
        [stockId],
      );
      const stock = stockRes.rows[0];
      if (!stock) {
        throw new Error(msg('stock_not_found', { stockId }));
      }
      if (stock.quantity < quantity) {
        throw new Error(
          msg('stock_insufficient', {
            name: stock.name,
            available: stock.quantity,
            requested: quantity,
          }),
        );
      }

      await client.query(
        `UPDATE public.stock SET quantity = quantity - $2, updated_at = NOW() WHERE id = $1`,
        [stockId, quantity],
      );

      const liRes = await client.query(
        `INSERT INTO public.loan_item (loan_id, stock_id, quantity, observations)
         VALUES ($1, $2, $3, NULLIF($4, ''))
         RETURNING *`,
        [loan.id, stockId, quantity, line.observations || ""],
      );
      loanItems.push(liRes.rows[0]);

      if (!stock.is_consumable && occupiedStatusId) {
        await client.query(
          `UPDATE public.item SET status_id = $2, updated_at = NOW()
           WHERE id = $1 AND deleted_at IS NULL`,
          [stock.item_id, occupiedStatusId],
        );
      } else if (stock.is_consumable && assignedStatusId) {
        await client.query(
          `UPDATE public.item SET status_id = $2, updated_at = NOW()
           WHERE id = $1 AND deleted_at IS NULL`,
          [stock.item_id, assignedStatusId],
        );
      }
    }

    await dbms.commitTransaction(client);
    return { ...loan, items: loanItems };
  } catch (err) {
    await dbms.rollbackTransaction(client);
    throw new Error(err.message);
  } finally {
    await dbms.endTransaction(client);
  }
};
