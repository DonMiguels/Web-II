import { createItem } from "../method/createItem.js";
import { updateItem } from "../method/updateItem.js";
import { deleteItem } from "../method/deleteItem.js";
import { getItemById } from "../method/getItemById.js";
import { getAllItems } from "../method/getAllItems.js";
import { getItemsByCategory } from "../method/getItemsByCategory.js";
import { getItemCategories } from "../method/getItemCategories.js";
import { getItemConditions } from "../method/getItemConditions.js";
import { getItemStatuses } from "../method/getItemStatuses.js";

/**
 * Fachada BO de ítems de inventario.
 * Expone los métodos de negocio registrados en el constructor.
 *
 * @class
 */
export class Item {
  /** Registra las operaciones expuestas por esta entidad. */
  constructor() {
    this.createItem = createItem;
    this.updateItem = updateItem;
    this.deleteItem = deleteItem;
    this.getItemById = getItemById;
    this.getAllItems = getAllItems;
    this.getItemsByCategory = getItemsByCategory;
    this.getItemCategories = getItemCategories;
    this.getItemConditions = getItemConditions;
    this.getItemStatuses = getItemStatuses;
  }
}
