import { DOMAIN_ERROR_CODES, throwDomainError } from './domainError.js';

const STATE_DEFINITIONS = {
  available: {
    conditionName: 'OPERATIONAL',
    description: 'Item operational and available for operations',
  },
  reserved: {
    conditionName: 'RESERVED',
    description: 'Item reserved for a pending reservation flow',
  },
  loaned: {
    conditionName: 'LOANED',
    description: 'Item currently loaned to a borrower',
  },
  damaged: {
    conditionName: 'DAMAGED',
    description: 'Item damaged and pending repair or compensation',
  },
  maintenance: {
    conditionName: 'IN_MAINTENANCE',
    description: 'Item under maintenance process',
  },
};

const CONDITION_TO_STATE = {
  OPERATIONAL: 'available',
  RESERVED: 'reserved',
  LOANED: 'loaned',
  DAMAGED: 'damaged',
  IN_MAINTENANCE: 'maintenance',
  LOST: 'damaged',
};

const NORMALIZED_ALIASES = {
  operational: 'available',
  in_maintenance: 'maintenance',
  inmaintenance: 'maintenance',
  maintenance: 'maintenance',
  damaged: 'damaged',
  lost: 'damaged',
  available: 'available',
  reserved: 'reserved',
  loaned: 'loaned',
};

const ALLOWED_TRANSITIONS = {
  available: new Set(['reserved', 'loaned', 'damaged', 'maintenance']),
  reserved: new Set(['available', 'loaned', 'damaged', 'maintenance']),
  loaned: new Set(['available', 'damaged', 'maintenance']),
  damaged: new Set(['maintenance', 'available']),
  maintenance: new Set(['available', 'damaged']),
};

function normalizeState(rawState) {
  const normalized = String(rawState || '')
    .trim()
    .toLowerCase()
    .replace(/-/g, '_')
    .replace(/\s+/g, '_');

  const resolved = NORMALIZED_ALIASES[normalized] || normalized;
  if (!STATE_DEFINITIONS[resolved]) {
    throwDomainError({
      statusCode: 422,
      code: DOMAIN_ERROR_CODES.VALIDATION_ERROR,
      message: `target_state invalido: ${rawState}`,
    });
  }

  return resolved;
}

function stateFromConditionName(conditionName) {
  if (!conditionName) return 'available';
  return CONDITION_TO_STATE[String(conditionName).toUpperCase()] || 'available';
}

async function ensureConditionStatusType(client, canonicalState) {
  const definition = STATE_DEFINITIONS[canonicalState];

  const result = await client.query(
    `
      INSERT INTO public.condition_status_type (
        name,
        description,
        is_active,
        updated_at,
        deleted_at
      )
      VALUES ($1, $2, TRUE, NOW(), NULL)
      ON CONFLICT (name)
      DO UPDATE
        SET description = EXCLUDED.description,
            is_active = TRUE,
            deleted_at = NULL,
            updated_at = NOW()
      RETURNING id, name
    `,
    [definition.conditionName, definition.description],
  );

  return {
    id: Number(result.rows[0].id),
    name: String(result.rows[0].name),
  };
}

async function loadItemForStatusTransition(client, itemId) {
  const itemResult = await client.query(
    `
      SELECT i.id, i.condition_status_id
      FROM public.item i
      WHERE i.id = $1
        AND i.deleted_at IS NULL
      FOR UPDATE
    `,
    [itemId],
  );

  if (itemResult.rowCount === 0) {
    throwDomainError({
      statusCode: 404,
      code: DOMAIN_ERROR_CODES.NOT_FOUND,
      message: `Item no encontrado para transicion de estado: ${itemId}`,
    });
  }

  const itemRow = itemResult.rows[0];
  let conditionStatusName = null;

  if (itemRow.condition_status_id) {
    const statusResult = await client.query(
      `
        SELECT name
        FROM public.condition_status_type
        WHERE id = $1
        LIMIT 1
      `,
      [itemRow.condition_status_id],
    );
    conditionStatusName = statusResult.rows[0]?.name || null;
  }

  return {
    id: itemRow.id,
    condition_status_id: itemRow.condition_status_id,
    condition_status_name: conditionStatusName,
  };
}

