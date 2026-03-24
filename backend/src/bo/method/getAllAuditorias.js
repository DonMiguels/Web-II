import DBMS from "../../dbms/dbms.js";

export const getAllAuditorias = async function() {
    const dbms = new DBMS();
    await dbms.init();
    try {
        const res = await dbms.executeNamedQuery({
            nameQuery: 'getAllAuditorias',
            params: {},
        });
        return res?.rows || [];
    } catch (err) {
        throw new Error(err.message);
    }
}
