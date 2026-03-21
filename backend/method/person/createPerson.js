import DBMS from "../../src/dbms/dbms.js";

export const createPerson = async function({ci, name, lastname, email, phone}) {
    const dbms = new DBMS();
    await dbms.init();
    this.dbms = dbms;
    this.dbmsReady = Promise.resolve();
    try {
        const res = await this.dbms.executeNamedQuery({
            nameQuery: 'insertPerson',
            params: {
                ci,
                name,
                lastname: lastname || '',
                email,
                phone: phone || ''
            },
        });
        return res?.rows?.[0];
    } catch (err) {
        throw new Error(err.message);
    }
}