import fs from 'fs';
import path from 'path';
import pool from '../../../config/db.js';
import yaml from 'yaml';
import { deleteLoan } from '../../../src/bo/Loans/Loan/methods/deleteLoan.js';
import { deleteReturn } from '../../../src/bo/Returns/Return/methods/deleteReturn.js';
import { deleteNotification } from '../../../src/bo/Notifications/Notification/methods/deleteNotification.js';
import { deleteAudit } from '../../../src/bo/Audit/Audit/methods/deleteAudit.js';
import { deleteAcademicPeriod } from '../../../src/bo/Academic/AcademicPeriod/methods/deleteAcademicPeriod.js';
import { deleteComponent } from '../../../src/bo/Components/Component/methods/deleteComponent.js';
import { deleteInventory } from '../../../src/bo/Inventory/Inventory/methods/deleteInventory.js';
import Security from '../../../src/security/security.js';
import Utils from '../../../src/utils/utils.js';
import {
  PHASE4_HARD_DELETE_WHITELIST,
  PHASE4_SOFT_DELETE_REQUIRED_KEYS,
} from '../../utils/phase4-governance-config.mjs';

function loadQueryCatalog() {
  const queriesPath = path.resolve(process.cwd(), 'config/queries.yaml');
  return yaml.parse(fs.readFileSync(queriesPath, 'utf8')) || {};
}

function getDeleteQueryKeys(queries) {
  return Object.entries(queries)
    .filter(
      ([, definition]) =>
        typeof definition?.query === 'string' &&
        /\bDELETE\s+FROM\b/i.test(definition.query),
    )
    .map(([queryKey]) => queryKey)
    .sort();
}

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

async function createInventoryFixture({ amount = 3 } = {}) {
  const tag = `p4inv${Date.now().toString(36)}${Math.floor(
    Math.random() * 1_000_000,
  ).toString(36)}`;

  const locationType = await pool.query(
    `INSERT INTO public.location_type (name, description) VALUES ($1, $2) RETURNING id`,
    [`loc_type_${tag}`, `loc_type_${tag}`],
  );

  const location = await pool.query(
    `INSERT INTO public.location (name, description, parent_id, type_id) VALUES ($1, $2, NULL, $3) RETURNING id`,
    [`location_${tag}`, `location_${tag}`, locationType.rows[0].id],
  );

  const itemId = await createComponentFixture();

  const inventory = await pool.query(
    `INSERT INTO public.inventory (amount, location_id, item_id) VALUES ($1, $2, $3) RETURNING id`,
    [amount, Number(location.rows[0].id), itemId],
  );

  return Number(inventory.rows[0].id);
}

describe('Phase 4 governance', () => {
  test('catalogo legacy evita hard-delete en entidades con soft-delete disponible', () => {
    const queries = loadQueryCatalog();

    for (const queryKey of PHASE4_SOFT_DELETE_REQUIRED_KEYS) {
      const statement = String(queries?.[queryKey]?.query || '');
      expect(statement).not.toMatch(/\bDELETE\s+FROM\b/i);
    }
  });

  test('hard-delete residual permanece acotado a whitelist aprobada', () => {
    const queries = loadQueryCatalog();

    expect(getDeleteQueryKeys(queries)).toEqual(PHASE4_HARD_DELETE_WHITELIST);
  });

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

  test('soft-delete de inventario actualiza deleted_at y updated_at', async () => {
    const inventoryId = await createInventoryFixture({ amount: 4 });

    await pool.query(
      `UPDATE public.inventory SET updated_at = NOW() - INTERVAL '2 days', deleted_at = NULL WHERE id = $1`,
      [inventoryId],
    );

    const before = await pool.query(
      `SELECT updated_at, deleted_at FROM public.inventory WHERE id = $1`,
      [inventoryId],
    );

    const deleted = await deleteInventory({ id: inventoryId });
    expect(Number(deleted.inventario_id)).toBe(inventoryId);

    const after = await pool.query(
      `SELECT updated_at, deleted_at FROM public.inventory WHERE id = $1`,
      [inventoryId],
    );

    expect(before.rows[0].deleted_at).toBeNull();
    expect(after.rows[0].deleted_at).not.toBeNull();
    expect(new Date(after.rows[0].updated_at).getTime()).toBeGreaterThan(
      new Date(before.rows[0].updated_at).getTime(),
    );
  });

  test('Security.execute estandariza observabilidad y contrato de error', async () => {
    const security = new Security();

    const success = await security.execute(
      {
        subsystem: 'Users',
        class: 'User',
        method: 'getAllUsers',
      },
      {},
    );

    expect(success.statusCode).toBe(200);
    expect(success.observability?.process_name).toContain(
      'dispatcher:Users.User.getAllUsers',
    );
    expect(success.observability?.transaction_id).toBeTruthy();
    expect(success.observability?.status_code).toBe(200);

    const failure = await security.execute(
      {
        subsystem: 'Users',
        class: 'User',
        method: 'metodoInexistenteFase4',
      },
      {},
    );

    expect(failure.statusCode).toBe(404);
    expect(failure.code).toBe('NOT_FOUND');
    expect(failure.error?.code).toBe('NOT_FOUND');
    expect(failure.observability?.status_code).toBe(404);
    expect(failure.observability?.process_name).toContain(
      'dispatcher:Users.User.metodoInexistenteFase4',
    );
  });

  test('Security.execute conserva codigo de dominio en errores de negocio', async () => {
    const security = new Security();

    const failure = await security.execute(
      {
        subsystem: 'Loans',
        class: 'Loan',
        method: 'deleteLoan',
      },
      {
        id: 999999,
      },
    );

    expect(failure.statusCode).toBe(409);
    expect(failure.code).toBe('HARD_DELETE_BLOCKED');
    expect(failure.error?.code).toBe('HARD_DELETE_BLOCKED');
    expect(failure.observability?.status_code).toBe(409);
    expect(failure.observability?.process_name).toContain(
      'dispatcher:Loans.Loan.deleteLoan',
    );
  });

  test('Security.parseStructuredError normaliza errores no estructurados', () => {
    const security = new Security();
    const fallback = security.parseStructuredError(
      new Error('error-no-estructurado'),
    );

    expect(fallback.statusCode).toBe(500);
    expect(fallback.code).toBe('UNEXPECTED_ERROR');
    expect(fallback.message).toBe('error-no-estructurado');
    expect(fallback.details?.original_message).toBe('error-no-estructurado');
  });

  test('Utils.handleError expone code y details de forma uniforme', () => {
    const utils = new Utils();

    try {
      utils.handleError({
        message: 'conflicto de negocio',
        statusCode: 409,
        error: {
          code: '23505',
          detail: 'duplicate key value violates unique constraint',
        },
      });
      throw new Error('Se esperaba error estructurado y no ocurrio');
    } catch (error) {
      const payload = JSON.parse(error.message);
      expect(payload.statusCode).toBe(409);
      expect(payload.code).toBe('CONFLICT');
      expect(payload.details?.code).toBe('23505');
      expect(payload.details?.detail).toContain('duplicate key');
    }
  });
});
