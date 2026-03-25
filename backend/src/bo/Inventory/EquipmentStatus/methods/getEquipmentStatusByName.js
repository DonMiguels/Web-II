import DBMS from "../../../../dbms/dbms.js";

export const getEquipmentStatusByName = async function(params = {}) {
  const { name } = params || {};
  const dbms = new DBMS();
  await dbms.init();
  try {
    const res = await dbms.executeNamedQuery({
      nameQuery: 'getEquipmentStatusByName',
      params: {
        name,
      },
    });
    return res?.rows?.[0];
  } catch (err) {
    throw new Error(err.message);
  }
};
