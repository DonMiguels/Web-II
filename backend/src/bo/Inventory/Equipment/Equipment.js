import { createEquipment } from "./methods/createEquipment.js";
import { getEquipmentById } from "./methods/getEquipmentById.js";
import { getEquipmentByCode } from "./methods/getEquipmentByCode.js";
import { getAllEquipment } from "./methods/getAllEquipment.js";
import { updateEquipment } from "./methods/updateEquipment.js";
import { deleteEquipment } from "./methods/deleteEquipment.js";

export class Equipment {
  constructor() {
    this.createEquipment = createEquipment;
    this.getEquipmentById = getEquipmentById;
    this.getEquipmentByCode = getEquipmentByCode;
    this.getAllEquipment = getAllEquipment;
    this.updateEquipment = updateEquipment;
    this.deleteEquipment = deleteEquipment;
  }
}
