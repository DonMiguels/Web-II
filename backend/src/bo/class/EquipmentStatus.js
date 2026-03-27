import {createEquipmentStatus} from "../method/createEquipmentStatus.js";
import {deleteEquipmentStatus} from "../method/deleteEquipmentStatus.js";
import {getAllEquipmentStatuses} from "../method/getAllEquipmentStatuses.js";
import {getEquipmentStatusById} from "../method/getEquipmentStatusById.js";
import {getEquipmentStatusByName} from "../method/getEquipmentStatusByName.js";
import {updateEquipmentStatus} from "../method/updateEquipmentStatus.js";

export class EquipmentStatus {
    constructor() {
        this.createEquipmentStatus = createEquipmentStatus;
        this.deleteEquipmentStatus = deleteEquipmentStatus;
        this.getAllEquipmentStatuses = getAllEquipmentStatuses;
        this.getEquipmentStatusById = getEquipmentStatusById;
        this.getEquipmentStatusByName = getEquipmentStatusByName;
        this.updateEquipmentStatus = updateEquipmentStatus;
    }
}