import DBMS from "../../../../dbms/dbms.js";

export const deleteNotification = async function(params = {}) {
  const { id } = params || {};
  const dbms = new DBMS();
  await dbms.init();
  try {
    const res = await dbms.executeNamedQuery({
      nameQuery: 'deleteNotification',
      params: {
        id,
      },
    });
    return res?.rows?.[0];
  } catch (err) {
    throw new Error(err.message);
  }
};
