import DBMS from "../../dbms/dbms.js";

export const getActiveLoans = async function() {
    const dbms = new DBMS();
    await dbms.init();
    try {
        const res = await dbms.executeNamedQuery({
            nameQuery: 'getActiveLoans',
            params: {},
        });
        return res?.rows || [];
    } catch (err) {
        throw new Error(err.message);
    }
}
