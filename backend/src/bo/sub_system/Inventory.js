import { Item } from "../class/Item.js";
import { Stock } from "../class/Stock.js";
import { Location } from "../class/Location.js";

/**
 * Subsistema de inventario (Item, Stock, Location).
 * Agrupa las clases BO descubiertas por el method_registry.
 *
 * @class
 */
export class Inventory {
  /** Registra las operaciones expuestas por esta entidad. */
  constructor() {
    this.item = Item;
    this.stock = Stock;
    this.location = Location;
  }
}
