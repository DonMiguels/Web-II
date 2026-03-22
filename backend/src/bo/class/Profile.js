import {getProfileByName} from "../method/getProfileByName.js";
import {createProfile} from "../method/createProfile.js";
import {assignProfileToUser} from "../method/assignProfileToUser.js";


export class Profile {
        constructor() {
            this.createProfile = createProfile;
            this.assignProfileToUser = assignProfileToUser;
            this.getProfileByName = getProfileByName;
        }
}