import DBMS from "../../../../dbms/dbms.js";

export const updateAcademicPeriod = async function(params = {}) {
  const { id, name, description, start_date, end_date, type_id, is_active } = params || {};
  const dbms = new DBMS();
  await dbms.init();
  try {
    const res = await dbms.executeNamedQuery({
      nameQuery: 'updateAcademicPeriod',
      params: {
        id,
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
