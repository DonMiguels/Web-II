import DBMS from "../../dbms/dbms.js";

export const updateUbicacion = async function({id, nombre, descripcion, edificio, piso, sala}) {
    const dbms = new DBMS();
    await dbms.init();
    try {
        const res = await dbms.executeNamedQuery({
            nameQuery: 'updateUbicacion',
            params: {
                id,
                nombre,
                descripcion: descripcion || '',
                edificio: edificio || '',
                piso: piso || '',
                sala: sala || ''
            },
        });
        return res?.rows?.[0];
    } catch (err) {
        throw new Error(err.message);
    }
}
