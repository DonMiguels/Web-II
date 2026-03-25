import { createSecurityOption } from "./methods/createSecurityOption.js";
import { getSecurityOptionById } from "./methods/getSecurityOptionById.js";
import { getAllSecurityOptions } from "./methods/getAllSecurityOptions.js";
import { updateSecurityOption } from "./methods/updateSecurityOption.js";
import { deleteSecurityOption } from "./methods/deleteSecurityOption.js";

export class SecurityOption {
  constructor() {
    this.createSecurityOption = createSecurityOption;
    this.getSecurityOptionById = getSecurityOptionById;
    this.getAllSecurityOptions = getAllSecurityOptions;
    this.updateSecurityOption = updateSecurityOption;
    this.deleteSecurityOption = deleteSecurityOption;
  }
}
