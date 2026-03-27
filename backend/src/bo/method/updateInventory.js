import DBMS from "../../dbms/dbms.js";

export const updateInventory = async function({id, amount, location_id}) {
    const dbms = new DBMS();
    await dbms.init();
    try {
        const res = await dbms.executeNamedQuery({
            nameQuery: 'updateInventory',
            params: { id, amount, location_id },
        });
        return res?.rows?.[0];
    } catch (err) {
        throw new Error(err.message);
    }
}
