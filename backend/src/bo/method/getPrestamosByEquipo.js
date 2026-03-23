import DBMS from "../../dbms/dbms.js";

export const getPrestamosByEquipo = async function({equipo_id}) {
    const dbms = new DBMS();
    await dbms.init();
    try {
        const res = await dbms.executeNamedQuery({
            nameQuery: 'getPrestamosByEquipo',
            params: { equipo_id },
        });
        return res?.rows || [];
    } catch (err) {
        throw new Error(err.message);
    }
}
