import DBMS from '../../../../dbms/dbms.js';

export const expireReservationJob = async function (params = {}) {
  const { limit = 100 } = params || {};

  const dbms = new DBMS();
  await dbms.init();
  const client = await dbms.beginTransaction();

  try {
    const expiredReservations = await client.query(
      `
        SELECT id
        FROM public.movement
        WHERE type_id = (SELECT id FROM public.movement_type WHERE name = 'reserve')
          AND actual_return_date IS NULL
          AND reservation_expires_at < NOW()
        ORDER BY reservation_expires_at ASC
        LIMIT $1
        FOR UPDATE
      `,
      [Number(limit)],
    );

    let releasedItems = 0;

    for (const reservation of expiredReservations.rows) {
      const details = await client.query(
        `
          SELECT inventory_id, amount
          FROM public.movement_detail
          WHERE movement_id = $1
        `,
        [reservation.id],
      );

      for (const detail of details.rows) {
        await client.query(
          `
            UPDATE public.inventory
            SET amount = amount + $2,
                updated_at = NOW()
            WHERE id = $1
          `,
          [detail.inventory_id, detail.amount],
        );
        releasedItems += Number(detail.amount);
      }

      await client.query(
        `
          UPDATE public.movement
          SET actual_return_date = NOW(),
              observations = COALESCE(observations, 'Reservation expired by job'),
              updated_at = NOW()
          WHERE id = $1
        `,
        [reservation.id],
      );
    }

    await dbms.commitTransaction(client);

    return {
      expired_count: expiredReservations.rowCount,
      released_items: releasedItems,
    };
  } catch (err) {
    await dbms.rollbackTransaction(client);
    throw new Error(err.message);
  } finally {
    await dbms.endTransaction(client);
  }
};
