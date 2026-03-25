import DBMS from "../../../../dbms/dbms.js";

export const updateUser = async function(params = {}) {
  const { id, name, email, is_solvency, is_active, person_id } = params || {};
  const dbms = new DBMS();
  await dbms.init();
  try {
    const res = await dbms.executeNamedQuery({
      nameQuery: 'updateUser',
      params: {
        id,
        name,
        email,
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
