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
import { recomputeUserSolvency } from '../../../_shared/solvency.js';
import { appendBusinessAudit } from '../../../_shared/auditTrail.js';

export const recomputeOverdueSolvencyBatch = async function (params = {}) {
  const processContext = startProcessContext('recomputeOverdueSolvencyBatch');
  const { limit = 100, processed_by_user_id, _session_user_id } = params || {};

  const normalizedLimit = Number(limit);
  const processedByUserId = Number(
    processed_by_user_id || _session_user_id || 0,
  );

  if (!Number.isInteger(normalizedLimit) || normalizedLimit <= 0) {
    throwDomainError({
      statusCode: 422,
      code: DOMAIN_ERROR_CODES.VALIDATION_ERROR,
      message: 'limit debe ser un entero positivo',
    });
  }

  if (!Number.isInteger(processedByUserId) || processedByUserId <= 0) {
    throwDomainError({
      statusCode: 422,
      code: DOMAIN_ERROR_CODES.VALIDATION_ERROR,
      message: 'processed_by_user_id es obligatorio',
    });
  }

  const dbms = new DBMS();
  await dbms.init();
  const client = await dbms.beginTransaction();

  try {
    await client.query('SET TRANSACTION ISOLATION LEVEL SERIALIZABLE');

    const candidateUsers = await client.query(
      `
        WITH target_users AS (
          SELECT DISTINCT m.user_id
          FROM public.movement m
          WHERE m.type_id = (SELECT id FROM public.movement_type WHERE name = 'loan')
            AND m.actual_return_date IS NULL
            AND m.estimated_return_date < NOW()

          UNION

          SELECT DISTINCT c.borrower_user_id AS user_id
          FROM public.compensation c
          WHERE c.deleted_at IS NULL
            AND c.amount_paid <= 0
        )
        SELECT u.id, u.is_solvency
        FROM public."user" u
        JOIN target_users tu ON tu.user_id = u.id
        WHERE u.deleted_at IS NULL
        ORDER BY u.id ASC
        LIMIT $1
        FOR UPDATE SKIP LOCKED
      `,
      [normalizedLimit],
    );

    let changedCount = 0;
    const results = [];

    for (const row of candidateUsers.rows) {
      const previousSolvency = Boolean(row.is_solvency);
      const computed = await recomputeUserSolvency({
        client,
        userId: row.id,
      });

      if (previousSolvency !== Boolean(computed.is_solvency)) {
        changedCount += 1;
      }

      results.push({
        user_id: Number(row.id),
        previous_is_solvency: previousSolvency,
        current_is_solvency: Boolean(computed.is_solvency),
      });
    }

    const auditId = await appendBusinessAudit({
      client,
      actorUserId: processedByUserId,
      method: 'recomputeOverdueSolvencyBatch',
      entityName: 'user',
      details: {
        candidate_count: Number(candidateUsers.rowCount || 0),
        changed_count: changedCount,
      },
    });

    await dbms.commitTransaction(client);

    return {
      candidate_count: candidateUsers.rowCount,
      changed_count: changedCount,
      processed_by_user_id: processedByUserId,
      audit_id: auditId,
      rows: results,
      observability: buildProcessMetadata(processContext, 200),
    };
  } catch (err) {
    await dbms.rollbackTransaction(client);

    if (err?.code === '40001' || err?.code === '40P01') {
      throwDomainError({
        statusCode: 409,
        code: DOMAIN_ERROR_CODES.CONFLICT,
        message:
          'Conflicto concurrente detectado durante recomputeOverdueSolvencyBatch',
      });
    }

    rethrowAsDomainError(err, 'Error ejecutando recomputeOverdueSolvencyBatch');
  } finally {
    await dbms.endTransaction(client);
  }
};
