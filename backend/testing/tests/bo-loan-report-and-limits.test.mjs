import pool from '../../config/db.js';
import { createLoanWithDetails } from '../../src/bo/Loans/LoanProcess/methods/createLoanWithDetails.js';
import { registerReturn } from '../../src/bo/Returns/ReturnProcess/methods/registerReturn.js';
import { getPendingLoansByUser } from '../../src/bo/Reports/LoanReport/methods/getPendingLoansByUser.js';

const nowIso = () => new Date().toISOString();
const futureIso = (minutes = 60) =>
  new Date(Date.now() + minutes * 60 * 1000).toISOString();
const pastIso = (minutes = 60) =>
  new Date(Date.now() - minutes * 60 * 1000).toISOString();

async function createFixture({ stock = 10 } = {}) {
  const tag = `r${Date.now()}${Math.floor(Math.random() * 10000)}`;

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

describe('Loan report and simultaneous limits', () => {
  test('bloquea por limite configurable de prestamos activos', async () => {
    const fixture = await createFixture({ stock: 20 });

    for (let i = 0; i < 5; i += 1) {
      await createLoanWithDetails({
        user_id: fixture.user_id,
        period_id: fixture.period_id,
        booking_date: nowIso(),
        reservation_expires_at: futureIso(60),
        estimated_return_date: futureIso(1440),
        observations: `loan-${i}`,
        details: [{ inventory_id: fixture.inventory_id, amount: 1 }],
      });
    }

    await expect(
      createLoanWithDetails({
        user_id: fixture.user_id,
        period_id: fixture.period_id,
        booking_date: nowIso(),
        reservation_expires_at: futureIso(60),
        estimated_return_date: futureIso(1440),
        observations: 'loan-6',
        details: [{ inventory_id: fixture.inventory_id, amount: 1 }],
      }),
    ).rejects.toThrow('409');
  });

  test('bloquea nuevos prestamos cuando existe mora activa', async () => {
    const fixture = await createFixture({ stock: 10 });

    await createLoanWithDetails({
      user_id: fixture.user_id,
      period_id: fixture.period_id,
      booking_date: pastIso(3000),
      reservation_expires_at: pastIso(2900),
      estimated_return_date: pastIso(2000),
      observations: 'overdue-loan',
      details: [{ inventory_id: fixture.inventory_id, amount: 1 }],
    });

    await expect(
      createLoanWithDetails({
        user_id: fixture.user_id,
        period_id: fixture.period_id,
        booking_date: nowIso(),
        reservation_expires_at: futureIso(60),
        estimated_return_date: futureIso(1440),
        observations: 'blocked-by-overdue',
        details: [{ inventory_id: fixture.inventory_id, amount: 1 }],
      }),
    ).rejects.toThrow('409');
  });

  test('reporte pendiente refleja devolucion parcial y saldos por detail', async () => {
    const fixture = await createFixture({ stock: 5 });

    const loan = await createLoanWithDetails({
      user_id: fixture.user_id,
      period_id: fixture.period_id,
      booking_date: nowIso(),
      reservation_expires_at: futureIso(60),
      estimated_return_date: futureIso(1440),
      observations: 'partial-report',
      details: [{ inventory_id: fixture.inventory_id, amount: 2 }],
    });

    const loanDetail = await pool.query(
      `SELECT id, amount FROM public.movement_detail WHERE movement_id = $1 ORDER BY id ASC LIMIT 1`,
      [loan.loan_id],
    );

    const partialReturn = await registerReturn({
      loan_id: loan.loan_id,
      user_id: fixture.user_id,
      return_date: nowIso(),
      observations: 'partial',
      details: [
        {
          movement_detail_id: Number(loanDetail.rows[0].id),
          returned_amount: 1,
          observations: 'partial 1/2',
        },
      ],
    });

    expect(partialReturn.closed).toBe(false);

    const report = await getPendingLoansByUser({
      user_id: fixture.user_id,
      pending_state: 'all',
      _session_user_id: fixture.user_id,
      _session_profile: 'user',
    });

    expect(report.summary.total_loans).toBe(1);
    expect(report.summary.total_pending_amount).toBe(1);
    expect(report.loans[0].totals.total_pending_amount).toBe(1);
    expect(report.loans[0].details[0].amount_pending).toBe(1);

    const linkedReturnDetail = await pool.query(
      `SELECT source_movement_detail_id FROM public.movement_detail WHERE movement_id = $1 ORDER BY id ASC LIMIT 1`,
      [partialReturn.return_movement_id],
    );

    expect(Number(linkedReturnDetail.rows[0].source_movement_detail_id)).toBe(
      Number(loanDetail.rows[0].id),
    );
  });

  test('perfil user no puede consultar pendientes de otro usuario', async () => {
    const fixtureA = await createFixture({ stock: 3 });
    const fixtureB = await createFixture({ stock: 3 });

    await createLoanWithDetails({
      user_id: fixtureB.user_id,
      period_id: fixtureB.period_id,
      booking_date: nowIso(),
      reservation_expires_at: futureIso(60),
      estimated_return_date: futureIso(1440),
      observations: 'owner-B',
      details: [{ inventory_id: fixtureB.inventory_id, amount: 1 }],
    });

    await expect(
      getPendingLoansByUser({
        user_id: fixtureB.user_id,
        pending_state: 'all',
        _session_user_id: fixtureA.user_id,
        _session_profile: 'user',
      }),
    ).rejects.toThrow('403');
  });
});
