import DBMS from "../../dbms/dbms.js";

export const createProfile = async function({ profile_name }) {
    const dbms = new DBMS();
    await dbms.init();

    try {
        const res = await dbms.executeNamedQuery({
            nameQuery: 'insertProfile',
            params: {
                profile_name
            },
        });
        return res?.rows?.[0];
    } catch (err) {
        throw new Error(err.message);
    }
}