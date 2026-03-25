import DBMS from "../../../../dbms/dbms.js";

export const createAudit = async function(params = {}) {
  const { entity_name, method, details, user_id, type_id } = params || {};
  const dbms = new DBMS();
  await dbms.init();
  try {
    const res = await dbms.executeNamedQuery({
      nameQuery: 'insertAudit',
      params: {
        entity_name,
        method,
        details,
        user_id,
        type_id,
      },
    });
    return res?.rows?.[0];
  } catch (err) {
    throw new Error(err.message);
  }
};
