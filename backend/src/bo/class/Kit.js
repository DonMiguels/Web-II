import { createKit } from "../method/createKit.js";
import { updateKit } from "../method/updateKit.js";
import { deleteKit } from "../method/deleteKit.js";
import { getKitById } from "../method/getKitById.js";
import { getAllKits } from "../method/getAllKits.js";
import { addKitItem } from "../method/addKitItem.js";
import { removeKitItem } from "../method/removeKitItem.js";
import { getKitItems } from "../method/getKitItems.js";

/**
 * Fachada BO de kits de préstamo rápido.
 * Expone los métodos de negocio registrados en el constructor.
 *
 * @class
 */
export class Kit {
  /** Registra las operaciones expuestas por esta entidad. */
  constructor() {
    this.createKit = createKit;
    this.updateKit = updateKit;
    this.deleteKit = deleteKit;
    this.getKitById = getKitById;
    this.getAllKits = getAllKits;
    this.addKitItem = addKitItem;
    this.removeKitItem = removeKitItem;
    this.getKitItems = getKitItems;
  }
}
