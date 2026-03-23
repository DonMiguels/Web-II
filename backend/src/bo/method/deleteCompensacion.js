import DBMS from "../../dbms/dbms.js";

export const deleteCompensacion = async function({id}) {
    const dbms = new DBMS();
    await dbms.init();
    try {
        const res = await dbms.executeNamedQuery({
            nameQuery: 'deleteCompensacion',
            params: { id },
        });
        return res?.rows?.[0];
    } catch (err) {
        throw new Error(err.message);
    }
}
