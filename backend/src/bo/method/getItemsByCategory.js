import DBMS from "../../dbms/dbms.js";

/**
 * Obtiene ItemsByCategory.
 *
 * @param {string} [category_name] - Valor de `category_name`.
 * @returns {Promise<Array<Object>>}
 * @throws {Error} Si la operación falla o los datos son inválidos.
 */
export const getItemsByCategory = async function ({category_name}) {
  const dbms = new DBMS();
  await dbms.init();
  try {
    const res = await dbms.executeNamedQuery({
      nameQuery: "getItemsByCategory",
      params: {
        category_name: category_name ?? '',
      },
    });
    return res?.rows ?? [];
  } catch (err) {
    throw new Error(err.message);
  }
};
