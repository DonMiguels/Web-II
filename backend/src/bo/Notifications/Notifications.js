import { Notification } from './Notification/Notification.js';
import { NotificationScheduler } from './NotificationScheduler/NotificationScheduler.js';

export class Notifications {
  constructor() {
    this.Notification = Notification;
    this.NotificationScheduler = NotificationScheduler;
  }
}
