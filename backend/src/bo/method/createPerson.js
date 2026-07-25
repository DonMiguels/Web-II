import DBMS from "../../dbms/dbms.js";

/**
 * Crea Person.
 *
 * @param {string} [ci] - Valor de `ci`.
 * @param {string} [name] - Valor de `name`.
 * @param {string} [lastname] - Valor de `lastname`.
 * @param {string} [email] - Valor de `email`.
 * @param {string} [phone] - Valor de `phone`.
 * @returns {Promise<Object|null>}
 * @throws {Error} Si la operación falla o los datos son inválidos.
 */
export const createPerson = async function({ci, name, lastname, email, phone}) {
    const dbms = new DBMS();
    await dbms.init();
    try {
        const res = await dbms.executeNamedQuery({
            nameQuery: 'insertPerson',
            params: {
                ci,
                name,
                lastname: lastname || '',
                email,
                phone: phone || ''
            },
        });
        return res?.rows?.[0];
    } catch (err) {
        throw new Error(err.message);
    }
}
