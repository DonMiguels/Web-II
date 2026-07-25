import DBMS from "../../dbms/dbms.js";

/**
 * Crea Maintenance.
 *
 * @param {number} [item_id] - Valor de `item_id`.
 * @param {number} [stock_id] - Valor de `stock_id`.
 * @param {number} [processed_by_user_id] - Valor de `processed_by_user_id`.
 * @param {string} [start_at] - Valor de `start_at`.
 * @param {string} [end_at] - Valor de `end_at`.
 * @param {string} [description] - Valor de `description`.
 * @param {number} [cost] - Valor de `cost`.
 * @returns {Promise<Object|null>}
 * @throws {Error} Si la operación falla o los datos son inválidos.
 */
export const createMaintenance = async function ({item_id, stock_id, processed_by_user_id, start_at, end_at, description, cost}) {
  const dbms = new DBMS();
  await dbms.init();
  try {
    const res = await dbms.executeNamedQuery({
      nameQuery: "insertMaintenance",
      params: {
        item_id: item_id ?? 0,
        stock_id: stock_id ?? 0,
        processed_by_user_id: processed_by_user_id ?? 0,
        start_at: start_at ?? '',
        end_at: end_at ?? '',
        description: description ?? '',
        cost: cost ?? 0,
      },
    });
    return res?.rows?.[0] ?? null;
  } catch (err) {
    throw new Error(err.message);
  }
};
