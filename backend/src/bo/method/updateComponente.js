import DBMS from "../../dbms/dbms.js";

export const updateComponente = async function({id, nombre, descripcion, estado_id, costo}) {
    const dbms = new DBMS();
    await dbms.init();
    try {
        const res = await dbms.executeNamedQuery({
            nameQuery: 'updateComponente',
            params: {
                id,
                nombre,
                descripcion: descripcion || '',
                estado_id: estado_id || 1,
                costo: costo || 0
            },
        });
        return res?.rows?.[0];
    } catch (err) {
        throw new Error(err.message);
    }
}
