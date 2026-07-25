import DBMS from "../../dbms/dbms.js";

/**
 * Crea Kit.
 *
 * @param {string} [name] - Valor de `name`.
 * @param {string} [description] - Valor de `description`.
 * @returns {Promise<Object|null>}
 * @throws {Error} Si la operación falla o los datos son inválidos.
 */
export const createKit = async function ({name, description}) {
  const dbms = new DBMS();
  await dbms.init();
  try {
    const res = await dbms.executeNamedQuery({
      nameQuery: "insertKit",
      params: {
        name: name ?? '',
        description: description ?? '',
      },
    });
    return res?.rows?.[0] ?? null;
  } catch (err) {
    throw new Error(err.message);
  }
};
