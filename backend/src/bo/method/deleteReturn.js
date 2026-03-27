import { DOMAIN_ERROR_CODES, throwDomainError } from '../_shared/domainError.js';

export const deleteReturn = async function(params = {}) {
    throwDomainError({
        statusCode: 409,
        code: DOMAIN_ERROR_CODES.HARD_DELETE_BLOCKED,
        message: 'La devolucion no puede eliminarse fisicamente. Mantenga la trazabilidad historica del ciclo.',
        details: params,
    });
};
