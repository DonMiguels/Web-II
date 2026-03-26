import {
  DOMAIN_ERROR_CODES,
  throwDomainError,
} from '../../../_shared/domainError.js';

export const deleteAcademicPeriod = async function (params = {}) {
  throwDomainError({
    statusCode: 409,
    code: DOMAIN_ERROR_CODES.HARD_DELETE_BLOCKED,
    message:
      'El periodo academico no puede eliminarse fisicamente. Use desactivacion o baja logica gobernada.',
    details: params,
  });
};
