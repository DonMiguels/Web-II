import DBMS from "../../../../dbms/dbms.js";

export const createCompensation = async function(params = {}) {
  const { movement_detail_id, processed_by_user_id, borrower_user_id, payment_method_type_id, amount_paid, payment_date, observations } = params || {};
  const dbms = new DBMS();
  await dbms.init();
  try {
    const res = await dbms.executeNamedQuery({
      nameQuery: 'insertCompensation',
      params: {
        movement_detail_id,
        processed_by_user_id,
        borrower_user_id,
        payment_method_type_id,
        amount_paid,
        payment_date,
        observations,
      },
    });
    return res?.rows?.[0];
  } catch (err) {
    throw new Error(err.message);
  }
};
