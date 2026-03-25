import DBMS from "../../../../dbms/dbms.js";

export const getComponentByCode = async function(params = {}) {
  const { code } = params || {};
  const dbms = new DBMS();
  await dbms.init();
  try {
    const res = await dbms.executeNamedQuery({
      nameQuery: 'getComponentByCode',
      params: {
        code,
      },
    });
    return res?.rows?.[0];
  } catch (err) {
    throw new Error(err.message);
  }
};
