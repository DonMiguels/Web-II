import { createNotification } from "./methods/createNotification.js";
import { getNotificationById } from "./methods/getNotificationById.js";
import { getNotificationsByUser } from "./methods/getNotificationsByUser.js";
import { getAllNotifications } from "./methods/getAllNotifications.js";
import { updateNotification } from "./methods/updateNotification.js";
import { markNotificationAsRead } from "./methods/markNotificationAsRead.js";
import { deleteNotification } from "./methods/deleteNotification.js";

export class Notification {
  constructor() {
    this.createNotification = createNotification;
    this.getNotificationById = getNotificationById;
    this.getNotificationsByUser = getNotificationsByUser;
    this.getAllNotifications = getAllNotifications;
    this.updateNotification = updateNotification;
    this.markNotificationAsRead = markNotificationAsRead;
    this.deleteNotification = deleteNotification;
  }
}
