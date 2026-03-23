import DBMS from "../../dbms/dbms.js";

export const createAuditoria = async function({entidad, metodo, detalles, usuario_id, tipo_id}) {
    const dbms = new DBMS();
    await dbms.init();
    try {
        const res = await dbms.executeNamedQuery({
            nameQuery: 'insertAuditoria',
            params: {
                entidad: entidad || 'unknown',
                metodo: metodo || 'unknown',
                detalles: detalles || '',
                usuario_id: usuario_id || 1,
                tipo_id: tipo_id || 1
            },
        });
        return res?.rows?.[0];
    } catch (err) {
        throw new Error(err.message);
    }
}
