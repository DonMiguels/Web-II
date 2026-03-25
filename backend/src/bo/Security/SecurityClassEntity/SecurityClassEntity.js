import { createSecurityClass } from "./methods/createSecurityClass.js";
import { getSecurityClassById } from "./methods/getSecurityClassById.js";
import { getAllSecurityClasses } from "./methods/getAllSecurityClasses.js";
import { updateSecurityClass } from "./methods/updateSecurityClass.js";
import { deleteSecurityClass } from "./methods/deleteSecurityClass.js";

export class SecurityClassEntity {
  constructor() {
    this.createSecurityClass = createSecurityClass;
    this.getSecurityClassById = getSecurityClassById;
    this.getAllSecurityClasses = getAllSecurityClasses;
    this.updateSecurityClass = updateSecurityClass;
    this.deleteSecurityClass = deleteSecurityClass;
  }
}
