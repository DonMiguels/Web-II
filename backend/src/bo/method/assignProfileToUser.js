import DBMS from '../../dbms/dbms.js';

export const assignProfileToUser = async function({ user_id, profile_id }) {
  const dbms = new DBMS();
  await dbms.init();

  try {
    const res = await dbms.executeNamedQuery({
      nameQuery: 'insertUserProfile',
      params: {
        user_id,
        profile_id,
      },
    });
    return res?.rows?.[0];
  } catch (err) {
    throw new Error(err.message);
  }
};
