import {
  DOMAIN_ERROR_CODES,
  throwDomainError,
} from '../../../_shared/domainError.js';

export const deleteAudit = async function (params = {}) {
  throwDomainError({
    statusCode: 409,
    code: DOMAIN_ERROR_CODES.HARD_DELETE_BLOCKED,
    message: 'La auditoria es append-only y no admite eliminacion fisica.',
    details: params,
  });
};
