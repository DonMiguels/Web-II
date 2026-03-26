import DBMS from '../../../../dbms/dbms.js';

function throwBusinessError(statusCode, message) {
  throw new Error(
    JSON.stringify({
      statusCode,
      message,
    }),
  );
}

function normalizeAmount(value, defaultValue = 0) {
  if (value === undefined || value === null || value === '') {
    return defaultValue;
  }

  const amount = Number(value);
  if (!Number.isFinite(amount) || amount < 0) {
    throw new Error('amount_paid debe ser numerico y no negativo');
  }

  return amount;
}

export const createCompensationFromDamage = async function (params = {}) {
  const {
    movement_detail_id,
    processed_by_user_id,
    borrower_user_id,
    payment_method_type_id,
    amount_paid,
    payment_date,
    observations,
  } = params || {};

  if (!movement_detail_id || !processed_by_user_id) {
    throw new Error(
      'movement_detail_id y processed_by_user_id son obligatorios',
    );
  }

  const dbms = new DBMS();
  await dbms.init();
  const client = await dbms.beginTransaction();

  try {
    const detailResult = await client.query(
      `
        SELECT
          md.id,
          md.movement_id,
          m.user_id AS borrower_user_id,
          m.type_id
        FROM public.movement_detail md
        JOIN public.movement m ON m.id = md.movement_id
        WHERE md.id = $1
        FOR UPDATE
      `,
      [movement_detail_id],
    );

    if (detailResult.rowCount === 0) {
      throw new Error('movement_detail_id no existe');
    }

    const detail = detailResult.rows[0];

    const movementType = await client.query(
      `SELECT name FROM public.movement_type WHERE id = $1 LIMIT 1`,
      [detail.type_id],
    );

    const movementTypeName = movementType.rows[0]?.name;
    if (movementTypeName !== 'loan') {
      throwBusinessError(
        422,
        'La compensacion solo se puede asociar a details de prestamos',
      );
    }

    const resolvedBorrowerId = Number(
      borrower_user_id || detail.borrower_user_id,
    );

    const duplicatePending = await client.query(
      `
        SELECT id
        FROM public.compensation
        WHERE movement_detail_id = $1
          AND deleted_at IS NULL
          AND amount_paid = 0
        LIMIT 1
      `,
      [movement_detail_id],
    );

    if (duplicatePending.rowCount > 0) {
      throwBusinessError(
        409,
        'Ya existe una compensacion pendiente para este detail de prestamo',
      );
    }

    const methodTypeId = Number(payment_method_type_id || 0);
    let resolvedMethodTypeId = methodTypeId;

    if (!resolvedMethodTypeId) {
      const defaultMethod = await client.query(
        `
          SELECT id
          FROM public.payment_method_type
          WHERE name = 'cash'
          LIMIT 1
        `,
      );

      if (defaultMethod.rowCount === 0) {
        throw new Error('No existe payment_method_type por defecto');
      }

      resolvedMethodTypeId = Number(defaultMethod.rows[0].id);
    }

    const initialAmount = normalizeAmount(amount_paid, 0);

    const inserted = await client.query(
      `
        INSERT INTO public.compensation (
          movement_detail_id,
          processed_by_user_id,
          borrower_user_id,
          payment_method_type_id,
          amount_paid,
          payment_date,
          observations,
          updated_at
        )
        VALUES ($1, $2, $3, $4, $5, COALESCE($6::timestamptz, NOW()), $7, NOW())
        RETURNING id, borrower_user_id, amount_paid, payment_date
      `,
      [
        movement_detail_id,
        processed_by_user_id,
        resolvedBorrowerId,
        resolvedMethodTypeId,
        initialAmount,
        payment_date || null,
        observations || null,
      ],
    );

    await client.query(
      `
        UPDATE public."user"
        SET is_solvency = FALSE,
            updated_at = NOW()
        WHERE id = $1
      `,
      [resolvedBorrowerId],
    );

    await dbms.commitTransaction(client);

    return {
      compensation_id: Number(inserted.rows[0].id),
      borrower_user_id: Number(inserted.rows[0].borrower_user_id),
      amount_paid: Number(inserted.rows[0].amount_paid),
      payment_date: inserted.rows[0].payment_date,
      status: initialAmount > 0 ? 'created_with_payment' : 'created_pending',
    };
  } catch (err) {
    await dbms.rollbackTransaction(client);
    throw new Error(err.message);
  } finally {
    await dbms.endTransaction(client);
  }
};
