import DBMS from "../../../../dbms/dbms.js";

export const updateNotification = async function(params = {}) {
  const { id, title, message, is_read, user_id, type_id } = params || {};
  const dbms = new DBMS();
  await dbms.init();
  try {
    const res = await dbms.executeNamedQuery({
      nameQuery: 'updateNotification',
      params: {
        id,
        title,
        message,
        is_read,
        user_id,
        type_id,
      },
    });
    return res?.rows?.[0];
  } catch (err) {
    throw new Error(err.message);
  }
};
