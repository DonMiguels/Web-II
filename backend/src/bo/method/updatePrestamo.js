import DBMS from "../../dbms/dbms.js";

export const updatePrestamo = async function({id, fecha_devolucion_real, observaciones}) {
    const dbms = new DBMS();
    await dbms.init();
    try {
        const res = await dbms.executeNamedQuery({
            nameQuery: 'updatePrestamo',
            params: {
                id,
                fecha_devolucion_real,
                observaciones: observaciones || ''
            },
        });
        return res?.rows?.[0];
    } catch (err) {
        throw new Error(err.message);
    }
}
