import DBMS from "../../../../dbms/dbms.js";

export const createEquipment = async function(params = {}) {
  const { code, name, description, equipment_status_id, cost, acquisition_date, category_id } = params || {};
  const dbms = new DBMS();
  await dbms.init();
  try {
    const res = await dbms.executeNamedQuery({
      nameQuery: 'insertEquipment',
      params: {
        code,
        name,
        description,
        equipment_status_id,
        cost,
        acquisition_date,
        category_id,
      },
    });
    return res?.rows?.[0];
  } catch (err) {
    throw new Error(err.message);
  }
};
