import DBMS from "../../dbms/dbms.js";

export const updateDevolucion = async function({id, observaciones}) {
    const dbms = new DBMS();
    await dbms.init();
    try {
        const res = await dbms.executeNamedQuery({
            nameQuery: 'updateDevolucion',
            params: {
                id,
                observaciones: observaciones || ''
            },
        });
        return res?.rows?.[0];
    } catch (err) {
        throw new Error(err.message);
    }
}
