import DBMS from '../../../../dbms/dbms.js';
import {
  DOMAIN_ERROR_CODES,
  rethrowAsDomainError,
  throwDomainError,
} from '../../../_shared/domainError.js';
import {
  buildProcessMetadata,
  startProcessContext,
} from '../../../_shared/processObservability.js';

function parseDateStrict(rawValue, fieldName) {
  const parsed = new Date(rawValue);
  if (Number.isNaN(parsed.getTime())) {
    throwDomainError({
      statusCode: 422,
      code: DOMAIN_ERROR_CODES.VALIDATION_ERROR,
      message: `Fecha invalida para ${fieldName}`,
    });
  }

  return parsed;
}

function normalizeReturnDetails(paramsDetails, loanDetails) {
  if (!Array.isArray(paramsDetails) || paramsDetails.length === 0) {
    return loanDetails.map((d) => ({
      movement_detail_id: d.id,
      returned_amount: Number(d.amount),
      observations: null,
    }));
  }

  const groupedDetails = new Map();

  for (const detail of paramsDetails) {
    const movementDetailId = Number(detail?.movement_detail_id);
    const returnedAmount = Number(detail?.returned_amount);

    if (!Number.isInteger(movementDetailId)) {
      throwDomainError({
        statusCode: 422,
        code: DOMAIN_ERROR_CODES.VALIDATION_ERROR,
        message: 'Cada detail de retorno requiere movement_detail_id valido',
      });
    }

    if (!Number.isInteger(returnedAmount) || returnedAmount <= 0) {
      throwDomainError({
        statusCode: 422,
        code: DOMAIN_ERROR_CODES.VALIDATION_ERROR,
        message: 'Cada detail de retorno requiere returned_amount mayor a cero',
      });
    }

    const key = String(movementDetailId);
    const current = groupedDetails.get(key);
    if (!current) {
      groupedDetails.set(key, {
        movement_detail_id: movementDetailId,
        returned_amount: returnedAmount,
        observations: detail?.observations || null,
      });
      continue;
    }

    current.returned_amount += returnedAmount;
  }

  return Array.from(groupedDetails.values()).sort(
    (left, right) => left.movement_detail_id - right.movement_detail_id,
  );
}

