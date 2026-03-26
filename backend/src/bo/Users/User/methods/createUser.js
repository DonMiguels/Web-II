import DBMS from '../../../../dbms/dbms.js';
import {
  DOMAIN_ERROR_CODES,
  rethrowAsDomainError,
  throwDomainError,
} from '../../../_shared/domainError.js';
import { assertSecurityReplicaSynced } from '../../../_shared/userSecurityReplicaSync.js';

export const createUser = async function (params = {}) {
  const { name, email, password_hash, is_solvency, is_active, person_id } =
    params || {};

  if (!name || !password_hash) {
    throwDomainError({
      statusCode: 422,
      code: DOMAIN_ERROR_CODES.VALIDATION_ERROR,
      message: 'name y password_hash son obligatorios para createUser',
    });
  }

  const dbms = new DBMS();
  await dbms.init();
  try {
    const res = await dbms.executeNamedQuery({
      nameQuery: 'insertUser',
      params: {
        name,
        email,
        password_hash,
        is_solvency,
        is_active,
        person_id,
      },
    });

    const row = res?.rows?.[0];
    const userId = Number(row?.user_id || 0);
    if (Number.isInteger(userId) && userId > 0) {
      await assertSecurityReplicaSynced({
        dbms,
        userId,
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
    rethrowAsDomainError(err, 'Error ejecutando createUser');
  }
};
