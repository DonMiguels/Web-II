import DBMS from "../../../../dbms/dbms.js";

export const createLocation = async function(params = {}) {
  const { name, description, parent_id, type_id } = params || {};
  const dbms = new DBMS();
  await dbms.init();
  try {
    const res = await dbms.executeNamedQuery({
      nameQuery: 'insertLocation',
      params: {
        name,
        description,
        parent_id,
        type_id,
      },
    });
    return res?.rows?.[0];
  } catch (err) {
    throw new Error(err.message);
  }
};
