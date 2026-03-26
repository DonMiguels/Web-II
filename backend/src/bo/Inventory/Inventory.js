import { Equipment } from './Equipment/Equipment.js';
import { Location } from './Location/Location.js';
import { EquipmentStatus } from './EquipmentStatus/EquipmentStatus.js';
import { Inventory as InventoryEntity } from './Inventory/Inventory.js';
import { ItemStatusFlow } from './ItemStatusFlow/ItemStatusFlow.js';

export class Inventory {
  constructor() {
    this.Equipment = Equipment;
    this.Location = Location;
    this.EquipmentStatus = EquipmentStatus;
    this.Inventory = InventoryEntity;
    this.ItemStatusFlow = ItemStatusFlow;
  }
}
