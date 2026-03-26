import DBMS from '../../../../dbms/dbms.js';
import { buildOverdueAlertTemplate } from './templates.js';
import {
  DOMAIN_ERROR_CODES,
  rethrowAsDomainError,
  throwDomainError,
} from '../../../_shared/domainError.js';
import {
  buildProcessMetadata,
  startProcessContext,
} from '../../../_shared/processObservability.js';
import { appendBusinessAudit } from '../../../_shared/auditTrail.js';

function toPositiveInt(value, fallback) {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) return fallback;
  return parsed;
}

export const sendOverdueAlertBatch = async function (params = {}) {
  const processContext = startProcessContext('sendOverdueAlertBatch');
  const { dedup_hours, limit, reference_time, processed_by_user_id } =
    params || {};

  const dedupHours = toPositiveInt(dedup_hours, 24);
  const batchLimit = toPositiveInt(limit, 100);
  const referenceTime = reference_time ? new Date(reference_time) : new Date();
  const processedByUserId = Number(processed_by_user_id || 0);

  if (!Number.isInteger(processedByUserId) || processedByUserId <= 0) {
    throwDomainError({
      statusCode: 422,
      code: DOMAIN_ERROR_CODES.VALIDATION_ERROR,
      message: 'processed_by_user_id es obligatorio para ejecucion batch',
    });
  }

  if (Number.isNaN(referenceTime.getTime())) {
    throwDomainError({
      statusCode: 422,
      code: DOMAIN_ERROR_CODES.VALIDATION_ERROR,
      message: 'reference_time invalida',
    });
  }

  const dbms = new DBMS();
  await dbms.init();
  const client = await dbms.beginTransaction();

  try {
    const typeResult = await client.query(
      `SELECT id FROM public.notification_type WHERE name = 'critical' LIMIT 1`,
    );

    if (typeResult.rowCount === 0) {
      throwDomainError({
        statusCode: 404,
        code: DOMAIN_ERROR_CODES.NOT_FOUND,
        message: 'No existe notification_type critical',
      });
    }

    const alertTypeId = Number(typeResult.rows[0].id);

    const candidates = await client.query(
      `
        SELECT
          m.id AS loan_id,
          m.user_id,
          m.estimated_return_date,
          GREATEST(0, FLOOR(EXTRACT(EPOCH FROM ($1::timestamptz - m.estimated_return_date)) / 86400))::int AS days_overdue
        FROM public.movement m
        WHERE m.type_id = (SELECT id FROM public.movement_type WHERE name = 'loan')
          AND m.actual_return_date IS NULL
          AND m.estimated_return_date < $1::timestamptz
        ORDER BY m.estimated_return_date ASC
        LIMIT $2
      `,
      [referenceTime.toISOString(), batchLimit],
    );

    let createdCount = 0;
    let skippedDedupCount = 0;

    for (const row of candidates.rows) {
      const loanId = Number(row.loan_id);
      const userId = Number(row.user_id);

      const template = buildOverdueAlertTemplate({
        loan_id: loanId,
        estimated_return_date: row.estimated_return_date,
        days_overdue: Number(row.days_overdue),
      });

      const exists = await client.query(
        `
          SELECT 1
          FROM public.notification n
          WHERE n.user_id = $1
            AND n.type_id = $2
            AND n.title = $3
            AND n.message = $4
            AND n.sent_at >= ($5::timestamptz - ($6::text || ' hours')::interval)
          LIMIT 1
        `,
        [
          userId,
          alertTypeId,
          template.title,
          template.message,
          referenceTime.toISOString(),
          String(dedupHours),
        ],
      );

      if (exists.rowCount > 0) {
        skippedDedupCount += 1;
        continue;
      }

      await client.query(
        `
          INSERT INTO public.notification (title, message, sent_at, is_read, user_id, type_id)
          VALUES ($1, $2, $3, FALSE, $4, $5)
        `,
        [
          template.title,
          template.message,
          referenceTime.toISOString(),
          userId,
          alertTypeId,
        ],
      );

      createdCount += 1;
    }

    const auditId = await appendBusinessAudit({
      client,
      actorUserId: processedByUserId,
      method: 'sendOverdueAlertBatch',
      entityName: 'notification_scheduler',
      details: {
        process: 'sendOverdueAlertBatch',
        candidate_count: Number(candidates.rowCount),
        created_count: createdCount,
        skipped_dedup_count: skippedDedupCount,
        dedup_hours: dedupHours,
      },
    });

    await dbms.commitTransaction(client);

    return {
      process: 'sendOverdueAlertBatch',
      processed_by_user_id: processedByUserId,
      dedup_hours: dedupHours,
      candidate_count: candidates.rowCount,
      created_count: createdCount,
      skipped_dedup_count: skippedDedupCount,
      audit_id: auditId,
      observability: buildProcessMetadata(processContext, 200),
    };
  } catch (err) {
    await dbms.rollbackTransaction(client);
    rethrowAsDomainError(err, 'Error ejecutando sendOverdueAlertBatch');
  } finally {
    await dbms.endTransaction(client);
  }
};
