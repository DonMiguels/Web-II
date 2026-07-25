import { createStock } from "../method/createStock.js";
import { updateStock } from "../method/updateStock.js";
import { deleteStock } from "../method/deleteStock.js";
import { getStockById } from "../method/getStockById.js";
import { getAllStock } from "../method/getAllStock.js";
import { getStockByItem } from "../method/getStockByItem.js";
import { getStockByLocation } from "../method/getStockByLocation.js";

/**
 * Fachada BO de stock por ubicación.
 * Expone los métodos de negocio registrados en el constructor.
 *
 * @class
 */
export class Stock {
  /** Registra las operaciones expuestas por esta entidad. */
  constructor() {
    this.createStock = createStock;
    this.updateStock = updateStock;
    this.deleteStock = deleteStock;
    this.getStockById = getStockById;
    this.getAllStock = getAllStock;
    this.getStockByItem = getStockByItem;
    this.getStockByLocation = getStockByLocation;
  }
}
