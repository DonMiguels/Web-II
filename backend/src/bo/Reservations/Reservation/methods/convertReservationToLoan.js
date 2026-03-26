import DBMS from '../../../../dbms/dbms.js';

export const convertReservationToLoan = async function (params = {}) {
  const {
    reservation_id,
    booking_date,
    estimated_return_date,
    reservation_expires_at,
    observations,
  } = params || {};

  if (!reservation_id || !booking_date || !reservation_expires_at) {
    throw new Error(
      'reservation_id, booking_date y reservation_expires_at son obligatorios',
    );
  }

  const dbms = new DBMS();
  await dbms.init();
  const client = await dbms.beginTransaction();

  try {
    const reserveMovement = await client.query(
      `
        SELECT id, user_id, period_id, reservation_expires_at, actual_return_date
        FROM public.movement
        WHERE id = $1
          AND type_id = (SELECT id FROM public.movement_type WHERE name = 'reserve')
        FOR UPDATE
      `,
      [reservation_id],
    );

    if (reserveMovement.rowCount === 0) {
      throw new Error('Reserva no encontrada');
    }

    const reserve = reserveMovement.rows[0];
    if (reserve.actual_return_date) {
      throw new Error('La reserva ya fue cerrada');
    }

    const isExpired =
      new Date(reserve.reservation_expires_at).getTime() < Date.now();
    if (isExpired) {
      throw new Error('La reserva ya expiro y no puede convertirse');
    }

    const reserveDetails = await client.query(
      `
        SELECT inventory_id, amount, observations
        FROM public.movement_detail
        WHERE movement_id = $1
      `,
      [reservation_id],
    );

    if (reserveDetails.rowCount === 0) {
      throw new Error('Reserva sin detail no puede convertirse a prestamo');
    }

    const loanInsert = await client.query(
      `
        INSERT INTO public.movement (
          user_id,
          type_id,
          period_id,
          booking_date,
          reservation_expires_at,
          estimated_return_date,
          observations,
          updated_at
        )
        VALUES (
          $1,
          (SELECT id FROM public.movement_type WHERE name = 'loan'),
          $2,
          $3,
          $4,
          $5,
          $6,
          NOW()
        )
        RETURNING id
      `,
      [
        reserve.user_id,
        reserve.period_id,
        booking_date,
        reservation_expires_at,
        estimated_return_date || null,
        observations || `Converted from reservation ${reservation_id}`,
      ],
    );

    const loanId = loanInsert.rows[0].id;

    for (const detail of reserveDetails.rows) {
      await client.query(
        `
          INSERT INTO public.movement_detail (
            movement_date,
            amount,
            fine,
            observations,
            inventory_id,
            movement_id,
            updated_at
          )
          VALUES ($1, $2, 0, $3, $4, $5, NOW())
        `,
        [
          booking_date,
          detail.amount,
          detail.observations || null,
          detail.inventory_id,
          loanId,
        ],
      );
    }

    await client.query(
      `
        UPDATE public.movement
        SET actual_return_date = NOW(),
            observations = COALESCE($2, observations),
            updated_at = NOW()
        WHERE id = $1
      `,
      [reservation_id, `Reservation converted to loan ${loanId}`],
    );

    await dbms.commitTransaction(client);

    return {
      loan_id: loanId,
      reservation_id,
      status: 'reservation_converted',
    };
  } catch (err) {
    await dbms.rollbackTransaction(client);
    throw new Error(err.message);
  } finally {
    await dbms.endTransaction(client);
  }
};
