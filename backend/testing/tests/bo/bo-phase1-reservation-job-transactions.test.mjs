import pool from '../../../config/db.js';
import { createReservation } from '../../../src/bo/Reservations/Reservation/methods/createReservation.js';
import { convertReservationToLoan } from '../../../src/bo/Reservations/Reservation/methods/convertReservationToLoan.js';
import { expireReservationJob } from '../../../src/bo/Reservations/ReservationJob/methods/expireReservationJob.js';

const nowIso = () => new Date().toISOString();
const futureIso = (minutes = 60) =>
  new Date(Date.now() + minutes * 60 * 1000).toISOString();
const pastIso = (minutes = 60) =>
  new Date(Date.now() - minutes * 60 * 1000).toISOString();

async function createFixture({ stock = 2 } = {}) {
  const tag = `rj${Date.now()}${Math.floor(Math.random() * 10000)}`;

  const categoryType = await pool.query(
    `INSERT INTO public.category_type (name, description) VALUES ($1, $2) RETURNING id`,
    [`cat_type_${tag}`, `cat_type_${tag}`],
  );

  const category = await pool.query(
    `INSERT INTO public.category (name, description, is_consumable, type_id) VALUES ($1, $2, FALSE, $3) RETURNING id`,
    [`category_${tag}`, `category_${tag}`, categoryType.rows[0].id],
  );

  const conditionStatus = await pool.query(
    `SELECT id FROM public.condition_status_type WHERE name = 'OPERATIONAL' LIMIT 1`,
  );

  const item = await pool.query(
    `INSERT INTO public.item (code, name, description, condition_status_id, cost, acquisition_date, category_id) VALUES ($1, $2, $3, $4, $5, CURRENT_DATE, $6) RETURNING id`,
    [
      `ITEM-${tag}`,
      `Item ${tag}`,
      `Item ${tag}`,
      conditionStatus.rows[0].id,
      10,
      category.rows[0].id,
    ],
  );

  const locationType = await pool.query(
    `INSERT INTO public.location_type (name, description) VALUES ($1, $2) RETURNING id`,
    [`loc_type_${tag}`, `loc_type_${tag}`],
  );

  const location = await pool.query(
    `INSERT INTO public.location (name, description, parent_id, type_id) VALUES ($1, $2, NULL, $3) RETURNING id`,
    [`location_${tag}`, `location_${tag}`, locationType.rows[0].id],
  );

  const inventory = await pool.query(
    `INSERT INTO public.inventory (amount, location_id, item_id) VALUES ($1, $2, $3) RETURNING id`,
    [stock, location.rows[0].id, item.rows[0].id],
  );

  const periodType = await pool.query(
    `SELECT id FROM public.period_type WHERE name = 'semester' LIMIT 1`,
  );

  const period = await pool.query(
    `INSERT INTO public.period (name, description, start_date, end_date, type_id, is_active) VALUES ($1, $2, CURRENT_DATE, CURRENT_DATE + INTERVAL '120 days', $3, TRUE) RETURNING id`,
    [`period_${tag}`, `period_${tag}`, periodType.rows[0].id],
  );

  const person = await pool.query(
    `INSERT INTO public.person (document_id, first_name, last_name, phone, address) VALUES ($1, $2, $3, $4, $5) RETURNING id`,
    [`DOC-${tag}`, `Name${tag}`, `Last${tag}`, '+1000000000', `Addr ${tag}`],
  );

  const user = await pool.query(
    `INSERT INTO public."user" (name, email, password_hash, is_solvency, is_active, person_id) VALUES ($1, $2, $3, TRUE, TRUE, $4) RETURNING id`,
    [
      `user_${tag}`,
      `user_${tag}@mail.com`,
      '$2a$10$hOLy6hPWtJH0UKpxMivo1eyO4kZwdlbfktFV.cS1v.VBHcdEG/lc2',
      person.rows[0].id,
    ],
  );

  return {
    inventory_id: inventory.rows[0].id,
    period_id: period.rows[0].id,
    user_id: user.rows[0].id,
  };
}

describe('Phase 1 reservation and reservation job hardening', () => {
  test('createReservation exige periodo academico activo', async () => {
    const fixture = await createFixture({ stock: 1 });

    await pool.query(
      `UPDATE public.period SET is_active = FALSE WHERE id = $1`,
      [fixture.period_id],
    );

    await expect(
      createReservation({
        user_id: fixture.user_id,
        processed_by_user_id: fixture.user_id,
        period_id: fixture.period_id,
        booking_date: nowIso(),
        reservation_expires_at: futureIso(30),
        estimated_return_date: futureIso(240),
        observations: 'inactive-period-reserve',
        details: [{ inventory_id: fixture.inventory_id, amount: 1 }],
      }),
    ).rejects.toThrow('422');
  });

  test('convertReservationToLoan bloquea reservas expiradas', async () => {
    const fixture = await createFixture({ stock: 2 });

    const reserve = await createReservation({
      user_id: fixture.user_id,
      processed_by_user_id: fixture.user_id,
      period_id: fixture.period_id,
      booking_date: pastIso(180),
      reservation_expires_at: pastIso(120),
      estimated_return_date: futureIso(1440),
      observations: 'expired-reserve',
      details: [{ inventory_id: fixture.inventory_id, amount: 1 }],
    });

    await expect(
      convertReservationToLoan({
        reservation_id: reserve.reservation_id,
        processed_by_user_id: fixture.user_id,
        booking_date: nowIso(),
        reservation_expires_at: futureIso(30),
        estimated_return_date: futureIso(1440),
        observations: 'should-fail-expired',
      }),
    ).rejects.toThrow('409');
  });

  test('expireReservationJob libera stock y cierra reservas vencidas', async () => {
    const fixture = await createFixture({ stock: 3 });

    const reserve = await createReservation({
      user_id: fixture.user_id,
      processed_by_user_id: fixture.user_id,
      period_id: fixture.period_id,
      booking_date: pastIso(180),
      reservation_expires_at: pastIso(120),
      estimated_return_date: futureIso(1440),
      observations: 'to-expire',
      details: [{ inventory_id: fixture.inventory_id, amount: 2 }],
    });

    const beforeJob = await pool.query(
      `SELECT amount FROM public.inventory WHERE id = $1`,
      [fixture.inventory_id],
    );
    expect(Number(beforeJob.rows[0].amount)).toBe(1);

    const job = await expireReservationJob({
      limit: 20,
      processed_by_user_id: fixture.user_id,
    });
    expect(job.expired_count).toBeGreaterThanOrEqual(1);
    expect(job.released_items).toBeGreaterThanOrEqual(2);

    const closedReserve = await pool.query(
      `SELECT actual_return_date FROM public.movement WHERE id = $1`,
      [reserve.reservation_id],
    );
    expect(closedReserve.rows[0].actual_return_date).not.toBeNull();

    const afterJob = await pool.query(
      `SELECT amount FROM public.inventory WHERE id = $1`,
      [fixture.inventory_id],
    );
    expect(Number(afterJob.rows[0].amount)).toBe(3);
  });
});
