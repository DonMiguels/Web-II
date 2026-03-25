import { createSecurityMethod } from "./methods/createSecurityMethod.js";
import { getSecurityMethodById } from "./methods/getSecurityMethodById.js";
import { getAllSecurityMethods } from "./methods/getAllSecurityMethods.js";
import { updateSecurityMethod } from "./methods/updateSecurityMethod.js";
import { deleteSecurityMethod } from "./methods/deleteSecurityMethod.js";

export class SecurityMethodEntity {
  constructor() {
    this.createSecurityMethod = createSecurityMethod;
    this.getSecurityMethodById = getSecurityMethodById;
    this.getAllSecurityMethods = getAllSecurityMethods;
    this.updateSecurityMethod = updateSecurityMethod;
    this.deleteSecurityMethod = deleteSecurityMethod;
  }
}
