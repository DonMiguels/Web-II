import DBMS from "../../dbms/dbms.js";

export const getLoansByComponent = async function({component_id}) {
    const dbms = new DBMS();
    await dbms.init();
    try {
        const res = await dbms.executeNamedQuery({
            nameQuery: 'getLoansByComponent',
            params: { component_id },
        });
        return res?.rows || [];
    } catch (err) {
        throw new Error(err.message);
    }
}
