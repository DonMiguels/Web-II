import DBMS from "../../dbms/dbms.js";

/**
 * Actualiza Loan.
 *
 * @param {number} [id] - Valor de `id`.
 * @param {string} [due_at] - Valor de `due_at`.
 * @param {string} [observations] - Valor de `observations`.
 * @param {number} [status_id] - Valor de `status_id`.
 * @returns {Promise<Object|null>}
 * @throws {Error} Si la operación falla o los datos son inválidos.
 */
export const updateLoan = async function ({id, due_at, observations, status_id}) {
  const dbms = new DBMS();
  await dbms.init();
  try {
    const res = await dbms.executeNamedQuery({
      nameQuery: "updateLoan",
      params: {
        id: id ?? 0,
        due_at: due_at ?? '',
        observations: observations ?? '',
        status_id: status_id ?? 0,
      },
    });
    return res?.rows?.[0] ?? null;
  } catch (err) {
    throw new Error(err.message);
  }
};
