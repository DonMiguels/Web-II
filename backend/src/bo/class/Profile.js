import {getProfileByName} from "../method/getProfileByName.js";
import {createProfile} from "../method/createProfile.js";
import {assignProfileToUser} from "../method/assignProfileToUser.js";


/**
 * Fachada BO de perfiles y asignación.
 * Expone los métodos de negocio registrados en el constructor.
 *
 * @class
 */
export class Profile {
        /** Registra las operaciones expuestas por esta entidad. */
  constructor() {
            this.createProfile = createProfile;
            this.assignProfileToUser = assignProfileToUser;
            this.getProfileByName = getProfileByName;
        }
}
