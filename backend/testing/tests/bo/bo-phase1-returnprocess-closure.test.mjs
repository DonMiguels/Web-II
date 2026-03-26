import pool from '../../../config/db.js';
import { createLoanWithDetails } from '../../../src/bo/Loans/LoanProcess/methods/createLoanWithDetails.js';
import { registerReturn } from '../../../src/bo/Returns/ReturnProcess/methods/registerReturn.js';

const nowIso = () => new Date().toISOString();
const futureIso = (minutes = 60) =>
  new Date(Date.now() + minutes * 60 * 1000).toISOString();
const pastIso = (minutes = 60) =>
  new Date(Date.now() - minutes * 60 * 1000).toISOString();

async function createFixture({ stock = 3 } = {}) {
  const tag = `rt${Date.now()}${Math.floor(Math.random() * 10000)}`;

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

describe('Phase 1 return process closure hardening', () => {
  test('rechaza devolucion con return_date menor al booking_date del prestamo', async () => {
    const fixture = await createFixture({ stock: 2 });

    const loan = await createLoanWithDetails({
      user_id: fixture.user_id,
      period_id: fixture.period_id,
      booking_date: nowIso(),
      reservation_expires_at: futureIso(30),
      estimated_return_date: futureIso(120),
      observations: 'return-date-validation',
      details: [{ inventory_id: fixture.inventory_id, amount: 1 }],
    });

    await expect(
      registerReturn({
        loan_id: loan.loan_id,
        user_id: fixture.user_id,
        return_date: pastIso(300),
        observations: 'invalid-return-date',
      }),
    ).rejects.toThrow('422');
  });

  test('rechaza devolucion si el periodo del prestamo esta inactivo', async () => {
    const fixture = await createFixture({ stock: 2 });

    const loan = await createLoanWithDetails({
      user_id: fixture.user_id,
      period_id: fixture.period_id,
      booking_date: nowIso(),
      reservation_expires_at: futureIso(30),
      estimated_return_date: futureIso(120),
      observations: 'inactive-period-return',
      details: [{ inventory_id: fixture.inventory_id, amount: 1 }],
    });

    await pool.query(
      `UPDATE public.period SET is_active = FALSE WHERE id = $1`,
      [fixture.period_id],
    );

    await expect(
      registerReturn({
        loan_id: loan.loan_id,
        user_id: fixture.user_id,
        return_date: nowIso(),
        observations: 'period-inactive',
      }),
    ).rejects.toThrow('422');
  });

  test('cierra prestamo tras devolucion parcial + devolucion final', async () => {
    const fixture = await createFixture({ stock: 2 });

    const loan = await createLoanWithDetails({
      user_id: fixture.user_id,
      period_id: fixture.period_id,
      booking_date: nowIso(),
      reservation_expires_at: futureIso(30),
      estimated_return_date: futureIso(120),
      observations: 'partial-then-close',
      details: [{ inventory_id: fixture.inventory_id, amount: 2 }],
    });

    const loanDetail = await pool.query(
      `SELECT id FROM public.movement_detail WHERE movement_id = $1 ORDER BY id ASC LIMIT 1`,
      [loan.loan_id],
    );

    const first = await registerReturn({
      loan_id: loan.loan_id,
      user_id: fixture.user_id,
      return_date: nowIso(),
      observations: 'partial-1-2',
      details: [
        {
          movement_detail_id: Number(loanDetail.rows[0].id),
          returned_amount: 1,
          observations: 'partial',
        },
      ],
    });

    expect(first.closed).toBe(false);

    const second = await registerReturn({
      loan_id: loan.loan_id,
      user_id: fixture.user_id,
      return_date: nowIso(),
      observations: 'final-2-2',
      details: [
        {
          movement_detail_id: Number(loanDetail.rows[0].id),
          returned_amount: 1,
          observations: 'final',
        },
      ],
    });

    expect(second.closed).toBe(true);

    const closedLoan = await pool.query(
      `SELECT actual_return_date FROM public.movement WHERE id = $1`,
      [loan.loan_id],
    );
    expect(closedLoan.rows[0].actual_return_date).not.toBeNull();

    const stock = await pool.query(
      `SELECT amount FROM public.inventory WHERE id = $1`,
      [fixture.inventory_id],
    );
    expect(Number(stock.rows[0].amount)).toBe(2);
  });

  test('marca returned_late cuando la devolucion excede fecha estimada', async () => {
    const fixture = await createFixture({ stock: 1 });

    const loan = await createLoanWithDetails({
      user_id: fixture.user_id,
      period_id: fixture.period_id,
      booking_date: pastIso(240),
      reservation_expires_at: pastIso(180),
      estimated_return_date: pastIso(60),
      observations: 'late-return',
      details: [{ inventory_id: fixture.inventory_id, amount: 1 }],
    });

    const returned = await registerReturn({
      loan_id: loan.loan_id,
      user_id: fixture.user_id,
      return_date: nowIso(),
      observations: 'late',
    });

    const status = await pool.query(
      `
        SELECT rst.name
        FROM public.return_status rs
        JOIN public.return_status_type rst ON rst.id = rs.type_id
        JOIN public.movement_detail md ON md.id = rs.movement_detail_id
        WHERE md.movement_id = $1
        ORDER BY rs.id DESC
        LIMIT 1
      `,
      [returned.return_movement_id],
    );

    expect(status.rows[0].name).toBe('returned_late');
  });
});

