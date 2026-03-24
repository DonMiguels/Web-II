import DBMS from "../../dbms/dbms.js";

export const getPrestamosByUsuario = async function({usuario_id}) {
    const dbms = new DBMS();
    await dbms.init();
    try {
        const res = await dbms.executeNamedQuery({
            nameQuery: 'getPrestamosByUsuario',
            params: { usuario_id },
        });
        return res?.rows || [];
    } catch (err) {
        throw new Error(err.message);
    }
}
