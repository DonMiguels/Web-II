import DBMS from "../../dbms/dbms.js";

/**
 * Actualiza Kit.
 *
 * @param {number} [id] - Valor de `id`.
 * @param {string} [name] - Valor de `name`.
 * @param {string} [description] - Valor de `description`.
 * @param {boolean} [is_active] - Valor de `is_active`.
 * @returns {Promise<Object|null>}
 * @throws {Error} Si la operación falla o los datos son inválidos.
 */
export const updateKit = async function ({id, name, description, is_active}) {
  const dbms = new DBMS();
  await dbms.init();
  try {
    const res = await dbms.executeNamedQuery({
      nameQuery: "updateKit",
      params: {
        id: id ?? 0,
        name: name ?? '',
        description: description ?? '',
        is_active: is_active ?? true,
      },
    });
    return res?.rows?.[0] ?? null;
  } catch (err) {
    throw new Error(err.message);
  }
};
