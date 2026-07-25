import DBMS from "../../dbms/dbms.js";

/**
 * Crea Compensation.
 *
 * @param {number} [loan_item_id] - Valor de `loan_item_id`.
 * @param {number} [processed_by_user_id] - Valor de `processed_by_user_id`.
 * @param {number} [borrower_user_id] - Valor de `borrower_user_id`.
 * @param {number} [payment_method_id] - Valor de `payment_method_id`.
 * @param {number} [amount_paid] - Valor de `amount_paid`.
 * @param {string} [paid_at] - Valor de `paid_at`.
 * @param {string} [observations] - Valor de `observations`.
 * @returns {Promise<Object|null>}
 * @throws {Error} Si la operación falla o los datos son inválidos.
 */
export const createCompensation = async function ({loan_item_id, processed_by_user_id, borrower_user_id, payment_method_id, amount_paid, paid_at, observations}) {
  const dbms = new DBMS();
  await dbms.init();
  try {
    const res = await dbms.executeNamedQuery({
      nameQuery: "insertCompensation",
      params: {
        loan_item_id: loan_item_id ?? 0,
        processed_by_user_id: processed_by_user_id ?? 0,
        borrower_user_id: borrower_user_id ?? 0,
        payment_method_id: payment_method_id ?? 0,
        amount_paid: amount_paid ?? 0,
        paid_at: paid_at ?? '',
        observations: observations ?? '',
      },
    });
    return res?.rows?.[0] ?? null;
  } catch (err) {
    throw new Error(err.message);
  }
};
