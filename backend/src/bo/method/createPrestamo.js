import DBMS from "../../dbms/dbms.js";

export const createPrestamo = async function({usuario_id, period_id, fecha_prestamo, fecha_devolucion_esperada, observaciones}) {
    const dbms = new DBMS();
    await dbms.init();
    try {
        // Calculate reservation expires at (booking_date + 24 hours)
        const bookingDate = new Date(fecha_prestamo || Date.now());
        const reservationExpiresAt = new Date(bookingDate.getTime() + 24 * 60 * 60 * 1000);
        
        const res = await dbms.executeNamedQuery({
            nameQuery: 'insertPrestamo',
            params: {
                usuario_id,
                period_id: period_id || 1,
                fecha_prestamo: fecha_prestamo || new Date().toISOString().split('T')[0],
                reservation_expires_at: reservationExpiresAt.toISOString(),
                fecha_devolucion_esperada: fecha_devolucion_esperada,
                observaciones: observaciones || ''
            },
        });
        return res?.rows?.[0];
    } catch (err) {
        throw new Error(err.message);
    }
}
