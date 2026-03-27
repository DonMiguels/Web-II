import DBMS from "../../dbms/dbms.js";

export const createLoan = async function({user_id, period_id, booking_date, reservation_expires_at, estimated_return_date, observations}) {
    const dbms = new DBMS();
    await dbms.init();
    try {
        const res = await dbms.executeNamedQuery({
            nameQuery: 'insertLoan',
            params: { user_id, period_id, booking_date, reservation_expires_at, estimated_return_date, observations },
        });
        return res?.rows?.[0];
    } catch (err) {
        throw new Error(err.message);
    }
}
