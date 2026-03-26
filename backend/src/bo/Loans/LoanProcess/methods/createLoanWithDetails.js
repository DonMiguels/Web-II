import DBMS from '../../../../dbms/dbms.js';
import { getRuntimeEnvSync } from '../../../../../config/env/runtime.js';
import {
  rethrowAsDomainError,
} from '../../../_shared/domainError.js';
import {
  buildProcessMetadata,
  startProcessContext,
} from '../../../_shared/processObservability.js';

function throwBusinessError(statusCode, message) {
  throw new Error(
    JSON.stringify({
      statusCode,
      message,
    }),
  );
}

function assertDetails(details) {
  if (!Array.isArray(details) || details.length === 0) {
    throw new Error('El prestamo requiere al menos un detail');
  }

  for (const detail of details) {
    if (!detail || !Number.isInteger(Number(detail.inventory_id))) {
      throw new Error('Cada detail requiere inventory_id valido');
    }
    if (
      !Number.isInteger(Number(detail.amount)) ||
      Number(detail.amount) <= 0
    ) {
      throw new Error('Cada detail requiere amount mayor a cero');
    }
  }
}

export const createLoanWithDetails = async function (params = {}) {
  const processContext = startProcessContext('createLoanWithDetails');
  const {
    user_id,
    period_id,
    booking_date,
    reservation_expires_at,
    estimated_return_date,
    observations,
    details,
  } = params || {};

  if (!user_id || !period_id || !booking_date || !reservation_expires_at) {
    throw new Error('Faltan campos obligatorios para crear prestamo');
  }

  assertDetails(details);

  const runtimeEnv = getRuntimeEnvSync();
  const maxActiveLoans = Number(runtimeEnv?.limits?.maxActiveLoansGlobal || 5);

  const dbms = new DBMS();
  await dbms.init();

  const client = await dbms.beginTransaction();

  try {
    const borrower = await client.query(
      `
        SELECT id, is_solvency, is_active
        FROM public."user"
        WHERE id = $1
        FOR UPDATE
      `,
      [user_id],
    );

    if (borrower.rowCount === 0) {
      throw new Error('Usuario no existe para prestamo');
    }

    const borrowerRow = borrower.rows[0];
    if (!borrowerRow.is_active) {
      throw new Error('Usuario inactivo no puede solicitar prestamo');
    }
    if (!borrowerRow.is_solvency) {
      throw new Error('Usuario no solvente no puede solicitar prestamo');
    }

    const overdueLoanResult = await client.query(
      `
        SELECT 1
        FROM public.movement
        WHERE user_id = $1
          AND type_id = (SELECT id FROM public.movement_type WHERE name = 'loan')
          AND actual_return_date IS NULL
          AND estimated_return_date < NOW()
        LIMIT 1
      `,
      [user_id],
    );

    if (overdueLoanResult.rowCount > 0) {
      throwBusinessError(
        409,
        'El usuario tiene prestamos vencidos y no puede generar nuevos prestamos',
      );
    }

    const activeLoanCountResult = await client.query(
      `
        SELECT COUNT(*)::int AS total
        FROM public.movement
        WHERE user_id = $1
          AND type_id = (SELECT id FROM public.movement_type WHERE name = 'loan')
          AND actual_return_date IS NULL
      `,
      [user_id],
    );

    const activeLoanCount = Number(activeLoanCountResult.rows[0].total || 0);
    if (activeLoanCount >= maxActiveLoans) {
      throwBusinessError(
        409,
        `Se alcanzo el limite de ${maxActiveLoans} prestamos activos por usuario`,
      );
    }

    const movementInsert = await client.query(
      `
        INSERT INTO public.movement (
          user_id,
          type_id,
          period_id,
          booking_date,
          reservation_expires_at,
          estimated_return_date,
          observations,
          updated_at
        )
        VALUES (
          $1,
          (SELECT id FROM public.movement_type WHERE name = 'loan'),
          $2,
          $3,
          $4,
          $5,
          $6,
          NOW()
        )
        RETURNING id
      `,
      [
        user_id,
        period_id,
        booking_date,
        reservation_expires_at,
        estimated_return_date || null,
        observations || null,
      ],
    );

    const loanId = movementInsert.rows[0].id;

    for (const detail of details) {
      const inventoryId = Number(detail.inventory_id);
      const amount = Number(detail.amount);

      const stockResult = await client.query(
        `
          SELECT id, amount
          FROM public.inventory
          WHERE id = $1
          FOR UPDATE
        `,
        [inventoryId],
      );

      if (stockResult.rowCount === 0) {
        throw new Error(`Inventario no encontrado: ${inventoryId}`);
      }

      const stockRow = stockResult.rows[0];
      if (Number(stockRow.amount) < amount) {
        throw new Error(`Stock insuficiente en inventario ${inventoryId}`);
      }

      await client.query(
        `
          INSERT INTO public.movement_detail (
            movement_date,
            amount,
            fine,
            observations,
            inventory_id,
            movement_id,
            updated_at
          )
          VALUES ($1, $2, 0, $3, $4, $5, NOW())
        `,
        [
          booking_date,
          amount,
          detail.observations || null,
          inventoryId,
          loanId,
        ],
      );

      await client.query(
        `
          UPDATE public.inventory
          SET amount = amount - $2,
              updated_at = NOW()
          WHERE id = $1
        `,
        [inventoryId, amount],
      );
    }

    await dbms.commitTransaction(client);

    return {
      loan_id: loanId,
      detail_count: details.length,
      status: 'loan_created',
      observability: buildProcessMetadata(processContext, 200),
    };
  } catch (err) {
    await dbms.rollbackTransaction(client);
    if (err?.message?.includes('Stock insuficiente')) {
      rethrowAsDomainError(err, 'Conflicto de stock para crear prestamo');
    }
    rethrowAsDomainError(err, 'Error ejecutando createLoanWithDetails');
  } finally {
    await dbms.endTransaction(client);
  }
};
