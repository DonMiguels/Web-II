import {Inventory as InventoryClass} from "../class/Inventory.js";
import {Location} from "../class/Location.js";
import {Equipment} from "../class/Equipment.js";
import {EquipmentStatus} from "../class/EquipmentStatus.js";

export class Inventory {
    constructor() {
        this.inventory = InventoryClass;
        this.location = Location;
        this.equipment = Equipment;
        this.equipmentStatus = EquipmentStatus;
    }
}
