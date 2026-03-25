import { createReturn } from "./methods/createReturn.js";
import { getReturnById } from "./methods/getReturnById.js";
import { getReturnsByUser } from "./methods/getReturnsByUser.js";
import { getAllReturns } from "./methods/getAllReturns.js";
import { updateReturn } from "./methods/updateReturn.js";
import { deleteReturn } from "./methods/deleteReturn.js";

export class Return {
  constructor() {
    this.createReturn = createReturn;
    this.getReturnById = getReturnById;
    this.getReturnsByUser = getReturnsByUser;
    this.getAllReturns = getAllReturns;
    this.updateReturn = updateReturn;
    this.deleteReturn = deleteReturn;
  }
}
