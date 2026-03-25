import { createUser } from "./methods/createUser.js";
import { getUserById } from "./methods/getUserById.js";
import { getUserByEmail } from "./methods/getUserByEmail.js";
import { getAllUsers } from "./methods/getAllUsers.js";
import { updateUser } from "./methods/updateUser.js";
import { deleteUser } from "./methods/deleteUser.js";

export class User {
  constructor() {
    this.createUser = createUser;
    this.getUserById = getUserById;
    this.getUserByEmail = getUserByEmail;
    this.getAllUsers = getAllUsers;
    this.updateUser = updateUser;
    this.deleteUser = deleteUser;
  }
}
