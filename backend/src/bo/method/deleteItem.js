import DBMS from "../../dbms/dbms.js";

/**
 * Elimina (lógico o físico según corresponda) Item.
 *
 * @param {number} [id] - Valor de `id`.
 * @returns {Promise<Object|null>}
 * @throws {Error} Si la operación falla o los datos son inválidos.
 */
export const deleteItem = async function ({id}) {
  const dbms = new DBMS();
  await dbms.init();
  try {
    const res = await dbms.executeNamedQuery({
      nameQuery: "softDeleteItem",
      params: {
        id: id ?? 0,
      },
    });
    return res?.rows?.[0] ?? null;
  } catch (err) {
    throw new Error(err.message);
  }
};
