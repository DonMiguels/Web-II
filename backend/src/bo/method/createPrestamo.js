import DBMS from "../../dbms/dbms.js";

export const createPrestamo = async function({usuario_id, equipo_id, fecha_prestamo, fecha_devolucion_esperada, observaciones}) {
    const dbms = new DBMS();
    await dbms.init();
    try {
        const res = await dbms.executeNamedQuery({
            nameQuery: 'insertPrestamo',
            params: {
                usuario_id,
                equipo_id,
                fecha_prestamo,
                fecha_devolucion_esperada,
                observaciones: observaciones || ''
            },
        });
        return res?.rows?.[0];
    } catch (err) {
        throw new Error(err.message);
    }
}
