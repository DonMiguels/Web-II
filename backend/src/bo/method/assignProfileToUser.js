import DBMS from '../../dbms/dbms.js';

/**
 * Asigna ProfileToUser.
 *
 * @param {number} [user_id] - Valor de `user_id`.
 * @param {number} [profile_id] - Valor de `profile_id`.
 * @returns {Promise<Object|null>}
 * @throws {Error} Si la operación falla o los datos son inválidos.
 */
export const assignProfileToUser = async function({ user_id, profile_id }) {
  const dbms = new DBMS();
  await dbms.init();

  try {
    const res = await dbms.executeNamedQuery({
      nameQuery: 'insertUserProfile',
      params: {
        user_id,
        profile_id,
      },
    });
    return res?.rows?.[0];
  } catch (err) {
    throw new Error(err.message);
  }
};
