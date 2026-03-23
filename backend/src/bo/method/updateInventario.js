import DBMS from "../../dbms/dbms.js";

export const updateInventario = async function({id, cantidad, ubicacion_id}) {
    const dbms = new DBMS();
    await dbms.init();
    try {
        const res = await dbms.executeNamedQuery({
            nameQuery: 'updateInventario',
            params: {
                id,
                cantidad: cantidad || 0,
                ubicacion_id: ubicacion_id || 1
            },
        });
        return res?.rows?.[0];
    } catch (err) {
        throw new Error(err.message);
    }
}
