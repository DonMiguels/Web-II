import DBMS from "../../dbms/dbms.js";

/**
 * Crea Item.
 *
 * @param {string} [code] - Valor de `code`.
 * @param {string} [name] - Valor de `name`.
 * @param {string} [description] - Valor de `description`.
 * @param {string} [brand] - Valor de `brand`.
 * @param {string} [model] - Valor de `model`.
 * @param {number} [category_id] - Valor de `category_id`.
 * @param {number} [condition_id] - Valor de `condition_id`.
 * @param {number} [status_id] - Valor de `status_id`.
 * @param {boolean} [is_consumable] - Valor de `is_consumable`.
 * @param {number} [cost] - Valor de `cost`.
 * @param {string} [acquisition_date] - Valor de `acquisition_date`.
 * @returns {Promise<Object|null>}
 * @throws {Error} Si la operación falla o los datos son inválidos.
 */
export const createItem = async function ({code, name, description, brand, model, category_id, condition_id, status_id, is_consumable, cost, acquisition_date}) {
  const dbms = new DBMS();
  await dbms.init();
  try {
    const res = await dbms.executeNamedQuery({
      nameQuery: "insertItem",
      params: {
        code: code ?? '',
        name: name ?? '',
        description: description ?? '',
        brand: brand ?? '',
        model: model ?? '',
        category_id: category_id ?? 0,
        condition_id: condition_id ?? 0,
        status_id: status_id ?? 0,
        is_consumable: is_consumable ?? false,
        cost: cost ?? 0,
        acquisition_date: acquisition_date ?? '',
      },
    });
    return res?.rows?.[0] ?? null;
  } catch (err) {
    throw new Error(err.message);
  }
};
