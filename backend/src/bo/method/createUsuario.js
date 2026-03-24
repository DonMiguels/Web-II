import DBMS from "../../dbms/dbms.js";

export const createUsuario = async function({nombre, email, password_hash, is_solvency, is_active, person_id}) {
    const dbms = new DBMS();
    await dbms.init();
    try {
        const res = await dbms.executeNamedQuery({
            nameQuery: 'insertUsuario',
            params: {
                nombre: nombre || 'Unknown',
                email: email || 'unknown@example.com',
                password_hash: password_hash || 'default_hash',
                is_solvency: is_solvency !== undefined ? is_solvency : true,
                is_active: is_active !== undefined ? is_active : true
            },
        });
        return res?.rows?.[0];
    } catch (err) {
        throw new Error(err.message);
    }
}
