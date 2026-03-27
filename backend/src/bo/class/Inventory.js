import {createInventory} from "../method/createInventory.js";
import {deleteInventory} from "../method/deleteInventory.js";
import {getAllInventories} from "../method/getAllInventories.js";
import {getInventoryById} from "../method/getInventoryById.js";
import {getInventoryByItem} from "../method/getInventoryByItem.js";
import {getInventoryByLocation} from "../method/getInventoryByLocation.js";
import {updateInventory} from "../method/updateInventory.js";

export class Inventory {
    constructor() {
        this.createInventory = createInventory;
        this.deleteInventory = deleteInventory;
        this.getAllInventories = getAllInventories;
        this.getInventoryById = getInventoryById;
        this.getInventoryByItem = getInventoryByItem;
        this.getInventoryByLocation = getInventoryByLocation;
        this.updateInventory = updateInventory;
    }
}
