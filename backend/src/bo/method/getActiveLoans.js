import DBMS from "../../dbms/dbms.js";

/**
 * Obtiene ActiveLoans.
 *
 * @param {Object} [params={}] - Parámetros de la operación (puede estar vacío).
 * @returns {Promise<Array<Object>>}
 * @throws {Error} Si la operación falla o los datos son inválidos.
 */
export const getActiveLoans = async function () {
  const dbms = new DBMS();
  await dbms.init();
  try {
    const res = await dbms.executeNamedQuery({
      nameQuery: "getActiveLoans",
      params: {},
    });
    return res?.rows ?? [];
  } catch (err) {
    throw new Error(err.message);
  }
};
