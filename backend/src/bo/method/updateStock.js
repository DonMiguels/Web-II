import DBMS from "../../dbms/dbms.js";

/**
 * Actualiza Stock.
 *
 * @param {number} [id] - Valor de `id`.
 * @param {number} [item_id] - Valor de `item_id`.
 * @param {number} [location_id] - Valor de `location_id`.
 * @param {number} [quantity] - Valor de `quantity`.
 * @returns {Promise<Object|null>}
 * @throws {Error} Si la operación falla o los datos son inválidos.
 */
export const updateStock = async function ({id, item_id, location_id, quantity}) {
  const dbms = new DBMS();
  await dbms.init();
  try {
    const res = await dbms.executeNamedQuery({
      nameQuery: "updateStock",
      params: {
        id: id ?? 0,
        item_id: item_id ?? 0,
        location_id: location_id ?? 0,
        quantity: quantity ?? 0,
      },
    });
    return res?.rows?.[0] ?? null;
  } catch (err) {
    throw new Error(err.message);
  }
};
