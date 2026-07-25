import DBMS from "../../dbms/dbms.js";

/**
 * Obtiene LoanById.
 *
 * @param {number} [id] - Valor de `id`.
 * @returns {Promise<Object|null>}
 * @throws {Error} Si la operación falla o los datos son inválidos.
 */
export const getLoanById = async function ({ id } = {}) {
  const dbms = new DBMS();
  await dbms.init();
  try {
    const loanRes = await dbms.executeNamedQuery({
      nameQuery: "getLoanById",
      params: { id: id ?? 0 },
    });
    const loan = loanRes?.rows?.[0] ?? null;
    if (!loan) return null;

    const itemsRes = await dbms.executeNamedQuery({
      nameQuery: "getLoanItemsByLoan",
      params: { loan_id: id },
    });

    return { ...loan, items: itemsRes?.rows ?? [] };
  } catch (err) {
    throw new Error(err.message);
  }
};
