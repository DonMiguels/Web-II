import DBMS from '../../../../dbms/dbms.js';

export const getAllSecuritySubsystems = async function () {
  const dbms = new DBMS();
  await dbms.init();
  try {
    const res = await dbms.executeNamedQuery({
      nameQuery: 'getAllSecuritySubsystems',
      params: {},
    });
    return res?.rows || [];
  } catch (err) {
    throw new Error(err.message);
  }
};
