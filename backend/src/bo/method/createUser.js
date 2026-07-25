import DBMS from "../../dbms/dbms.js";
import Validator from "../../../utils/validator.js";

/**
 * Crea User.
 *
 * @param {string} [username] - Valor de `username`.
 * @param {string} [password] - Valor de `password`.
 * @param {number} [person_id] - Valor de `person_id`.
 * @returns {Promise<Object|null>}
 * @throws {Error} Si la operación falla o los datos son inválidos.
 */
export const createUser = async function({username, password, person_id}) {
    const validator = new Validator();
    const registerSchema = {
        username: {
            type: 'string',
            options: { required: true },
        },
        password: {
            type: 'string',
            options: {
                required: true,
                requireSpecialChars: true,
            },
        },
        person_id: {
            type: 'number',
            options: { required: true },
        },
    };

    const validation = validator.validateObject({username, password, person_id}, registerSchema);
    if (!validation.isValid) {
        throw new Error(JSON.stringify(validation.errors));
    }

    const dbms = new DBMS();
    await dbms.init();
    try {
        const userRes = await dbms.executeNamedQuery({
            nameQuery: 'registerUser',
            params: {
                username,
                password,
                person_id
            },
        });
        return userRes?.rows?.[0];
    } catch (err) {
        throw new Error(err.message);
    }
}
