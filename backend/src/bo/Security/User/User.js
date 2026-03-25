import { createUser } from "./methods/createUser.js";

export class User {
  constructor() {
    this.createUser = createUser;
  }
}
