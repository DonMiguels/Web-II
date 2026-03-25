import DBMS from "../../../../dbms/dbms.js";

export const createAcademicPeriod = async function(params = {}) {
  const { name, description, start_date, end_date, type_id, is_active } = params || {};
  const dbms = new DBMS();
  await dbms.init();
  try {
    const res = await dbms.executeNamedQuery({
      nameQuery: 'insertAcademicPeriod',
      params: {
        name,
        description,
        start_date,
        end_date,
        type_id,
        is_active,
      },
    });
    return res?.rows?.[0];
  } catch (err) {
    throw new Error(err.message);
  }
};
