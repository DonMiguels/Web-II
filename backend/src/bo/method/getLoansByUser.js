import DBMS from "../../dbms/dbms.js";

/**
 * Obtiene LoansByUser.
 *
 * @param {number} [borrower_user_id] - Valor de `borrower_user_id`.
 * @returns {Promise<Array<Object>>}
 * @throws {Error} Si la operación falla o los datos son inválidos.
 */
export const getLoansByUser = async function ({borrower_user_id}) {
  const dbms = new DBMS();
  await dbms.init();
  try {
    const res = await dbms.executeNamedQuery({
      nameQuery: "getLoansByUser",
      params: {
        borrower_user_id: borrower_user_id ?? 0,
      },
    });
    return res?.rows ?? [];
  } catch (err) {
    throw new Error(err.message);
  }
};
