import pool from '../../config/db.js';
import { createLoanWithDetails } from '../../src/bo/Loans/LoanProcess/methods/createLoanWithDetails.js';
import { createReservation } from '../../src/bo/Reservations/Reservation/methods/createReservation.js';
import { convertReservationToLoan } from '../../src/bo/Reservations/Reservation/methods/convertReservationToLoan.js';
import { expireReservationJob } from '../../src/bo/Reservations/ReservationJob/methods/expireReservationJob.js';
import { registerReturn } from '../../src/bo/Returns/ReturnProcess/methods/registerReturn.js';

const nowIso = () => new Date().toISOString();
const futureIso = (minutes = 60) =>
  new Date(Date.now() + minutes * 60 * 1000).toISOString();
const pastIso = (minutes = 60) =>
  new Date(Date.now() - minutes * 60 * 1000).toISOString();

async function createFixture({ stock = 1 } = {}) {
  const tag = `ce${Date.now()}${Math.floor(Math.random() * 10000)}`;

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

describe('Phase 1 E2E concurrency', () => {
  test('no existe sobre-reserva bajo concurrencia para mismo inventario', async () => {
    const fixture = await createFixture({ stock: 1 });

    const payload = {
      user_id: fixture.user_id,
      period_id: fixture.period_id,
      booking_date: nowIso(),
      reservation_expires_at: futureIso(20),
      estimated_return_date: futureIso(120),
      observations: 'reserve-concurrency',
      details: [{ inventory_id: fixture.inventory_id, amount: 1 }],
    };

    const [r1, r2] = await Promise.allSettled([
      createReservation(payload),
      createReservation(payload),
    ]);

    const fulfilled = [r1, r2].filter((r) => r.status === 'fulfilled').length;
    const rejected = [r1, r2].filter((r) => r.status === 'rejected').length;

    expect(fulfilled).toBe(1);
    expect(rejected).toBe(1);

    const stock = await pool.query(
      `SELECT amount FROM public.inventory WHERE id = $1`,
      [fixture.inventory_id],
    );

    expect(Number(stock.rows[0].amount)).toBe(0);
  });

  test('la conversion concurrente de una misma reserva produce un solo prestamo', async () => {
    const fixture = await createFixture({ stock: 1 });

    const reserve = await createReservation({
      user_id: fixture.user_id,
      period_id: fixture.period_id,
      booking_date: nowIso(),
      reservation_expires_at: futureIso(30),
      estimated_return_date: futureIso(120),
      observations: 'reserve-for-convert-race',
      details: [{ inventory_id: fixture.inventory_id, amount: 1 }],
    });

    const payload = {
      reservation_id: reserve.reservation_id,
      booking_date: nowIso(),
      reservation_expires_at: futureIso(30),
      estimated_return_date: futureIso(120),
      observations: 'convert-race',
    };

    const [c1, c2] = await Promise.allSettled([
      convertReservationToLoan(payload),
      convertReservationToLoan(payload),
    ]);

    const fulfilled = [c1, c2].filter((r) => r.status === 'fulfilled').length;
    const rejected = [c1, c2].filter((r) => r.status === 'rejected').length;

    expect(fulfilled).toBe(1);
    expect(rejected).toBe(1);

    const createdLoans = await pool.query(
      `
        SELECT COUNT(*)::int AS total
        FROM public.movement
        WHERE type_id = (SELECT id FROM public.movement_type WHERE name = 'loan')
          AND user_id = $1
          AND observations = $2
      `,
      [fixture.user_id, 'convert-race'],
    );

    expect(Number(createdLoans.rows[0].total)).toBe(1);
  });

  test('expireReservationJob concurrente no duplica liberacion de stock', async () => {
    const fixture = await createFixture({ stock: 2 });

    await createReservation({
      user_id: fixture.user_id,
      period_id: fixture.period_id,
      booking_date: pastIso(180),
      reservation_expires_at: pastIso(120),
      estimated_return_date: futureIso(120),
      observations: 'expire-race',
      details: [{ inventory_id: fixture.inventory_id, amount: 2 }],
    });

    const before = await pool.query(
      `SELECT amount FROM public.inventory WHERE id = $1`,
      [fixture.inventory_id],
    );
    expect(Number(before.rows[0].amount)).toBe(0);

    const [j1, j2] = await Promise.allSettled([
      expireReservationJob({ limit: 10 }),
      expireReservationJob({ limit: 10 }),
    ]);

    const totalExpired = [j1, j2]
      .filter((r) => r.status === 'fulfilled')
      .reduce((acc, r) => acc + Number(r.value.expired_count || 0), 0);

    expect(totalExpired).toBeLessThanOrEqual(1);

    const after = await pool.query(
      `SELECT amount FROM public.inventory WHERE id = $1`,
      [fixture.inventory_id],
    );
    expect(Number(after.rows[0].amount)).toBe(2);
  });

  test('devolucion concurrente no sobre-repone stock ni duplica cierre', async () => {
    const fixture = await createFixture({ stock: 1 });

    const loan = await createLoanWithDetails({
      user_id: fixture.user_id,
      period_id: fixture.period_id,
      booking_date: nowIso(),
      reservation_expires_at: futureIso(20),
      estimated_return_date: futureIso(120),
      observations: 'return-race',
      details: [{ inventory_id: fixture.inventory_id, amount: 1 }],
    });

    const loanDetail = await pool.query(
      `SELECT id FROM public.movement_detail WHERE movement_id = $1 ORDER BY id ASC LIMIT 1`,
      [loan.loan_id],
    );

    const payload = {
      loan_id: loan.loan_id,
      user_id: fixture.user_id,
      return_date: nowIso(),
      observations: 'return-race',
      details: [
        {
          movement_detail_id: Number(loanDetail.rows[0].id),
          returned_amount: 1,
          observations: 'race',
        },
      ],
    };

    const [r1, r2] = await Promise.allSettled([
      registerReturn(payload),
      registerReturn(payload),
    ]);

    const fulfilled = [r1, r2].filter((r) => r.status === 'fulfilled').length;
    const rejected = [r1, r2].filter((r) => r.status === 'rejected').length;

    expect(fulfilled).toBe(1);
    expect(rejected).toBe(1);

    const restored = await pool.query(
      `SELECT amount FROM public.inventory WHERE id = $1`,
      [fixture.inventory_id],
    );
    expect(Number(restored.rows[0].amount)).toBe(1);

    const returnedAmount = await pool.query(
      `
        SELECT COALESCE(SUM(amount), 0)::int AS total
        FROM public.movement_detail
        WHERE source_movement_detail_id = $1
      `,
      [Number(loanDetail.rows[0].id)],
    );
    expect(Number(returnedAmount.rows[0].total)).toBe(1);
  });
});
