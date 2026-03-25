import { createCompensation } from "./methods/createCompensation.js";
import { getCompensationById } from "./methods/getCompensationById.js";
import { getCompensationsByUser } from "./methods/getCompensationsByUser.js";
import { getAllCompensations } from "./methods/getAllCompensations.js";
import { updateCompensation } from "./methods/updateCompensation.js";
import { deleteCompensation } from "./methods/deleteCompensation.js";

export class Compensation {
  constructor() {
    this.createCompensation = createCompensation;
    this.getCompensationById = getCompensationById;
    this.getCompensationsByUser = getCompensationsByUser;
    this.getAllCompensations = getAllCompensations;
    this.updateCompensation = updateCompensation;
    this.deleteCompensation = deleteCompensation;
  }
}
