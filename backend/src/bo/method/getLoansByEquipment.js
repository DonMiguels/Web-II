import DBMS from "../../dbms/dbms.js";

export const getLoansByEquipment = async function({equipment_id}) {
    const dbms = new DBMS();
    await dbms.init();
    try {
        const res = await dbms.executeNamedQuery({
            nameQuery: 'getLoansByEquipment',
            params: { equipment_id },
        });
        return res?.rows || [];
    } catch (err) {
        throw new Error(err.message);
    }
}
