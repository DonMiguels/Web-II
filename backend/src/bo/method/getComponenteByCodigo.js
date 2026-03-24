import DBMS from "../../dbms/dbms.js";

export const getComponenteByCodigo = async function({codigo}) {
    const dbms = new DBMS();
    await dbms.init();
    try {
        const res = await dbms.executeNamedQuery({
            nameQuery: 'getComponenteByCodigo',
            params: { codigo },
        });
        return res?.rows?.[0];
    } catch (err) {
        throw new Error(err.message);
    }
}
