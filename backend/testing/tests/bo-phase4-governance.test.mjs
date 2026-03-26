import pool from '../../config/db.js';
import { deleteLoan } from '../../src/bo/Loans/Loan/methods/deleteLoan.js';
import { deleteReturn } from '../../src/bo/Returns/Return/methods/deleteReturn.js';
import { deleteNotification } from '../../src/bo/Notifications/Notification/methods/deleteNotification.js';
import { deleteAudit } from '../../src/bo/Audit/Audit/methods/deleteAudit.js';
import { deleteAcademicPeriod } from '../../src/bo/Academic/AcademicPeriod/methods/deleteAcademicPeriod.js';
import { deleteComponent } from '../../src/bo/Components/Component/methods/deleteComponent.js';

function parseDomainError(error) {
  try {
    return JSON.parse(error.message);
  } catch {
    throw error;
  }
}

async function expectHardDeleteBlocked(fn, params = {}) {
  try {
    await fn(params);
    throw new Error('Se esperaba bloqueo de hard-delete y no ocurrio');
  } catch (error) {
    const domain = parseDomainError(error);
    expect(domain.statusCode).toBe(409);
    expect(domain.code).toBe('HARD_DELETE_BLOCKED');
    expect(typeof domain.message).toBe('string');
  }
}

async function createComponentFixture() {
  const tag = `p4${Date.now().toString(36)}${Math.floor(Math.random() * 1_000_000).toString(36)}`;

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
      `ITEM-P4-${tag}`,
      `Item ${tag}`,
      `Item ${tag}`,
      conditionStatus.rows[0].id,
      10,
      category.rows[0].id,
    ],
  );

  return Number(item.rows[0].id);
}

describe('Phase 4 governance', () => {
  test('bloquea hard-delete en entidades historicas', async () => {
    await expectHardDeleteBlocked(deleteLoan, { id: 999999 });
    await expectHardDeleteBlocked(deleteReturn, { id: 999999 });
    await expectHardDeleteBlocked(deleteNotification, { id: 999999 });
    await expectHardDeleteBlocked(deleteAudit, { id: 999999 });
    await expectHardDeleteBlocked(deleteAcademicPeriod, { id: 999999 });
  });

  test('soft-delete de componentes actualiza deleted_at y updated_at', async () => {
    const itemId = await createComponentFixture();

    await pool.query(
      `UPDATE public.item SET updated_at = NOW() - INTERVAL '2 days', deleted_at = NULL WHERE id = $1`,
      [itemId],
    );

    const before = await pool.query(
      `SELECT updated_at, deleted_at FROM public.item WHERE id = $1`,
      [itemId],
    );

    const deleted = await deleteComponent({ id: itemId });
    expect(Number(deleted.componente_id)).toBe(itemId);

    const after = await pool.query(
      `SELECT updated_at, deleted_at FROM public.item WHERE id = $1`,
      [itemId],
    );

    expect(before.rows[0].deleted_at).toBeNull();
    expect(after.rows[0].deleted_at).not.toBeNull();
    expect(new Date(after.rows[0].updated_at).getTime()).toBeGreaterThan(
      new Date(before.rows[0].updated_at).getTime(),
    );
  });
});
