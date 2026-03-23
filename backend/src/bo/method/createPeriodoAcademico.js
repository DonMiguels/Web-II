import DBMS from "../../dbms/dbms.js";

export const createPeriodoAcademico = async function({nombre, descripcion, fecha_inicio, fecha_fin, tipo_id, is_active}) {
    const dbms = new DBMS();
    await dbms.init();
    try {
        const res = await dbms.executeNamedQuery({
            nameQuery: 'insertPeriodoAcademico',
            params: {
                nombre,
                descripcion: descripcion || '',
                fecha_inicio: fecha_inicio || new Date().toISOString().split('T')[0],
                fecha_fin: fecha_fin || null,
                tipo_id: tipo_id || 1,
                is_active: is_active !== undefined ? is_active : true
            },
        });
        return res?.rows?.[0];
    } catch (err) {
        throw new Error(err.message);
    }
}
