import DBMS from "../../src/dbms/dbms.js";

export const getProfileByName = async ({ user_id, profile_id }) => {
    const dbms = new DBMS();
    const dbmsReady = this.dbms.init();

    await this.dbmsReady;
    try {
        const res = await this.dbms.executeNamedQuery({
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