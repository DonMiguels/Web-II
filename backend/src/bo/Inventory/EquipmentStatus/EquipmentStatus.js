import { createEquipmentStatus } from "./methods/createEquipmentStatus.js";
import { getEquipmentStatusById } from "./methods/getEquipmentStatusById.js";
import { getEquipmentStatusByName } from "./methods/getEquipmentStatusByName.js";
import { getAllEquipmentStatuses } from "./methods/getAllEquipmentStatuses.js";
import { updateEquipmentStatus } from "./methods/updateEquipmentStatus.js";
import { deleteEquipmentStatus } from "./methods/deleteEquipmentStatus.js";

export class EquipmentStatus {
  constructor() {
    this.createEquipmentStatus = createEquipmentStatus;
    this.getEquipmentStatusById = getEquipmentStatusById;
    this.getEquipmentStatusByName = getEquipmentStatusByName;
    this.getAllEquipmentStatuses = getAllEquipmentStatuses;
    this.updateEquipmentStatus = updateEquipmentStatus;
    this.deleteEquipmentStatus = deleteEquipmentStatus;
  }
}
