import DBMS from "../../../../dbms/dbms.js";

export const getUserByEmail = async function(params = {}) {
  const { email } = params || {};
  const dbms = new DBMS();
  await dbms.init();
  try {
    const res = await dbms.executeNamedQuery({
      nameQuery: 'getUserByEmail',
      params: {
        email,
      },
    });
    return res?.rows?.[0];
  } catch (err) {
    throw new Error(err.message);
  }
};
