import DBMS from "../../dbms/dbms.js";

export const createUbicacion = async function({nombre, descripcion, edificio, piso, sala}) {
    const dbms = new DBMS();
    await dbms.init();
    try {
        const res = await dbms.executeNamedQuery({
            nameQuery: 'insertUbicacion',
            params: {
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
