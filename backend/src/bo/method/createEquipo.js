import DBMS from "../../dbms/dbms.js";

export const createEquipo = async function({codigo, nombre, marca, modelo, serie, descripcion, ubicacion_id, estado_id, fecha_adquisicion, costo}) {
    const dbms = new DBMS();
    await dbms.init();
    try {
        const res = await dbms.executeNamedQuery({
            nameQuery: 'insertEquipo',
            params: {
                codigo,
                nombre,
                marca,
                modelo,
                serie: serie || '',
                descripcion: descripcion || '',
                ubicacion_id: ubicacion_id || null,
                estado_id: estado_id || null,
                fecha_adquisicion: fecha_adquisicion || null,
                costo: costo || 0
            },
        });
        return res?.rows?.[0];
    } catch (err) {
        throw new Error(err.message);
    }
}
