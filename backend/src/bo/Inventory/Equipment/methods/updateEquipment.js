import DBMS from "../../../../dbms/dbms.js";

export const updateEquipment = async function(params = {}) {
  const { id, name, description, equipment_status_id, cost } = params || {};
  const dbms = new DBMS();
  await dbms.init();
  try {
    const res = await dbms.executeNamedQuery({
      nameQuery: 'updateEquipment',
      params: {
        id,
        name,
        description,
        equipment_status_id,
        cost,
      },
    });
    return res?.rows?.[0];
  } catch (err) {
    throw new Error(err.message);
  }
};
