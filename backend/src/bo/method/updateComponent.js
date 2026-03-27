import DBMS from "../../dbms/dbms.js";

export const updateComponent = async function({id, name, description, equipment_status_id, cost}) {
    const dbms = new DBMS();
    await dbms.init();
    try {
        const res = await dbms.executeNamedQuery({
            nameQuery: 'updateComponent',
            params: { id, name, description, equipment_status_id, cost },
        });
        return res?.rows?.[0];
    } catch (err) {
        throw new Error(err.message);
    }
}