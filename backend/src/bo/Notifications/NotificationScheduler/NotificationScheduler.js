import { sendReturnReminderBatch } from './methods/sendReturnReminderBatch.js';
import { sendOverdueAlertBatch } from './methods/sendOverdueAlertBatch.js';

export class NotificationScheduler {
  constructor() {
    this.sendReturnReminderBatch = sendReturnReminderBatch;
    this.sendOverdueAlertBatch = sendOverdueAlertBatch;
  }
}
