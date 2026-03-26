import pool from '../../config/db.js';
import { createLoanWithDetails } from '../../src/bo/Loans/LoanProcess/methods/createLoanWithDetails.js';
import { registerReturn } from '../../src/bo/Returns/ReturnProcess/methods/registerReturn.js';
import { createCompensationFromDamage } from '../../src/bo/Compensations/CompensationProcess/methods/createCompensationFromDamage.js';
import { settleCompensation } from '../../src/bo/Compensations/CompensationProcess/methods/settleCompensation.js';
import { getSolvencyReport } from '../../src/bo/Reports/SolvencyReport/methods/getSolvencyReport.js';
import { getDelinquentUsers } from '../../src/bo/Reports/DelinquencyReport/methods/getDelinquentUsers.js';
import { getLoanStatistics } from '../../src/bo/Reports/LoanStatsReport/methods/getLoanStatistics.js';

const nowIso = () => new Date().toISOString();
const futureIso = (minutes = 60) =>
  new Date(Date.now() + minutes * 60 * 1000).toISOString();
const pastIso = (minutes = 60) =>
  new Date(Date.now() - minutes * 60 * 1000).toISOString();

async function createFixture({ stock = 2, periodNamePrefix = 'period' } = {}) {
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
    [
      `${periodNamePrefix}_${tag}`,
      `${periodNamePrefix}_${tag}`,
      periodType.rows[0].id,
    ],
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

describe('Phase 2 solvency, compensation and reports', () => {
  test('solvencia se recalcula de forma consistente en create/settle compensation', async () => {
    const fixture = await createFixture({
      stock: 1,
      periodNamePrefix: 'p2-solvency',
    });

    const loan = await createLoanWithDetails({
      user_id: fixture.user_id,
      period_id: fixture.period_id,
      booking_date: pastIso(360),
      reservation_expires_at: pastIso(350),
      estimated_return_date: pastIso(120),
      observations: 'phase2-overdue-loan',
      details: [{ inventory_id: fixture.inventory_id, amount: 1 }],
    });

    const loanDetail = await pool.query(
      `SELECT id FROM public.movement_detail WHERE movement_id = $1 ORDER BY id LIMIT 1`,
      [loan.loan_id],
    );

    const paymentMethod = await pool.query(
      `SELECT id FROM public.payment_method_type WHERE name = 'cash' LIMIT 1`,
    );

    const createdComp = await createCompensationFromDamage({
      movement_detail_id: loanDetail.rows[0].id,
      processed_by_user_id: fixture.user_id,
      observations: 'damage pending compensation',
    });

    expect(createdComp.status).toBe('created_pending');

    const userAfterCreate = await pool.query(
      `SELECT is_solvency FROM public."user" WHERE id = $1`,
      [fixture.user_id],
    );
    expect(userAfterCreate.rows[0].is_solvency).toBe(false);

    const returned = await registerReturn({
      loan_id: loan.loan_id,
      user_id: fixture.user_id,
      return_date: nowIso(),
      observations: 'returned for settlement',
    });

    expect(returned.closed).toBe(true);

    const settled = await settleCompensation({
      compensation_id: createdComp.compensation_id,
      processed_by_user_id: fixture.user_id,
      payment_method_type_id: paymentMethod.rows[0].id,
      amount_paid: 50,
      payment_date: nowIso(),
      observations: 'settled in full',
    });

    expect(settled.is_solvency).toBe(true);

    const userAfterSettle = await pool.query(
      `SELECT is_solvency FROM public."user" WHERE id = $1`,
      [fixture.user_id],
    );
    expect(userAfterSettle.rows[0].is_solvency).toBe(true);
  });

  test('reportes son reproducibles con filtros de periodo y estado', async () => {
    const overdueFixture = await createFixture({
      stock: 2,
      periodNamePrefix: 'p2-overdue',
    });
    const closedFixture = await createFixture({
      stock: 2,
      periodNamePrefix: 'p2-closed',
    });

    const overdueLoan = await createLoanWithDetails({
      user_id: overdueFixture.user_id,
      period_id: overdueFixture.period_id,
      booking_date: pastIso(720),
      reservation_expires_at: pastIso(710),
      estimated_return_date: pastIso(240),
      observations: 'phase2-overdue-user',
      details: [{ inventory_id: overdueFixture.inventory_id, amount: 1 }],
    });

    const overdueDetail = await pool.query(
      `SELECT id FROM public.movement_detail WHERE movement_id = $1 ORDER BY id LIMIT 1`,
      [overdueLoan.loan_id],
    );

    await createCompensationFromDamage({
      movement_detail_id: overdueDetail.rows[0].id,
      processed_by_user_id: overdueFixture.user_id,
      observations: 'pending debt signal',
    });

    const closedLoan = await createLoanWithDetails({
      user_id: closedFixture.user_id,
      period_id: closedFixture.period_id,
      booking_date: pastIso(180),
      reservation_expires_at: pastIso(170),
      estimated_return_date: futureIso(60),
      observations: 'phase2-closed-user',
      details: [{ inventory_id: closedFixture.inventory_id, amount: 1 }],
    });

    await registerReturn({
      loan_id: closedLoan.loan_id,
      user_id: closedFixture.user_id,
      return_date: nowIso(),
      observations: 'closed loan for stats',
    });

    const delinquentRun1 = await getDelinquentUsers({
      period_id: overdueFixture.period_id,
      status: 'without_compensation',
      min_days_overdue: 0,
    });

    const delinquentRun2 = await getDelinquentUsers({
      period_id: overdueFixture.period_id,
      status: 'without_compensation',
      min_days_overdue: 0,
    });

    expect(delinquentRun1).toEqual(delinquentRun2);
    expect(delinquentRun1.summary.total_users).toBeGreaterThanOrEqual(0);

    const loanStatsClosed = await getLoanStatistics({
      period_id: closedFixture.period_id,
      pending_state: 'closed',
    });

    expect(loanStatsClosed.summary.closed_loans).toBeGreaterThanOrEqual(1);
    expect(loanStatsClosed.summary.open_loans).toBe(0);

    const nonSolventReport = await getSolvencyReport({
      period_id: overdueFixture.period_id,
      status: 'non_solvent',
      user_id: overdueFixture.user_id,
    });

    expect(nonSolventReport.summary.total_users).toBe(1);
    expect(nonSolventReport.users[0].is_solvency).toBe(false);
  });
});
