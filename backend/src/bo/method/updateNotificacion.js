import DBMS from "../../dbms/dbms.js";

export const updateNotificacion = async function({id, titulo, mensaje, leida, usuario_id, tipo_id}) {
    const dbms = new DBMS();
    await dbms.init();
    try {
        const res = await dbms.executeNamedQuery({
            nameQuery: 'updateNotificacion',
            params: {
                id,
                titulo,
                mensaje,
                leida: leida !== undefined ? leida : false,
                usuario_id: usuario_id || 1,
                tipo_id: tipo_id || 1
            },
        });
        return res?.rows?.[0];
    } catch (err) {
        throw new Error(err.message);
    }
}
