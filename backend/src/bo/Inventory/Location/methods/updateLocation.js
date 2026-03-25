import DBMS from "../../../../dbms/dbms.js";

export const updateLocation = async function(params = {}) {
  const { id, name, description, parent_id, type_id } = params || {};
  const dbms = new DBMS();
  await dbms.init();
  try {
    const res = await dbms.executeNamedQuery({
      nameQuery: 'updateLocation',
      params: {
        id,
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
