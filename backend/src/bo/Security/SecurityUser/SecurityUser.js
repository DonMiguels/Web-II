import { createSecurityUser } from "./methods/createSecurityUser.js";
import { getSecurityUserById } from "./methods/getSecurityUserById.js";
import { getSecurityUserByEmail } from "./methods/getSecurityUserByEmail.js";
import { getAllSecurityUsers } from "./methods/getAllSecurityUsers.js";
import { updateSecurityUser } from "./methods/updateSecurityUser.js";
import { deleteSecurityUser } from "./methods/deleteSecurityUser.js";

export class SecurityUser {
  constructor() {
    this.createSecurityUser = createSecurityUser;
    this.getSecurityUserById = getSecurityUserById;
    this.getSecurityUserByEmail = getSecurityUserByEmail;
    this.getAllSecurityUsers = getAllSecurityUsers;
    this.updateSecurityUser = updateSecurityUser;
    this.deleteSecurityUser = deleteSecurityUser;
  }
}
