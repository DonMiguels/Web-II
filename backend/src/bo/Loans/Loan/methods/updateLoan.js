import DBMS from '../../../../dbms/dbms.js';

export const updateLoan = async function (params = {}) {
  const {
    id,
    actual_return_date,
    observations,
    fecha_devolucion_real,
    observaciones,
  } = params || {};
  const dbms = new DBMS();
  await dbms.init();
  try {
    const res = await dbms.executeNamedQuery({
      nameQuery: 'updateLoan',
      params: {
        id,
        actual_return_date: actual_return_date ?? fecha_devolucion_real,
        observations: observations ?? observaciones ?? '',
      },
    });
    return res?.rows?.[0];
  } catch (err) {
    throw new Error(err.message);
  }
};
