import { createLocation } from "../method/createLocation.js";
import { updateLocation } from "../method/updateLocation.js";
import { deleteLocation } from "../method/deleteLocation.js";
import { getLocationById } from "../method/getLocationById.js";
import { getLocationByName } from "../method/getLocationByName.js";
import { getAllLocations } from "../method/getAllLocations.js";

/**
 * Fachada BO de ubicaciones físicas.
 * Expone los métodos de negocio registrados en el constructor.
 *
 * @class
 */
export class Location {
  /** Registra las operaciones expuestas por esta entidad. */
  constructor() {
    this.createLocation = createLocation;
    this.updateLocation = updateLocation;
    this.deleteLocation = deleteLocation;
    this.getLocationById = getLocationById;
    this.getLocationByName = getLocationByName;
    this.getAllLocations = getAllLocations;
  }
}
