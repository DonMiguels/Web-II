import DBMS from '../../../../dbms/dbms.js';

function assertDetails(details) {
  if (!Array.isArray(details) || details.length === 0) {
    throw new Error('La reserva requiere al menos un detail');
  }

  for (const detail of details) {
    if (!detail || !Number.isInteger(Number(detail.inventory_id))) {
      throw new Error('Cada detail requiere inventory_id valido');
    }
    if (
      !Number.isInteger(Number(detail.amount)) ||
      Number(detail.amount) <= 0
    ) {
      throw new Error('Cada detail requiere amount mayor a cero');
    }
  }
}

export const createReservation = async function (params = {}) {
  const {
    user_id,
    period_id,
    booking_date,
    reservation_expires_at,
    estimated_return_date,
    observations,
    details,
  } = params || {};

  if (!user_id || !period_id || !booking_date || !reservation_expires_at) {
    throw new Error('Faltan campos obligatorios para crear reserva');
  }

  assertDetails(details);

  const dbms = new DBMS();
  await dbms.init();
  const client = await dbms.beginTransaction();

  try {
    const reservationInsert = await client.query(
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
          (SELECT id FROM public.movement_type WHERE name = 'reserve'),
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
        user_id,
        period_id,
        booking_date,
        reservation_expires_at,
        estimated_return_date || null,
        observations || null,
      ],
    );

    const reservationId = reservationInsert.rows[0].id;

    for (const detail of details) {
      const inventoryId = Number(detail.inventory_id);
      const amount = Number(detail.amount);

      const stockResult = await client.query(
        `
          SELECT id, amount
          FROM public.inventory
          WHERE id = $1
          FOR UPDATE
        `,
        [inventoryId],
      );

      if (stockResult.rowCount === 0) {
        throw new Error(`Inventario no encontrado: ${inventoryId}`);
      }

      const stock = Number(stockResult.rows[0].amount);
      if (stock < amount) {
        throw new Error(
          `Stock insuficiente para reserva en inventario ${inventoryId}`,
        );
      }

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
          amount,
          detail.observations || null,
          inventoryId,
          reservationId,
        ],
      );

      await client.query(
        `
          UPDATE public.inventory
          SET amount = amount - $2,
              updated_at = NOW()
          WHERE id = $1
        `,
        [inventoryId, amount],
      );
    }

    await dbms.commitTransaction(client);
    return {
      reservation_id: reservationId,
      detail_count: details.length,
      status: 'reservation_created',
    };
  } catch (err) {
    await dbms.rollbackTransaction(client);
    throw new Error(err.message);
  } finally {
    await dbms.endTransaction(client);
  }
};
