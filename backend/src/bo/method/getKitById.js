import DBMS from "../../dbms/dbms.js";

/**
 * Obtiene KitById.
 *
 * @param {number} [id] - Valor de `id`.
 * @returns {Promise<Array<Object>>}
 * @throws {Error} Si la operación falla o los datos son inválidos.
 */
export const getKitById = async function ({id}) {
  const dbms = new DBMS();
  await dbms.init();
  try {
    const res = await dbms.executeNamedQuery({
      nameQuery: "getKitById",
      params: {
        id: id ?? 0,
      },
    });
    return res?.rows?.[0] ?? null;
  } catch (err) {
    throw new Error(err.message);
  }
};
