import DBMS from '../../../../dbms/dbms.js';

export const getInventoryByItem = async function (params = {}) {
  const { item_id } = params || {};
  const dbms = new DBMS();
  await dbms.init();
  try {
    const res = await dbms.executeNamedQuery({
      nameQuery: 'getInventoryByItem',
      params: { item_id },
    });
    return res?.rows || [];
  } catch (err) {
    throw new Error(err.message);
  }
};
