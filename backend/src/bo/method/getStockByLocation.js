import DBMS from "../../dbms/dbms.js";

/**
 * Obtiene StockByLocation.
 *
 * @param {number} [location_id] - Valor de `location_id`.
 * @returns {Promise<Array<Object>>}
 * @throws {Error} Si la operación falla o los datos son inválidos.
 */
export const getStockByLocation = async function ({location_id}) {
  const dbms = new DBMS();
  await dbms.init();
  try {
    const res = await dbms.executeNamedQuery({
      nameQuery: "getStockByLocation",
      params: {
        location_id: location_id ?? 0,
      },
    });
    return res?.rows ?? [];
  } catch (err) {
    throw new Error(err.message);
  }
};
