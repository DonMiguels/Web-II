import { DOMAIN_ERROR_CODES, throwDomainError } from '../../../_shared/domainError.js';

export const deleteNotification = async function(params = {}) {
  throwDomainError({
    statusCode: 409,
    code: DOMAIN_ERROR_CODES.HARD_DELETE_BLOCKED,
    message:
      'La notificacion no puede eliminarse fisicamente. Use marcacion de lectura y filtros logicos.',
    details: params,
  });
};
