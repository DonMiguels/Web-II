import DBMS from "../../dbms/dbms.js";

export const getUbicacionByNombre = async function({nombre}) {
    const dbms = new DBMS();
    await dbms.init();
    try {
        const res = await dbms.executeNamedQuery({
            nameQuery: 'getUbicacionByNombre',
            params: { nombre },
        });
        return res?.rows?.[0] || null;
    } catch (err) {
        throw new Error(err.message);
    }
}
