import DBMS from "../../dbms/dbms.js";

export const createInventario = async function({cantidad, ubicacion_id, item_id}) {
    const dbms = new DBMS();
    await dbms.init();
    try {
        const res = await dbms.executeNamedQuery({
            nameQuery: 'insertInventario',
            params: {
                cantidad: cantidad || 0,
                ubicacion_id: ubicacion_id || 1,
                item_id: item_id || 1
            },
        });
        return res?.rows?.[0];
    } catch (err) {
        throw new Error(err.message);
    }
}
