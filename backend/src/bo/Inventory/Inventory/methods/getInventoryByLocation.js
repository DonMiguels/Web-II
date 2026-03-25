import DBMS from '../../../../dbms/dbms.js';

export const getInventoryByLocation = async function (params = {}) {
  const { location_id } = params || {};
  const dbms = new DBMS();
  await dbms.init();
  try {
    const res = await dbms.executeNamedQuery({
      nameQuery: 'getInventoryByLocation',
      params: { location_id },
    });
    return res?.rows || [];
  } catch (err) {
    throw new Error(err.message);
  }
};
