import { createCompensation } from "../method/createCompensation.js";
import { getCompensationById } from "../method/getCompensationById.js";
import { getCompensationsByUser } from "../method/getCompensationsByUser.js";
import { getAllCompensations } from "../method/getAllCompensations.js";
import { getPaymentMethods } from "../method/getPaymentMethods.js";

/**
 * Fachada BO de compensaciones por daño/pérdida.
 * Expone los métodos de negocio registrados en el constructor.
 *
 * @class
 */
export class Compensation {
  /** Registra las operaciones expuestas por esta entidad. */
  constructor() {
    this.createCompensation = createCompensation;
    this.getCompensationById = getCompensationById;
    this.getCompensationsByUser = getCompensationsByUser;
    this.getAllCompensations = getAllCompensations;
    this.getPaymentMethods = getPaymentMethods;
  }
}
