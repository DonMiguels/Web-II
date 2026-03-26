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
import { transitionItemStatusTx } from '../../../_shared/itemStatusFlow.js';

export const transitionItemStatus = async function (params = {}) {
  const processContext = startProcessContext('transitionItemStatus');
  const { item_id, target_state } = params || {};

  if (!item_id || !target_state) {
    throwDomainError({
      statusCode: 422,
      code: DOMAIN_ERROR_CODES.VALIDATION_ERROR,
      message: 'item_id y target_state son obligatorios',
    });
  }

  const dbms = new DBMS();
  await dbms.init();
  const client = await dbms.beginTransaction();

  try {
    const transition = await transitionItemStatusTx({
      client,
      itemId: item_id,
      targetState: target_state,
      allowSameState: true,
    });

    await dbms.commitTransaction(client);

    return {
      ...transition,
      observability: buildProcessMetadata(processContext, 200),
    };
  } catch (err) {
    await dbms.rollbackTransaction(client);
    rethrowAsDomainError(err, 'Error ejecutando transitionItemStatus');
  } finally {
    await dbms.endTransaction(client);
  }
};