export const registerReturn = async function (params = {}) {
  const processContext = startProcessContext('registerReturn');
  const { loan_id, user_id, return_date, details, observations } = params || {};

  if (!loan_id || !return_date) {
    throwDomainError({
      statusCode: 422,
      code: DOMAIN_ERROR_CODES.VALIDATION_ERROR,
      message: 'loan_id y return_date son obligatorios',
    });
  }

  const returnDate = parseDateStrict(return_date, 'return_date');

  const dbms = new DBMS();
  await dbms.init();
  const client = await dbms.beginTransaction();

  try {
    await client.query('SET TRANSACTION ISOLATION LEVEL SERIALIZABLE');

    const loanResult = await client.query(
      `
        SELECT id, user_id, period_id, booking_date, estimated_return_date, actual_return_date
        FROM public.movement
        WHERE id = $1
          AND type_id = (SELECT id FROM public.movement_type WHERE name = 'loan')
        FOR UPDATE
      `,
      [loan_id],
    );

    if (loanResult.rowCount === 0) {
      throwDomainError({
        statusCode: 404,
        code: DOMAIN_ERROR_CODES.NOT_FOUND,
        message: 'No existe prestamo valido para cerrar',
      });
    }

    const loan = loanResult.rows[0];
    if (loan.actual_return_date) {
      throwDomainError({
        statusCode: 409,
        code: DOMAIN_ERROR_CODES.CONFLICT,
        message: 'El prestamo ya fue cerrado previamente',
      });
    }

    const loanBookingDate = parseDateStrict(
      loan.booking_date,
      'loan_booking_date',
    );
    if (returnDate < loanBookingDate) {
      throwDomainError({
        statusCode: 422,
        code: DOMAIN_ERROR_CODES.VALIDATION_ERROR,
        message: 'return_date no puede ser menor que booking_date del prestamo',
      });
    }

    const periodResult = await client.query(
      `
        SELECT id, is_active
        FROM public.period
        WHERE id = $1
        FOR UPDATE
      `,
      [loan.period_id],
    );

    if (periodResult.rowCount === 0) {
      throwDomainError({
        statusCode: 404,
        code: DOMAIN_ERROR_CODES.NOT_FOUND,
        message: `Periodo no encontrado: ${loan.period_id}`,
      });
    }

    if (!periodResult.rows[0].is_active) {
      throwDomainError({
        statusCode: 422,
        code: DOMAIN_ERROR_CODES.VALIDATION_ERROR,
        message: 'No se puede registrar devolucion en un periodo inactivo',
      });
    }

    const loanDetailsResult = await client.query(
      `
        SELECT id, inventory_id, amount
        FROM public.movement_detail
        WHERE movement_id = $1
        FOR UPDATE
      `,
      [loan_id],
    );

    if (loanDetailsResult.rowCount === 0) {
      throwDomainError({
        statusCode: 409,
        code: DOMAIN_ERROR_CODES.CONFLICT,
        message: 'No se puede cerrar un prestamo sin detail asociado',
      });
    }

    const loanDetails = loanDetailsResult.rows;
    const detailMap = new Map(loanDetails.map((d) => [Number(d.id), d]));
    const normalizedDetails = normalizeReturnDetails(details, loanDetails);

    const sourceDetailIds = loanDetails.map((d) => Number(d.id));
    const priorReturnedResult = await client.query(
      `
        SELECT source_movement_detail_id, SUM(amount)::int AS returned_amount
        FROM public.movement_detail
        WHERE source_movement_detail_id = ANY($1::bigint[])
        GROUP BY source_movement_detail_id
      `,
      [sourceDetailIds],
    );

    const priorReturnedMap = new Map(
      priorReturnedResult.rows.map((row) => [
        Number(row.source_movement_detail_id),
        Number(row.returned_amount),
      ]),
    );

    const requestedReturnedMap = new Map();
    for (const detail of normalizedDetails) {
      const sourceId = Number(detail.movement_detail_id);
      const accumulated = requestedReturnedMap.get(sourceId) || 0;
      requestedReturnedMap.set(
        sourceId,
        accumulated + Number(detail.returned_amount),
      );
    }

    const returnMovement = await client.query(
      `
        INSERT INTO public.movement (
          user_id,
          type_id,
          period_id,
          booking_date,
          reservation_expires_at,
          actual_return_date,
          observations,
          updated_at
        )
        VALUES (
          $1,
          (SELECT id FROM public.movement_type WHERE name = 'return'),
          $2,
          $3,
          $3,
          $3,
          $4,
          NOW()
        )
        RETURNING id
      `,
      [
        user_id || loan.user_id,
        loan.period_id,
        return_date,
        observations || null,
      ],
    );

    const returnMovementId = returnMovement.rows[0].id;
    const isLate =
      loan.estimated_return_date &&
      new Date(return_date).getTime() >
        new Date(loan.estimated_return_date).getTime();

    for (const detail of normalizedDetails) {
      const original = detailMap.get(Number(detail.movement_detail_id));
      if (!original) {
        throwDomainError({
          statusCode: 404,
          code: DOMAIN_ERROR_CODES.NOT_FOUND,
          message: `Detail de prestamo no encontrado: ${detail.movement_detail_id}`,
        });
      }

      if (
        !Number.isInteger(detail.returned_amount) ||
        detail.returned_amount <= 0 ||
        detail.returned_amount > Number(original.amount)
      ) {
        throwDomainError({
          statusCode: 422,
          code: DOMAIN_ERROR_CODES.VALIDATION_ERROR,
          message: `Cantidad de retorno invalida para detail ${detail.movement_detail_id}`,
        });
      }

      const priorReturned =
        priorReturnedMap.get(Number(detail.movement_detail_id)) || 0;
      const requestedReturned = requestedReturnedMap.get(
        Number(detail.movement_detail_id),
      );
      const remainingAmount = Number(original.amount) - priorReturned;

      if (requestedReturned > remainingAmount) {
        throwDomainError({
          statusCode: 409,
          code: DOMAIN_ERROR_CODES.CONFLICT,
          message: `La devolucion excede el saldo pendiente del detail ${detail.movement_detail_id}`,
        });
      }

      await client.query(
        `
          UPDATE public.inventory
          SET amount = amount + $2,
              updated_at = NOW()
          WHERE id = $1
        `,
        [original.inventory_id, detail.returned_amount],
      );

      const returnDetail = await client.query(
        `
          INSERT INTO public.movement_detail (
            movement_date,
            amount,
            fine,
            observations,
            inventory_id,
            movement_id,
            source_movement_detail_id,
            updated_at
          )
          VALUES ($1, $2, 0, $3, $4, $5, $6, NOW())
          RETURNING id
        `,
        [
          return_date,
          detail.returned_amount,
          detail.observations,
          original.inventory_id,
          returnMovementId,
          original.id,
        ],
      );

      await client.query(
        `
          INSERT INTO public.return_status (
            type_id,
            status_date,
            observations,
            movement_detail_id,
            updated_at
          )
          VALUES (
            (SELECT id FROM public.return_status_type WHERE name = $1),
            $2,
            $3,
            $4,
            NOW()
          )
        `,
        [
          isLate ? 'returned_late' : 'returned_ok',
          return_date,
          detail.observations || null,
          returnDetail.rows[0].id,
        ],
      );
    }

    const pendingResult = await client.query(
      `
        SELECT COUNT(*)::int AS pending_details
        FROM (
          SELECT
            ld.id,
            ld.amount - COALESCE(SUM(rd.amount), 0) AS pending_amount
          FROM public.movement_detail ld
          LEFT JOIN public.movement_detail rd
            ON rd.source_movement_detail_id = ld.id
          WHERE ld.movement_id = $1
          GROUP BY ld.id, ld.amount
        ) balance
        WHERE balance.pending_amount > 0
      `,
      [loan_id],
    );

    const hasPendingDetails = Number(pendingResult.rows[0].pending_details) > 0;

    if (!hasPendingDetails) {
      await client.query(
        `
          UPDATE public.movement
          SET actual_return_date = $2,
              updated_at = NOW()
          WHERE id = $1
        `,
        [loan_id, return_date],
      );
    }

    await dbms.commitTransaction(client);

    return {
      loan_id,
      return_movement_id: returnMovementId,
      closed: !hasPendingDetails,
      observability: buildProcessMetadata(processContext, 200),
    };
  } catch (err) {
    await dbms.rollbackTransaction(client);
    if (err?.code === '40001' || err?.code === '40P01') {
      throwDomainError({
        statusCode: 409,
        code: DOMAIN_ERROR_CODES.CONFLICT,
        message: 'Conflicto concurrente detectado al registrar devolucion',
      });
    }
    rethrowAsDomainError(err, 'Error ejecutando registerReturn');
  } finally {
    await dbms.endTransaction(client);
  }
};
