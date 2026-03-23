import DBMS from "../../dbms/dbms.js";

export const updateEstadoEquipo = async function({id, nombre, descripcion}) {
    const dbms = new DBMS();
    await dbms.init();
    try {
        const res = await dbms.executeNamedQuery({
            nameQuery: 'updateEstadoEquipo',
            params: {
                id,
                nombre,
                descripcion: descripcion || ''
            },
        });
        return res?.rows?.[0];
    } catch (err) {
        throw new Error(err.message);
    }
}
