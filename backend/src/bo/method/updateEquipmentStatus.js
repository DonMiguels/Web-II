import DBMS from "../../dbms/dbms.js";

export const updateEquipmentStatus = async function({id, name, description}) {
    const dbms = new DBMS();
    await dbms.init();
    try {
        const res = await dbms.executeNamedQuery({
            nameQuery: 'updateEquipmentStatus',
            params: { id, name, description },
        });
        return res?.rows?.[0];
    } catch (err) {
        throw new Error(err.message);
    }
}