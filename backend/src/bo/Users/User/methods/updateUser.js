import DBMS from '../../../../dbms/dbms.js';
import {
  DOMAIN_ERROR_CODES,
  rethrowAsDomainError,
  throwDomainError,
} from '../../../_shared/domainError.js';
import { assertSecurityReplicaSynced } from '../../../_shared/userSecurityReplicaSync.js';

export const updateUser = async function (params = {}) {
  const { id, name, email, is_solvency, is_active, person_id } = params || {};

  const userId = Number(id || 0);
  if (!Number.isInteger(userId) || userId <= 0) {
    throwDomainError({
      statusCode: 422,
      code: DOMAIN_ERROR_CODES.VALIDATION_ERROR,
      message: 'id es obligatorio y debe ser entero positivo para updateUser',
    });
  }

  const dbms = new DBMS();
  await dbms.init();
  try {
    const res = await dbms.executeNamedQuery({
      nameQuery: 'updateUser',
      params: {
        id: userId,
        name,
        email,
        is_solvency,
        is_active,
        person_id,
      },
    });

    const row = res?.rows?.[0];
    const updatedUserId = Number(row?.user_id || 0);
    if (Number.isInteger(updatedUserId) && updatedUserId > 0) {
      await assertSecurityReplicaSynced({
        dbms,
        userId: updatedUserId,
        expected: {
          name,
          email,
          is_solvency,
          is_active,
          person_id,
        },
      });
    }

    return row;
  } catch (err) {
    rethrowAsDomainError(err, 'Error ejecutando updateUser');
  }
};
