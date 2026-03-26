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

export const getReservationById = async function (params = {}) {
  const processContext = startProcessContext('getReservationById');
  const { reservation_id } = params || {};

  const reservationId = Number(reservation_id);
  if (!Number.isInteger(reservationId) || reservationId <= 0) {
    throwDomainError({
      statusCode: 422,
      code: DOMAIN_ERROR_CODES.VALIDATION_ERROR,
      message: 'reservation_id debe ser un entero positivo',
    });
  }

  const dbms = new DBMS();
  await dbms.init();

  try {
    const movementResult = await dbms.query(
      `
        SELECT
          m.id AS reservation_id,
          m.user_id,
          m.period_id,
          m.booking_date,
          m.reservation_expires_at,
          m.estimated_return_date,
          m.actual_return_date,
          m.observations,
          m.created_at,
          m.updated_at
        FROM public.movement m
        WHERE m.id = $1
          AND m.type_id = (SELECT id FROM public.movement_type WHERE name = 'reserve')
      `,
      [reservationId],
    );

    if (movementResult.rowCount === 0) {
      throwDomainError({
        statusCode: 404,
        code: DOMAIN_ERROR_CODES.NOT_FOUND,
        message: 'Reserva no encontrada',
      });
    }

    const detailResult = await dbms.query(
      `
        SELECT
          md.id AS movement_detail_id,
          md.inventory_id,
          md.amount,
          md.observations,
          i.item_id,
          it.code AS item_code,
          it.name AS item_name,
          invloc.id AS location_id,
          invloc.name AS location_name
        FROM public.movement_detail md
        JOIN public.inventory i ON i.id = md.inventory_id
        JOIN public.item it ON it.id = i.item_id
        LEFT JOIN public.location invloc ON invloc.id = i.location_id
        WHERE md.movement_id = $1
        ORDER BY md.id ASC
      `,
      [reservationId],
    );

    return {
      reservation: movementResult.rows[0],
      details: detailResult.rows,
      observability: buildProcessMetadata(processContext, 200),
    };
  } catch (err) {
    rethrowAsDomainError(err, 'Error ejecutando getReservationById');
  }
};
