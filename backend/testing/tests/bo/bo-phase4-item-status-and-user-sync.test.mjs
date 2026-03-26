import pool from '../../../config/db.js';
import { transitionItemStatus } from '../../../src/bo/Inventory/ItemStatusFlow/methods/transitionItemStatus.js';
import { createReservation } from '../../../src/bo/Reservations/Reservation/methods/createReservation.js';
import { convertReservationToLoan } from '../../../src/bo/Reservations/Reservation/methods/convertReservationToLoan.js';
import { registerReturn } from '../../../src/bo/Returns/ReturnProcess/methods/registerReturn.js';
import { createUser } from '../../../src/bo/Users/User/methods/createUser.js';
import { updateUser } from '../../../src/bo/Users/User/methods/updateUser.js';
import { getSecurityUserById } from '../../../src/bo/Security/SecurityUser/methods/getSecurityUserById.js';

const nowIso = () => new Date().toISOString();
const futureIso = (minutes = 60) =>
  new Date(Date.now() + minutes * 60 * 1000).toISOString();

async function createOperationalFixture({
  stock = 1,
  tagPrefix = 'p4fsm',
} = {}) {
  const tag = `${tagPrefix}${Date.now().toString(36)}${Math.floor(
    Math.random() * 1_000_000,
  ).toString(36)}`;

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
    item_id: Number(item.rows[0].id),
    inventory_id: Number(inventory.rows[0].id),
    period_id: Number(period.rows[0].id),
    user_id: Number(user.rows[0].id),
  };
}

async function getItemStatusName(itemId) {
  const status = await pool.query(
    `
      SELECT cst.name
      FROM public.item i
      LEFT JOIN public.condition_status_type cst ON cst.id = i.condition_status_id
      WHERE i.id = $1
      LIMIT 1
    `,
    [itemId],
  );

  return String(status.rows[0]?.name || '');
}

describe('Phase 4 item FSM and Users->Security replica sync', () => {
  test('FSM bloquea transiciones invalidas y permite transiciones validas', async () => {
    const fixture = await createOperationalFixture({
      stock: 1,
      tagPrefix: 'p4fsm-rule',
    });

    const maintenance = await transitionItemStatus({
      item_id: fixture.item_id,
      target_state: 'maintenance',
    });

    expect(maintenance.to_state).toBe('maintenance');
    expect(await getItemStatusName(fixture.item_id)).toBe('IN_MAINTENANCE');

    await expect(
      transitionItemStatus({
        item_id: fixture.item_id,
        target_state: 'reserved',
      }),
    ).rejects.toThrow('409');
  });

  test('FSM operativo integra createReservation -> convertReservationToLoan -> registerReturn', async () => {
    const fixture = await createOperationalFixture({
      stock: 1,
      tagPrefix: 'p4fsm-flow',
    });

    const reservation = await createReservation({
      user_id: fixture.user_id,
      processed_by_user_id: fixture.user_id,
      period_id: fixture.period_id,
      booking_date: nowIso(),
      reservation_expires_at: futureIso(45),
      estimated_return_date: futureIso(180),
      observations: 'fsm reservation',
      details: [{ inventory_id: fixture.inventory_id, amount: 1 }],
    });

    expect(await getItemStatusName(fixture.item_id)).toBe('RESERVED');

    const converted = await convertReservationToLoan({
      reservation_id: reservation.reservation_id,
      processed_by_user_id: fixture.user_id,
      booking_date: nowIso(),
      reservation_expires_at: futureIso(45),
      estimated_return_date: futureIso(180),
      observations: 'fsm convert to loan',
    });

    expect(converted.loan_id).toBeDefined();
    expect(await getItemStatusName(fixture.item_id)).toBe('LOANED');

    const returned = await registerReturn({
      loan_id: converted.loan_id,
      user_id: fixture.user_id,
      processed_by_user_id: fixture.user_id,
      return_date: nowIso(),
      observations: 'fsm return',
    });

    expect(returned.closed).toBe(true);
    expect(await getItemStatusName(fixture.item_id)).toBe('OPERATIONAL');
  });

  test('Users canonico sincroniza visible con SecurityUser replica', async () => {
    const tag = `p4sync${Date.now().toString(36)}${Math.floor(
      Math.random() * 1_000_000,
    ).toString(36)}`;

    const person = await pool.query(
      `INSERT INTO public.person (document_id, first_name, last_name, phone, address) VALUES ($1, $2, $3, $4, $5) RETURNING id`,
      [`DOC-${tag}`, `Name${tag}`, `Last${tag}`, '+1000000000', `Addr ${tag}`],
    );

    const created = await createUser({
      name: `sync_user_${tag}`,
      email: `sync_${tag}@mail.com`,
      password_hash:
        '$2a$10$hOLy6hPWtJH0UKpxMivo1eyO4kZwdlbfktFV.cS1v.VBHcdEG/lc2',
      is_solvency: true,
      is_active: true,
      person_id: Number(person.rows[0].id),
    });

    const createdId = Number(created.user_id);
    expect(createdId).toBeGreaterThan(0);

    const replicaAfterCreate = await getSecurityUserById({ id: createdId });
    expect(Number(replicaAfterCreate.id)).toBe(createdId);
    expect(replicaAfterCreate.name).toBe(`sync_user_${tag}`);
    expect(replicaAfterCreate.email).toBe(`sync_${tag}@mail.com`);

    await updateUser({
      id: createdId,
      name: `sync_user_updated_${tag}`,
      email: `sync_updated_${tag}@mail.com`,
      is_solvency: true,
      is_active: true,
      person_id: Number(person.rows[0].id),
    });

    const replicaAfterUpdate = await getSecurityUserById({ id: createdId });
    expect(replicaAfterUpdate.name).toBe(`sync_user_updated_${tag}`);
    expect(replicaAfterUpdate.email).toBe(`sync_updated_${tag}@mail.com`);
  });
});
