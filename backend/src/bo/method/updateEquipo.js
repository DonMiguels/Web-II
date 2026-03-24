import DBMS from "../../dbms/dbms.js";

export const updateEquipo = async function({id, nombre, marca, modelo, serie, descripcion, ubicacion_id, estado_id, costo}) {
    const dbms = new DBMS();
    await dbms.init();
    try {
        const res = await dbms.executeNamedQuery({
            nameQuery: 'updateEquipo',
            params: {
                id,
                nombre,
                marca,
                modelo,
                serie: serie || '',
                descripcion: descripcion || '',
                ubicacion_id: ubicacion_id || null,
                estado_id: estado_id || null,
                costo: costo || 0
            },
        });
        return res?.rows?.[0];
    } catch (err) {
        throw new Error(err.message);
    }
}
