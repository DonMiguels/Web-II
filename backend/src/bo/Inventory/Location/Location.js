import { createLocation } from "./methods/createLocation.js";
import { getLocationById } from "./methods/getLocationById.js";
import { getLocationByName } from "./methods/getLocationByName.js";
import { getAllLocations } from "./methods/getAllLocations.js";
import { updateLocation } from "./methods/updateLocation.js";
import { deleteLocation } from "./methods/deleteLocation.js";

export class Location {
  constructor() {
    this.createLocation = createLocation;
    this.getLocationById = getLocationById;
    this.getLocationByName = getLocationByName;
    this.getAllLocations = getAllLocations;
    this.updateLocation = updateLocation;
    this.deleteLocation = deleteLocation;
  }
}
