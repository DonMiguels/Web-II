import DBMS from "../../dbms/dbms.js";

export const getEstadoEquipoById = async function({id}) {
    const dbms = new DBMS();
    await dbms.init();
    try {
        const res = await dbms.executeNamedQuery({
            nameQuery: 'getEstadoEquipoById',
            params: { id },
        });
        return res?.rows?.[0] || null;
    } catch (err) {
        throw new Error(err.message);
    }
}
