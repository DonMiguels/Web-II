import DBMS from "../../dbms/dbms.js";

/**
 * Actualiza Location.
 *
 * @param {number} [id] - Valor de `id`.
 * @param {string} [name] - Valor de `name`.
 * @param {string} [description] - Valor de `description`.
 * @param {number} [parent_id] - Valor de `parent_id`.
 * @returns {Promise<Object|null>}
 * @throws {Error} Si la operación falla o los datos son inválidos.
 */
export const updateLocation = async function ({id, name, description, parent_id}) {
  const dbms = new DBMS();
  await dbms.init();
  try {
    const res = await dbms.executeNamedQuery({
      nameQuery: "updateLocation",
      params: {
        id: id ?? 0,
        name: name ?? '',
        description: description ?? '',
        parent_id: parent_id ?? 0,
      },
    });
    return res?.rows?.[0] ?? null;
  } catch (err) {
    throw new Error(err.message);
  }
};
