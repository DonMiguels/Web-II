import {createLocation} from "../method/createLocation.js";
import {deleteLocation} from "../method/deleteLocation.js";
import {getAllLocations} from "../method/getAllLocations.js";
import {getLocationById} from "../method/getLocationById.js";
import {getLocationByName} from "../method/getLocationByName.js";
import {updateLocation} from "../method/updateLocation.js";

export class Location {
    constructor() {
        this.createLocation = createLocation;
        this.deleteLocation = deleteLocation;
        this.getAllLocations = getAllLocations;
        this.getLocationById = getLocationById;
        this.getLocationByName = getLocationByName;
        this.updateLocation = updateLocation;
    }
}
