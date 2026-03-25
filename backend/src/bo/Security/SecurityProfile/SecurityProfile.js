import { createSecurityProfile } from "./methods/createSecurityProfile.js";
import { getSecurityProfileById } from "./methods/getSecurityProfileById.js";
import { getAllSecurityProfiles } from "./methods/getAllSecurityProfiles.js";
import { updateSecurityProfile } from "./methods/updateSecurityProfile.js";
import { deleteSecurityProfile } from "./methods/deleteSecurityProfile.js";

export class SecurityProfile {
  constructor() {
    this.createSecurityProfile = createSecurityProfile;
    this.getSecurityProfileById = getSecurityProfileById;
    this.getAllSecurityProfiles = getAllSecurityProfiles;
    this.updateSecurityProfile = updateSecurityProfile;
    this.deleteSecurityProfile = deleteSecurityProfile;
  }
}
