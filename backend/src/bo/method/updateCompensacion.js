import DBMS from "../../dbms/dbms.js";

export const updateCompensacion = async function({id, monto, descripcion, usuario_id, danio_id}) {
    const dbms = new DBMS();
    await dbms.init();
    try {
        const res = await dbms.executeNamedQuery({
            nameQuery: 'updateCompensacion',
            params: {
                id,
                monto: monto || 0,
                descripcion: descripcion || '',
                usuario_id: usuario_id || 1,
                danio_id: danio_id || null
            },
        });
        return res?.rows?.[0];
    } catch (err) {
        throw new Error(err.message);
    }
}
