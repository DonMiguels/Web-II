import DBMS from "../../dbms/dbms.js";

export const createUbicacion = async function({nombre, descripcion, parent_id, type_id}) {
    const dbms = new DBMS();
    await dbms.init();
    try {
        const res = await dbms.executeNamedQuery({
            nameQuery: 'insertUbicacion',
            params: {
                nombre,
                descripcion: descripcion || '',
                parent_id: parent_id || null,
                type_id: type_id || 1
            },
        });
        return res?.rows?.[0];
    } catch (err) {
        throw new Error(err.message);
    }
}
