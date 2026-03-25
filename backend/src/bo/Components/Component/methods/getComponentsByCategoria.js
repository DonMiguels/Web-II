import DBMS from "../../../../dbms/dbms.js";

export const getComponentsByCategoria = async function(params = {}) {
  const { category_id } = params || {};
  const dbms = new DBMS();
  await dbms.init();
  try {
    const res = await dbms.executeNamedQuery({
      nameQuery: 'getComponentsByCategoria',
      params: {
        category_id,
      },
    });
    return res?.rows || [];
  } catch (err) {
    throw new Error(err.message);
  }
};
