import DBMS from "../../dbms/dbms.js";

/**
 * Actualiza Maintenance.
 *
 * @param {number} [id] - Valor de `id`.
 * @param {string} [end_at] - Valor de `end_at`.
 * @param {string} [description] - Valor de `description`.
 * @param {number} [cost] - Valor de `cost`.
 * @returns {Promise<Object|null>}
 * @throws {Error} Si la operación falla o los datos son inválidos.
 */
export const updateMaintenance = async function ({id, end_at, description, cost}) {
  const dbms = new DBMS();
  await dbms.init();
  try {
    const res = await dbms.executeNamedQuery({
      nameQuery: "updateMaintenance",
      params: {
        id: id ?? 0,
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
