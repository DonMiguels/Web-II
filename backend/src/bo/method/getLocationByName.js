import DBMS from "../../dbms/dbms.js";

/**
 * Obtiene LocationByName.
 *
 * @param {string} [name] - Valor de `name`.
 * @returns {Promise<Object|null>}
 * @throws {Error} Si la operación falla o los datos son inválidos.
 */
export const getLocationByName = async function ({name}) {
  const dbms = new DBMS();
  await dbms.init();
  try {
    const res = await dbms.executeNamedQuery({
      nameQuery: "getLocationByName",
      params: {
        name: name ?? '',
      },
    });
    return res?.rows?.[0] ?? null;
  } catch (err) {
    throw new Error(err.message);
  }
};
