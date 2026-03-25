import DBMS from "../../../../dbms/dbms.js";

export const getEquipmentByCode = async function(params = {}) {
  const { code } = params || {};
  const dbms = new DBMS();
  await dbms.init();
  try {
    const res = await dbms.executeNamedQuery({
      nameQuery: 'getEquipmentByCode',
      params: {
        code,
      },
    });
    return res?.rows?.[0];
  } catch (err) {
    throw new Error(err.message);
  }
};
