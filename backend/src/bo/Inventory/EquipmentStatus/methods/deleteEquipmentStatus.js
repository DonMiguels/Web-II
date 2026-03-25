import DBMS from "../../../../dbms/dbms.js";

export const deleteEquipmentStatus = async function(params = {}) {
  const { id } = params || {};
  const dbms = new DBMS();
  await dbms.init();
  try {
    const res = await dbms.executeNamedQuery({
      nameQuery: 'deleteEquipmentStatus',
      params: {
        id,
      },
    });
    return res?.rows?.[0];
  } catch (err) {
    throw new Error(err.message);
  }
};
