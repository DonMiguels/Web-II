import DBMS from "../../dbms/dbms.js";

export const getCompensacionesByUsuario = async function({usuario_id}) {
    const dbms = new DBMS();
    await dbms.init();
    try {
        const res = await dbms.executeNamedQuery({
            nameQuery: 'getCompensacionesByUsuario',
            params: { usuario_id },
        });
        return res?.rows || [];
    } catch (err) {
        throw new Error(err.message);
    }
}
