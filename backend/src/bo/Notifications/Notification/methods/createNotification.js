import DBMS from "../../../../dbms/dbms.js";

export const createNotification = async function(params = {}) {
  const { title, message, sent_at, is_read, user_id, type_id } = params || {};
  const dbms = new DBMS();
  await dbms.init();
  try {
    const res = await dbms.executeNamedQuery({
      nameQuery: 'insertNotification',
      params: {
        title,
        message,
        sent_at,
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
