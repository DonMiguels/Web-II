import DBMS from "../../dbms/dbms.js";

export const getAllEquipment = async function() {
    const dbms = new DBMS();
    await dbms.init();
    try {
        const res = await dbms.executeNamedQuery({
            nameQuery: 'getAllEquipment',
            params: {},
        });
        return res?.rows || [];
    } catch (err) {
        throw new Error(err.message);
    }
}