import DBMS from "../../dbms/dbms.js";

export const deleteEquipment = async function({id}) {
    const dbms = new DBMS();
    await dbms.init();
    try {
        const res = await dbms.executeNamedQuery({
            nameQuery: 'deleteEquipment',
            params: { id },
        });
        return res?.rows?.[0];
    } catch (err) {
        throw new Error(err.message);
    }
}