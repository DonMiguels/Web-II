import DBMS from "../../../../dbms/dbms.js";

export const assignSecurityOptionProfile = async function(params = {}) {
  const dbms = new DBMS();
  await dbms.init();
  try {
    const res = await dbms.executeNamedQuery({
      nameQuery: 'assignSecurityOptionProfile',
      params,
    });
    return res?.rows?.[0];
  } catch (err) {
    throw new Error(err.message);
  }
};
