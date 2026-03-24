import DBMS from "../../dbms/dbms.js";

export const createEstadoEquipo = async function({nombre, descripcion}) {
    const dbms = new DBMS();
    await dbms.init();
    try {
        const res = await dbms.executeNamedQuery({
            nameQuery: 'insertEstadoEquipo',
            params: {
                nombre,
                descripcion: descripcion || ''
            },
        });
        return res?.rows?.[0];
    } catch (err) {
        throw new Error(err.message);
    }
}
