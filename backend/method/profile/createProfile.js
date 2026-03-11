import DBMS from "../../src/dbms/dbms.js";

export const createProfile = async function({ user_id, profile_id }) {
    const dbms = new DBMS();
    this.dbmsReady = dbms.init();

    await this.dbmsReady;
    try {
        const res = await dbms.executeNamedQuery({
            nameQuery: 'insertUserProfile',
            params: {
                user_id,
                profile_id
            },
        });
        return res?.rows?.[0];
    } catch (err) {
        throw new Error(err.message);
    }
}