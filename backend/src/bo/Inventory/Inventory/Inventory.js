import { createInventory } from './methods/createInventory.js';
import { getInventoryById } from './methods/getInventoryById.js';
import { getInventoryByLocation } from './methods/getInventoryByLocation.js';
import { getInventoryByItem } from './methods/getInventoryByItem.js';
import { getAllInventories } from './methods/getAllInventories.js';
import { updateInventory } from './methods/updateInventory.js';
import { deleteInventory } from './methods/deleteInventory.js';

export class Inventory {
  constructor() {
    this.createInventory = createInventory;
    this.getInventoryById = getInventoryById;
    this.getInventoryByLocation = getInventoryByLocation;
    this.getInventoryByItem = getInventoryByItem;
    this.getAllInventories = getAllInventories;
    this.updateInventory = updateInventory;
    this.deleteInventory = deleteInventory;
  }
}