function assertValidTransition(fromState, toState) {
  if (fromState === toState) return;

  const allowed = ALLOWED_TRANSITIONS[fromState] || new Set();
  if (!allowed.has(toState)) {
    throwDomainError({
      statusCode: 409,
      code: DOMAIN_ERROR_CODES.CONFLICT,
      message: `Transicion de estado invalida: ${fromState} -> ${toState}`,
      details: {
        from_state: fromState,
        to_state: toState,
      },
    });
  }
}

export async function deriveOperationalStateByItemTx({ client, itemId }) {
  const result = await client.query(
    `
      WITH stock AS (
        SELECT COALESCE(SUM(inv.amount), 0)::int AS available_amount
        FROM public.inventory inv
        WHERE inv.item_id = $1
          AND inv.deleted_at IS NULL
      ),
      open_loans AS (
        SELECT EXISTS (
          SELECT 1
          FROM public.movement m
          JOIN public.movement_detail md ON md.movement_id = m.id
          JOIN public.inventory inv ON inv.id = md.inventory_id
          WHERE inv.item_id = $1
            AND m.type_id = (SELECT id FROM public.movement_type WHERE name = 'loan')
            AND m.actual_return_date IS NULL
        ) AS has_open_loan
      ),
      open_reserves AS (
        SELECT EXISTS (
          SELECT 1
          FROM public.movement m
          JOIN public.movement_detail md ON md.movement_id = m.id
          JOIN public.inventory inv ON inv.id = md.inventory_id
          WHERE inv.item_id = $1
            AND m.type_id = (SELECT id FROM public.movement_type WHERE name = 'reserve')
            AND m.actual_return_date IS NULL
        ) AS has_open_reserve
      )
      SELECT
        s.available_amount,
        l.has_open_loan,
        r.has_open_reserve
      FROM stock s
      CROSS JOIN open_loans l
      CROSS JOIN open_reserves r
    `,
    [itemId],
  );

  const row = result.rows[0] || {
    available_amount: 0,
    has_open_loan: false,
    has_open_reserve: false,
  };

  const availableAmount = Number(row.available_amount || 0);
  const hasOpenLoan = Boolean(row.has_open_loan);
  const hasOpenReserve = Boolean(row.has_open_reserve);

  if (hasOpenLoan && availableAmount <= 0) return 'loaned';
  if (hasOpenReserve && availableAmount <= 0) return 'reserved';
  return 'available';
}

export async function transitionItemStatusTx({
  client,
  itemId,
  targetState,
  allowSameState = true,
}) {
  const normalizedItemId = Number(itemId || 0);
  if (!Number.isInteger(normalizedItemId) || normalizedItemId <= 0) {
    throwDomainError({
      statusCode: 422,
      code: DOMAIN_ERROR_CODES.VALIDATION_ERROR,
      message: 'item_id debe ser entero positivo',
    });
  }

  const toState = normalizeState(targetState);
  const itemRow = await loadItemForStatusTransition(client, normalizedItemId);
  const fromState = stateFromConditionName(itemRow.condition_status_name);

  if (allowSameState && fromState === toState) {
    return {
      item_id: normalizedItemId,
      from_state: fromState,
      to_state: toState,
      changed: false,
      condition_status_name: STATE_DEFINITIONS[toState].conditionName,
    };
  }

  assertValidTransition(fromState, toState);

  const targetCondition = await ensureConditionStatusType(client, toState);

  await client.query(
    `
      UPDATE public.item
      SET condition_status_id = $2,
          updated_at = NOW()
      WHERE id = $1
    `,
    [normalizedItemId, targetCondition.id],
  );

  return {
    item_id: normalizedItemId,
    from_state: fromState,
    to_state: toState,
    changed: true,
    condition_status_name: targetCondition.name,
  };
}

export async function syncItemOperationalStateTx({ client, itemId }) {
  const targetState = await deriveOperationalStateByItemTx({ client, itemId });
  return transitionItemStatusTx({
    client,
    itemId,
    targetState,
    allowSameState: true,
  });
}
