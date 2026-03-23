import DBMS from "../../dbms/dbms.js";

export const createEquipo = async function({codigo, nombre, descripcion, estado_id, costo, fecha_adquisicion, category_id}) {
    const dbms = new DBMS();
    await dbms.init();
    try {
        const res = await dbms.executeNamedQuery({
            nameQuery: 'insertEquipo',
            params: {
                codigo,
                nombre,
                descripcion: descripcion || '',
                estado_id: estado_id || 1,
                costo: costo || 0,
                fecha_adquisicion: fecha_adquisicion || null,
                category_id: category_id || 1
            },
        });
        return res?.rows?.[0];
    } catch (err) {
        throw new Error(err.message);
    }
}
