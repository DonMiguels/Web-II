import DBMS from "../../dbms/dbms.js";

export const createDevolucion = async function({usuario_id, period_id, booking_date, reservation_expires_at, actual_return_date, observaciones}) {
    const dbms = new DBMS();
    await dbms.init();
    try {
        const res = await dbms.executeNamedQuery({
            nameQuery: 'insertDevolucion',
            params: {
                usuario_id: usuario_id || 1,
                period_id: period_id || 1,
                booking_date: booking_date || new Date().toISOString(),
                reservation_expires_at: reservation_expires_at || new Date().toISOString(),
                actual_return_date: actual_return_date || new Date().toISOString(),
                observaciones: observaciones || ''
            },
        });
        return res?.rows?.[0];
    } catch (err) {
        throw new Error(err.message);
    }
}
