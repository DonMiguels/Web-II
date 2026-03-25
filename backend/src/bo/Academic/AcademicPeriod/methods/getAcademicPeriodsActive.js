import DBMS from "../../../../dbms/dbms.js";

export const getAcademicPeriodsActive = async function() {
  const dbms = new DBMS();
  await dbms.init();
  try {
    const res = await dbms.executeNamedQuery({
      nameQuery: 'getAcademicPeriodsActive',
      params: {},
    });
    return res?.rows || [];
  } catch (err) {
    throw new Error(err.message);
  }
};
