import DBMS from "../../../../dbms/dbms.js";

export const updateReturn = async function(params = {}) {
  const { id, observations } = params || {};
  const dbms = new DBMS();
  await dbms.init();
  try {
    const res = await dbms.executeNamedQuery({
      nameQuery: 'updateReturn',
      params: {
        id,
        observations,
      },
    });
    return res?.rows?.[0];
  } catch (err) {
    throw new Error(err.message);
  }
};
