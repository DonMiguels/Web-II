import { createMaintenance } from "../method/createMaintenance.js";
import { updateMaintenance } from "../method/updateMaintenance.js";
import { deleteMaintenance } from "../method/deleteMaintenance.js";
import { getMaintenanceById } from "../method/getMaintenanceById.js";
import { getAllMaintenances } from "../method/getAllMaintenances.js";
import { getMaintenancesByItem } from "../method/getMaintenancesByItem.js";

/**
 * Fachada BO de mantenimiento de ítems.
 * Expone los métodos de negocio registrados en el constructor.
 *
 * @class
 */
export class Maintenance {
  /** Registra las operaciones expuestas por esta entidad. */
  constructor() {
    this.createMaintenance = createMaintenance;
    this.updateMaintenance = updateMaintenance;
    this.deleteMaintenance = deleteMaintenance;
    this.getMaintenanceById = getMaintenanceById;
    this.getAllMaintenances = getAllMaintenances;
    this.getMaintenancesByItem = getMaintenancesByItem;
  }
}
