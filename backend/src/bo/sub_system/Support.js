import { Kit } from "../class/Kit.js";
import { Maintenance } from "../class/Maintenance.js";
import { Compensation } from "../class/Compensation.js";

/**
 * Subsistema de apoyo (Kit, Maintenance, Compensation).
 * Agrupa las clases BO descubiertas por el method_registry.
 *
 * @class
 */
export class Support {
  /** Registra las operaciones expuestas por esta entidad. */
  constructor() {
    this.kit = Kit;
    this.maintenance = Maintenance;
    this.compensation = Compensation;
  }
}
