import DBMS from '../../../../dbms/dbms.js';

export const renewLoan = async function (params = {}) {
  const { loan_id, estimated_return_date, observations } = params || {};

  if (!loan_id || !estimated_return_date) {
    throw new Error('loan_id y estimated_return_date son obligatorios');
  }

  const dbms = new DBMS();
  await dbms.init();
  const client = await dbms.beginTransaction();

  try {
    const loanResult = await client.query(
      `
        SELECT id, actual_return_date
        FROM public.movement
        WHERE id = $1
          AND type_id = (SELECT id FROM public.movement_type WHERE name = 'loan')
        FOR UPDATE
      `,
      [loan_id],
    );

    if (loanResult.rowCount === 0) {
      throw new Error('Prestamo no encontrado');
    }

    if (loanResult.rows[0].actual_return_date) {
      throw new Error('No se puede renovar un prestamo cerrado');
    }

    const updated = await client.query(
      `
        UPDATE public.movement
        SET estimated_return_date = $2,
            observations = COALESCE($3, observations),
            updated_at = NOW()
        WHERE id = $1
        RETURNING id AS loan_id, estimated_return_date
      `,
      [loan_id, estimated_return_date, observations || null],
    );

    await dbms.commitTransaction(client);
    return updated.rows[0];
  } catch (err) {
    await dbms.rollbackTransaction(client);
    throw new Error(err.message);
  } finally {
    await dbms.endTransaction(client);
  }
};
