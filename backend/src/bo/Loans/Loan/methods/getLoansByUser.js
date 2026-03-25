import DBMS from "../../../../dbms/dbms.js";

export const getLoansByUser = async function(params = {}) {
  const { user_id } = params || {};
  const dbms = new DBMS();
  await dbms.init();
  try {
    const res = await dbms.executeNamedQuery({
      nameQuery: 'getLoansByUser',
      params: {
        user_id,
      },
    });
    return res?.rows || [];
  } catch (err) {
    throw new Error(err.message);
  }
};
