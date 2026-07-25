import DBMS from "../../dbms/dbms.js";

/**
 * Obtiene StockByItem.
 *
 * @param {number} [item_id] - Valor de `item_id`.
 * @returns {Promise<Array<Object>>}
 * @throws {Error} Si la operación falla o los datos son inválidos.
 */
export const getStockByItem = async function ({item_id}) {
  const dbms = new DBMS();
  await dbms.init();
  try {
    const res = await dbms.executeNamedQuery({
      nameQuery: "getStockByItem",
      params: {
        item_id: item_id ?? 0,
      },
    });
    return res?.rows ?? [];
  } catch (err) {
    throw new Error(err.message);
  }
};
