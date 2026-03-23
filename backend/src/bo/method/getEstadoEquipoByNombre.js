import DBMS from "../../dbms/dbms.js";

export const getEstadoEquipoByNombre = async function({nombre}) {
    const dbms = new DBMS();
    await dbms.init();
    try {
        const res = await dbms.executeNamedQuery({
            nameQuery: 'getEstadoEquipoByNombre',
            params: { nombre },
        });
        return res?.rows?.[0] || null;
    } catch (err) {
        throw new Error(err.message);
    }
}
