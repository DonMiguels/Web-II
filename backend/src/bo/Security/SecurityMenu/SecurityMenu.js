import { createSecurityMenu } from "./methods/createSecurityMenu.js";
import { getSecurityMenuById } from "./methods/getSecurityMenuById.js";
import { getAllSecurityMenus } from "./methods/getAllSecurityMenus.js";
import { updateSecurityMenu } from "./methods/updateSecurityMenu.js";
import { deleteSecurityMenu } from "./methods/deleteSecurityMenu.js";

export class SecurityMenu {
  constructor() {
    this.createSecurityMenu = createSecurityMenu;
    this.getSecurityMenuById = getSecurityMenuById;
    this.getAllSecurityMenus = getAllSecurityMenus;
    this.updateSecurityMenu = updateSecurityMenu;
    this.deleteSecurityMenu = deleteSecurityMenu;
  }
}
