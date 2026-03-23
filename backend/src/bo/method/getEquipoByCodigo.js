import DBMS from "../../dbms/dbms.js";

export const getEquipoByCodigo = async function({codigo}) {
    const dbms = new DBMS();
    await dbms.init();
    try {
        const res = await dbms.executeNamedQuery({
            nameQuery: 'getEquipoByCodigo',
            params: { codigo },
        });
        return res?.rows?.[0] || null;
    } catch (err) {
        throw new Error(err.message);
    }
}
