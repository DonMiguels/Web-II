import DBMS from "../../dbms/dbms.js";

export const getProfileByName = async function({ profile_name }) {
    const dbms = new DBMS();
    await dbms.init();

    try {
        const res = await dbms.executeNamedQuery({
            nameQuery: 'getProfileByName',
            params: {
                profile_name
            },
        });
        return res?.rows?.[0];
    } catch (err) {
        throw new Error(err.message);
    }
}