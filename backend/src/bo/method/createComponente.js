import DBMS from "../../dbms/dbms.js";

export const createComponente = async function({codigo, nombre, descripcion, estado_id, costo, fecha_adquisicion, category_id}) {
    const dbms = new DBMS();
    await dbms.init();
    try {
        const res = await dbms.executeNamedQuery({
            nameQuery: 'insertComponente',
            params: {
                codigo,
                nombre,
                descripcion: descripcion || '',
                estado_id: estado_id || 1,
                costo: costo || 0,
                fecha_adquisicion: fecha_adquisicion || new Date().toISOString().split('T')[0],
                category_id: category_id || 1
            },
        });
        return res?.rows?.[0];
    } catch (err) {
        throw new Error(err.message);
    }
}
