import pool from '../../config/db.js';
import { createLoanWithDetails } from '../../src/bo/Loans/LoanProcess/methods/createLoanWithDetails.js';
import { sendReturnReminderBatch } from '../../src/bo/Notifications/NotificationScheduler/methods/sendReturnReminderBatch.js';
import { sendOverdueAlertBatch } from '../../src/bo/Notifications/NotificationScheduler/methods/sendOverdueAlertBatch.js';

const nowIso = () => new Date().toISOString();
const futureIso = (minutes = 60) =>
  new Date(Date.now() + minutes * 60 * 1000).toISOString();
const pastIso = (minutes = 60) =>
  new Date(Date.now() - minutes * 60 * 1000).toISOString();

async function createFixture({ stock = 2, tagPrefix = 'p3' } = {}) {
  const tag = `${tagPrefix}${Date.now().toString(36)}${Math.floor(
    Math.random() * 1_000_000,
  ).toString(36)}`;
  const docToken = `${Math.random().toString(36).slice(2, 8)}${Date.now().toString(36).slice(-6)}`;

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
    [
      `DOC-${docToken}`,
      `Name${tag}`.slice(0, 30),
      `Last${tag}`.slice(0, 30),
      '+1000000000',
      `Addr ${tag}`.slice(0, 100),
    ],
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

describe('Phase 3 notification scheduler', () => {
  test('envia recordatorios en ventana configurable y deduplica ejecuciones repetidas', async () => {
    const fixture = await createFixture({ stock: 1, tagPrefix: 'p3-reminder' });

    await createLoanWithDetails({
      user_id: fixture.user_id,
      period_id: fixture.period_id,
      booking_date: nowIso(),
      reservation_expires_at: futureIso(10),
      estimated_return_date: futureIso(45),
      observations: 'phase3-reminder-loan',
      details: [{ inventory_id: fixture.inventory_id, amount: 1 }],
    });

    const firstRun = await sendReturnReminderBatch({
      window_hours: 2,
      dedup_hours: 24,
      limit: 50,
    });

    expect(firstRun.created_count).toBeGreaterThanOrEqual(1);
    expect(firstRun.observability?.process_name).toBe('sendReturnReminderBatch');
    expect(firstRun.observability?.status_code).toBe(200);
    expect(firstRun.observability?.transaction_id).toBeTruthy();

    const secondRun = await sendReturnReminderBatch({
      window_hours: 2,
      dedup_hours: 24,
      limit: 50,
    });

    expect(secondRun.created_count).toBe(0);
    expect(secondRun.skipped_dedup_count).toBeGreaterThanOrEqual(1);

    const reminderType = await pool.query(
      `SELECT id FROM public.notification_type WHERE name = 'warning' LIMIT 1`,
    );

    const reminders = await pool.query(
      `SELECT COUNT(*)::int AS total
       FROM public.notification
       WHERE user_id = $1
         AND type_id = $2
         AND title ILIKE 'Recordatorio de devolucion | prestamo #%'
      `,
      [fixture.user_id, reminderType.rows[0].id],
    );

    expect(reminders.rows[0].total).toBeGreaterThanOrEqual(1);
  });

  test('emite alertas por retraso de forma periodica respetando cooldown de deduplicacion', async () => {
    const fixture = await createFixture({ stock: 1, tagPrefix: 'p3-overdue' });

    const loan = await createLoanWithDetails({
      user_id: fixture.user_id,
      period_id: fixture.period_id,
      booking_date: pastIso(240),
      reservation_expires_at: pastIso(230),
      estimated_return_date: pastIso(120),
      observations: 'phase3-overdue-loan',
      details: [{ inventory_id: fixture.inventory_id, amount: 1 }],
    });

    expect(loan.loan_id).toBeDefined();

    const firstRun = await sendOverdueAlertBatch({
      dedup_hours: 24,
      limit: 50,
    });

    expect(firstRun.created_count).toBeGreaterThanOrEqual(1);
    expect(firstRun.observability?.process_name).toBe('sendOverdueAlertBatch');
    expect(firstRun.observability?.status_code).toBe(200);
    expect(firstRun.observability?.transaction_id).toBeTruthy();

    const secondRun = await sendOverdueAlertBatch({
      dedup_hours: 24,
      limit: 50,
    });

    expect(secondRun.created_count).toBe(0);

    const alertType = await pool.query(
      `SELECT id FROM public.notification_type WHERE name = 'critical' LIMIT 1`,
    );

    await pool.query(
      `
        UPDATE public.notification
        SET sent_at = NOW() - INTERVAL '26 hours'
        WHERE user_id = $1
          AND type_id = $2
          AND title ILIKE 'Alerta de mora | prestamo #%'
      `,
      [fixture.user_id, alertType.rows[0].id],
    );

    const thirdRun = await sendOverdueAlertBatch({
      dedup_hours: 24,
      limit: 50,
    });

    expect(thirdRun.created_count).toBeGreaterThanOrEqual(1);
  });
});
