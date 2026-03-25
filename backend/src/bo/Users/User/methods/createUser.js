import DBMS from "../../../../dbms/dbms.js";

export const createUser = async function(params = {}) {
  const { name, email, password_hash, is_solvency, is_active, person_id } = params || {};
  const dbms = new DBMS();
  await dbms.init();
  try {
    const res = await dbms.executeNamedQuery({
      nameQuery: 'insertUser',
      params: {
        name,
        email,
        password_hash,
        is_solvency,
        is_active,
        person_id,
      },
    });
    return res?.rows?.[0];
  } catch (err) {
    throw new Error(err.message);
  }
};
