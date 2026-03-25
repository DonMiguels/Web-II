import { createProfile } from "./methods/createProfile.js";
import { assignProfileToUser } from "./methods/assignProfileToUser.js";
import { getProfileByName } from "./methods/getProfileByName.js";

export class Profile {
  constructor() {
    this.createProfile = createProfile;
    this.assignProfileToUser = assignProfileToUser;
    this.getProfileByName = getProfileByName;
  }
}
