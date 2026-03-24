import DBMS from "../../dbms/dbms.js";

export const createCompensacion = async function({monto, descripcion, usuario_id, danio_id}) {
    const dbms = new DBMS();
    await dbms.init();
    try {
        const res = await dbms.executeNamedQuery({
            nameQuery: 'insertCompensacion',
            params: {
                monto: monto || 0,
                descripcion: descripcion || '',
                usuario_id: usuario_id || 1
            },
        });
        return res?.rows?.[0];
    } catch (err) {
        throw new Error(err.message);
    }
}
