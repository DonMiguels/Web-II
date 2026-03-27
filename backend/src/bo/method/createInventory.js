import DBMS from "../../dbms/dbms.js";

export const createInventory = async function({amount, location_id, item_id}) {
    const dbms = new DBMS();
    await dbms.init();
    try {
        const res = await dbms.executeNamedQuery({
            nameQuery: 'insertInventory',
            params: { amount, location_id, item_id },
        });
        return res?.rows?.[0];
    } catch (err) {
        throw new Error(err.message);
    }
}
