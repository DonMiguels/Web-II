import {createEquipment} from "../method/createEquipment.js";
import {deleteEquipment} from "../method/deleteEquipment.js";
import {getAllEquipment} from "../method/getAllEquipment.js";
import {updateEquipment} from "../method/updateEquipment.js";

export class Equipment {
    constructor() {
        this.createEquipment = createEquipment;
        this.deleteEquipment = deleteEquipment;
        this.getAllEquipment = getAllEquipment;
        this.updateEquipment = updateEquipment;
    }
}