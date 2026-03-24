import DBMS from "../../dbms/dbms.js";

export const updateUsuario = async function({id, nombre, email, is_solvency, is_active, person_id}) {
    const dbms = new DBMS();
    await dbms.init();
    try {
        const res = await dbms.executeNamedQuery({
            nameQuery: 'updateUsuario',
            params: {
                id,
                nombre,
                email: email || null,
                is_solvency: is_solvency !== undefined ? is_solvency : false,
                is_active: is_active !== undefined ? is_active : true,
                person_id: person_id || null
            },
        });
        return res?.rows?.[0];
    } catch (err) {
        throw new Error(err.message);
    }
}
