import pool from '../../config/db.js';
import { createLoanWithDetails } from '../../src/bo/Loans/LoanProcess/methods/createLoanWithDetails.js';
import { renewLoan } from '../../src/bo/Loans/LoanProcess/methods/renewLoan.js';
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
  const tag = `t${Date.now()}${Math.floor(Math.random() * 10000)}`;

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

describe('Phase 1 core processes', () => {
  test('no existe sobreprestamo bajo concurrencia', async () => {
    const fixture = await createFixture({ stock: 1 });

    const payload = {
      user_id: fixture.user_id,
      period_id: fixture.period_id,
      booking_date: nowIso(),
      reservation_expires_at: futureIso(30),
      estimated_return_date: futureIso(1440),
      observations: 'concurrency-test',
      details: [{ inventory_id: fixture.inventory_id, amount: 1 }],
    };

    const [r1, r2] = await Promise.allSettled([
      createLoanWithDetails(payload),
      createLoanWithDetails(payload),
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

  test('todo prestamo creado por proceso tiene detail asociado', async () => {
    const fixture = await createFixture({ stock: 2 });

    const created = await createLoanWithDetails({
      user_id: fixture.user_id,
      period_id: fixture.period_id,
      booking_date: nowIso(),
      reservation_expires_at: futureIso(15),
      estimated_return_date: futureIso(300),
      observations: 'detail-test',
      details: [{ inventory_id: fixture.inventory_id, amount: 1 }],
    });

    const detailCount = await pool.query(
      `SELECT COUNT(*)::int AS total FROM public.movement_detail WHERE movement_id = $1`,
      [created.loan_id],
    );

    expect(detailCount.rows[0].total).toBeGreaterThan(0);

    const renewed = await renewLoan({
      loan_id: created.loan_id,
      estimated_return_date: futureIso(720),
      observations: 'renewed',
    });

    expect(Number(renewed.loan_id)).toBe(Number(created.loan_id));
    expect(Number(renewed.renewal_count)).toBe(1);
  });

  test('createLoanWithDetails exige periodo academico activo', async () => {
    const fixture = await createFixture({ stock: 1 });

    await pool.query(
      `UPDATE public.period SET is_active = FALSE WHERE id = $1`,
      [fixture.period_id],
    );

    await expect(
      createLoanWithDetails({
        user_id: fixture.user_id,
        period_id: fixture.period_id,
        booking_date: nowIso(),
        reservation_expires_at: futureIso(20),
        estimated_return_date: futureIso(120),
        observations: 'inactive-period',
        details: [{ inventory_id: fixture.inventory_id, amount: 1 }],
      }),
    ).rejects.toThrow('422');
  });

  test('renewLoan aplica limite maximo de renovaciones por prestamo', async () => {
    const fixture = await createFixture({ stock: 2 });

    const created = await createLoanWithDetails({
      user_id: fixture.user_id,
      period_id: fixture.period_id,
      booking_date: nowIso(),
      reservation_expires_at: futureIso(30),
      estimated_return_date: futureIso(180),
      observations: 'renew-limit',
      details: [{ inventory_id: fixture.inventory_id, amount: 1 }],
    });

    await renewLoan({
      loan_id: created.loan_id,
      estimated_return_date: futureIso(360),
      observations: 'renew-1',
    });
    await renewLoan({
      loan_id: created.loan_id,
      estimated_return_date: futureIso(540),
      observations: 'renew-2',
    });

    await expect(
      renewLoan({
        loan_id: created.loan_id,
        estimated_return_date: futureIso(720),
        observations: 'renew-3',
      }),
    ).rejects.toThrow('409');
  });

  test('renewLoan bloquea renovacion de prestamos en mora', async () => {
    const fixture = await createFixture({ stock: 1 });

    const created = await createLoanWithDetails({
      user_id: fixture.user_id,
      period_id: fixture.period_id,
      booking_date: pastIso(240),
      reservation_expires_at: pastIso(180),
      estimated_return_date: pastIso(60),
      observations: 'renew-overdue',
      details: [{ inventory_id: fixture.inventory_id, amount: 1 }],
    });

    await expect(
      renewLoan({
        loan_id: created.loan_id,
        estimated_return_date: futureIso(240),
        observations: 'renew-overdue-attempt',
      }),
    ).rejects.toThrow('409');
  });

  test('reserva puede convertirse a prestamo y expirar sin dejar stock bloqueado', async () => {
    const fixture = await createFixture({ stock: 2 });

    const reserve = await createReservation({
      user_id: fixture.user_id,
      period_id: fixture.period_id,
      booking_date: nowIso(),
      reservation_expires_at: futureIso(20),
      estimated_return_date: futureIso(1440),
      observations: 'reserve-test',
      details: [{ inventory_id: fixture.inventory_id, amount: 1 }],
    });

    const converted = await convertReservationToLoan({
      reservation_id: reserve.reservation_id,
      booking_date: nowIso(),
      reservation_expires_at: futureIso(20),
      estimated_return_date: futureIso(1440),
      observations: 'converted',
    });

    expect(converted.loan_id).toBeDefined();

    const reserveExpired = await createReservation({
      user_id: fixture.user_id,
      period_id: fixture.period_id,
      booking_date: pastIso(120),
      reservation_expires_at: pastIso(60),
      estimated_return_date: futureIso(1440),
      observations: 'reserve-expire-test',
      details: [{ inventory_id: fixture.inventory_id, amount: 1 }],
    });

    expect(reserveExpired.reservation_id).toBeDefined();

    const job = await expireReservationJob({ limit: 20 });
    expect(job.expired_count).toBeGreaterThanOrEqual(1);
  });

  test('toda devolucion cierra un prestamo valido y repone stock', async () => {
    const fixture = await createFixture({ stock: 1 });

    const loan = await createLoanWithDetails({
      user_id: fixture.user_id,
      period_id: fixture.period_id,
      booking_date: nowIso(),
      reservation_expires_at: futureIso(10),
      estimated_return_date: futureIso(60),
      observations: 'return-test',
      details: [{ inventory_id: fixture.inventory_id, amount: 1 }],
    });

    const returned = await registerReturn({
      loan_id: loan.loan_id,
      user_id: fixture.user_id,
      return_date: nowIso(),
      observations: 'returned',
    });

    expect(returned.closed).toBe(true);

    const loanClosed = await pool.query(
      `SELECT actual_return_date FROM public.movement WHERE id = $1`,
      [loan.loan_id],
    );
    expect(loanClosed.rows[0].actual_return_date).not.toBeNull();

    const stock = await pool.query(
      `SELECT amount FROM public.inventory WHERE id = $1`,
      [fixture.inventory_id],
    );
    expect(Number(stock.rows[0].amount)).toBe(1);
  });
});
