import DBMS from "../../dbms/dbms.js";

/**
 * Agrega KitItem.
 *
 * @param {number} [kit_id] - Valor de `kit_id`.
 * @param {number} [item_id] - Valor de `item_id`.
 * @param {number} [quantity] - Valor de `quantity`.
 * @returns {Promise<Object|null>}
 * @throws {Error} Si la operación falla o los datos son inválidos.
 */
export const addKitItem = async function ({kit_id, item_id, quantity}) {
  const dbms = new DBMS();
  await dbms.init();
  try {
    const res = await dbms.executeNamedQuery({
      nameQuery: "insertKitItem",
      params: {
        kit_id: kit_id ?? 0,
        item_id: item_id ?? 0,
        quantity: quantity ?? 0,
      },
    });
    return res?.rows?.[0] ?? null;
  } catch (err) {
    throw new Error(err.message);
  }
};
