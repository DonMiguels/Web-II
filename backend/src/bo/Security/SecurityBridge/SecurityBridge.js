import { assignSecurityUserProfile } from "./methods/assignSecurityUserProfile.js";
import { removeSecurityUserProfile } from "./methods/removeSecurityUserProfile.js";
import { assignSecuritySubsystemClass } from "./methods/assignSecuritySubsystemClass.js";
import { removeSecuritySubsystemClass } from "./methods/removeSecuritySubsystemClass.js";
import { assignSecurityClassMethod } from "./methods/assignSecurityClassMethod.js";
import { removeSecurityClassMethod } from "./methods/removeSecurityClassMethod.js";
import { assignSecurityMethodProfile } from "./methods/assignSecurityMethodProfile.js";
import { removeSecurityMethodProfile } from "./methods/removeSecurityMethodProfile.js";
import { assignSecurityOptionProfile } from "./methods/assignSecurityOptionProfile.js";
import { removeSecurityOptionProfile } from "./methods/removeSecurityOptionProfile.js";
import { assignSecurityOptionMenu } from "./methods/assignSecurityOptionMenu.js";
import { removeSecurityOptionMenu } from "./methods/removeSecurityOptionMenu.js";

export class SecurityBridge {
  constructor() {
    this.assignSecurityUserProfile = assignSecurityUserProfile;
    this.removeSecurityUserProfile = removeSecurityUserProfile;
    this.assignSecuritySubsystemClass = assignSecuritySubsystemClass;
    this.removeSecuritySubsystemClass = removeSecuritySubsystemClass;
    this.assignSecurityClassMethod = assignSecurityClassMethod;
    this.removeSecurityClassMethod = removeSecurityClassMethod;
    this.assignSecurityMethodProfile = assignSecurityMethodProfile;
    this.removeSecurityMethodProfile = removeSecurityMethodProfile;
    this.assignSecurityOptionProfile = assignSecurityOptionProfile;
    this.removeSecurityOptionProfile = removeSecurityOptionProfile;
    this.assignSecurityOptionMenu = assignSecurityOptionMenu;
    this.removeSecurityOptionMenu = removeSecurityOptionMenu;
  }
}
