import DBMS from "../../dbms/dbms.js";

export const createNotificacion = async function(titulo, mensaje, sent_at, is_read, usuario_id, tipo_id) {
    const dbms = new DBMS();
    await dbms.init();
    try {
        const res = await dbms.executeNamedQuery({
            nameQuery: 'insertNotificacion',
            params: [
                titulo || 'Notificación',
                mensaje || 'Mensaje',
                sent_at || new Date().toISOString(),
                is_read || false,
                usuario_id || 1,
                tipo_id || 1
            ],
        });
        return res?.rows?.[0];
    } catch (err) {
        throw new Error(err.message);
    }
}
