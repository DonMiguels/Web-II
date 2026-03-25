import DBMS from "../../../../dbms/dbms.js";

export const createEquipmentStatus = async function(params = {}) {
  const { name, description } = params || {};
  const dbms = new DBMS();
  await dbms.init();
  try {
    const res = await dbms.executeNamedQuery({
      nameQuery: 'insertEquipmentStatus',
      params: {
        name,
        description,
      },
    });
    return res?.rows?.[0];
  } catch (err) {
    throw new Error(err.message);
  }
};
