import DBMS from "../../dbms/dbms.js";

/**
 * Obtiene MaintenanceById.
 *
 * @param {number} [id] - Valor de `id`.
 * @returns {Promise<Array<Object>>}
 * @throws {Error} Si la operación falla o los datos son inválidos.
 */
export const getMaintenanceById = async function ({id}) {
  const dbms = new DBMS();
  await dbms.init();
  try {
    const res = await dbms.executeNamedQuery({
      nameQuery: "getMaintenanceById",
      params: {
        id: id ?? 0,
      },
    });
    return res?.rows?.[0] ?? null;
  } catch (err) {
    throw new Error(err.message);
  }
};
