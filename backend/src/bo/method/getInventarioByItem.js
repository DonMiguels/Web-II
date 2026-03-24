import DBMS from "../../dbms/dbms.js";

export const getInventarioByItem = async function({item_id}) {
    const dbms = new DBMS();
    await dbms.init();
    try {
        const res = await dbms.executeNamedQuery({
            nameQuery: 'getInventarioByItem',
            params: { item_id },
        });
        return res?.rows || [];
    } catch (err) {
        throw new Error(err.message);
    }
}
