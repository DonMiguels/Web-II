import { DOMAIN_ERROR_CODES, throwDomainError } from '../_shared/domainError.js';

export const deleteLoan = async function(params = {}) {
    throwDomainError({
        statusCode: 409,
        code: DOMAIN_ERROR_CODES.HARD_DELETE_BLOCKED,
        message: 'El prestamo no puede eliminarse fisicamente. Use cierre de proceso y trazabilidad historica.',
        details: params,
    });
};
