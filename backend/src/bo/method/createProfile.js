import DBMS from "../../dbms/dbms.js";

/**
 * Crea Profile.
 *
 * @param {string} [profile_name] - Valor de `profile_name`.
 * @returns {Promise<Object|null>}
 * @throws {Error} Si la operación falla o los datos son inválidos.
 */
export const createProfile = async function({ profile_name }) {
    const dbms = new DBMS();
    await dbms.init();

    try {
        const res = await dbms.executeNamedQuery({
            nameQuery: 'insertProfile',
            params: {
                profile_name
            },
        });
        return res?.rows?.[0];
    } catch (err) {
        throw new Error(err.message);
    }
}
