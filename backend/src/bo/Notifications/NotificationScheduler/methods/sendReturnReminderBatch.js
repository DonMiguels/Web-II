import DBMS from '../../../../dbms/dbms.js';
import { buildReturnReminderTemplate } from './templates.js';

function toPositiveInt(value, fallback) {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) return fallback;
  return parsed;
}

export const sendReturnReminderBatch = async function (params = {}) {
  const { window_hours, dedup_hours, limit, reference_time } = params || {};

  const windowHours = toPositiveInt(window_hours, 24);
  const dedupHours = toPositiveInt(dedup_hours, 12);
  const batchLimit = toPositiveInt(limit, 100);
  const referenceTime = reference_time ? new Date(reference_time) : new Date();

  if (Number.isNaN(referenceTime.getTime())) {
    throw new Error('reference_time invalida');
  }

  const dbms = new DBMS();
  await dbms.init();
  const client = await dbms.beginTransaction();

  try {
    const typeResult = await client.query(
      `SELECT id FROM public.notification_type WHERE name = 'warning' LIMIT 1`,
    );

    if (typeResult.rowCount === 0) {
      throw new Error('No existe notification_type warning');
    }

    const reminderTypeId = Number(typeResult.rows[0].id);

    const candidates = await client.query(
      `
        SELECT
          m.id AS loan_id,
          m.user_id,
          m.estimated_return_date
        FROM public.movement m
        WHERE m.type_id = (SELECT id FROM public.movement_type WHERE name = 'loan')
          AND m.actual_return_date IS NULL
          AND m.estimated_return_date >= $1::timestamptz
          AND m.estimated_return_date <= ($1::timestamptz + ($2::text || ' hours')::interval)
        ORDER BY m.estimated_return_date ASC
        LIMIT $3
      `,
      [referenceTime.toISOString(), String(windowHours), batchLimit],
    );

    let createdCount = 0;
    let skippedDedupCount = 0;

    for (const row of candidates.rows) {
      const loanId = Number(row.loan_id);
      const userId = Number(row.user_id);

      const template = buildReturnReminderTemplate({
        loan_id: loanId,
        estimated_return_date: row.estimated_return_date,
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
          reminderTypeId,
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
          reminderTypeId,
        ],
      );

      createdCount += 1;
    }

    await dbms.commitTransaction(client);

    return {
      process: 'sendReturnReminderBatch',
      window_hours: windowHours,
      dedup_hours: dedupHours,
      candidate_count: candidates.rowCount,
      created_count: createdCount,
      skipped_dedup_count: skippedDedupCount,
    };
  } catch (err) {
    await dbms.rollbackTransaction(client);
    throw new Error(err.message);
  } finally {
    await dbms.endTransaction(client);
  }
};
