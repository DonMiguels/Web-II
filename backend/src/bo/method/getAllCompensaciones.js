import DBMS from "../../dbms/dbms.js";

export const getAllCompensaciones = async function() {
    const dbms = new DBMS();
    await dbms.init();
    try {
        const res = await dbms.executeNamedQuery({
            nameQuery: 'getAllCompensaciones',
            params: {},
        });
        return res?.rows || [];
    } catch (err) {
        throw new Error(err.message);
    }
}
