import DBMS from "../../dbms/dbms.js";

/**
 * Obtiene LoanItems.
 *
 * @param {number} [loan_id] - Valor de `loan_id`.
 * @returns {Promise<Array<Object>>}
 * @throws {Error} Si la operación falla o los datos son inválidos.
 */
export const getLoanItems = async function ({loan_id}) {
  const dbms = new DBMS();
  await dbms.init();
  try {
    const res = await dbms.executeNamedQuery({
      nameQuery: "getLoanItemsByLoan",
      params: {
        loan_id: loan_id ?? '',
      },
    });
    return res?.rows ?? [];
  } catch (err) {
    throw new Error(err.message);
  }
};
