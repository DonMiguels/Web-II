import DBMS from "../../dbms/dbms.js";

export const getUsuarioByEmail = async function({email}) {
    const dbms = new DBMS();
    await dbms.init();
    try {
        const res = await dbms.executeNamedQuery({
            nameQuery: 'getUsuarioByEmail',
            params: { email },
        });
        return res?.rows?.[0];
    } catch (err) {
        throw new Error(err.message);
    }
}
