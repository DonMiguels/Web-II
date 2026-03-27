import {Inventory as InventoryClass} from "../class/Inventory.js";
import {Location} from "../class/Location.js";

export class Inventory {
    constructor() {
        this.inventory = InventoryClass;
        this.location = Location;
    }
}
