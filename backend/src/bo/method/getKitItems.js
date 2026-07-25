import DBMS from "../../dbms/dbms.js";

/**
 * Obtiene KitItems.
 *
 * @param {number} [kit_id] - Valor de `kit_id`.
 * @returns {Promise<Array<Object>>}
 * @throws {Error} Si la operación falla o los datos son inválidos.
 */
export const getKitItems = async function ({kit_id}) {
  const dbms = new DBMS();
  await dbms.init();
  try {
    const res = await dbms.executeNamedQuery({
      nameQuery: "getKitItems",
      params: {
        kit_id: kit_id ?? 0,
      },
    });
    return res?.rows ?? [];
  } catch (err) {
    throw new Error(err.message);
  }
};
