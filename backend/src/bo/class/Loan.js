import { createLoan } from "../method/createLoan.js";
import { returnLoan } from "../method/returnLoan.js";
import { renewLoan } from "../method/renewLoan.js";
import { cancelLoan } from "../method/cancelLoan.js";
import { updateLoan } from "../method/updateLoan.js";
import { getLoanById } from "../method/getLoanById.js";
import { getAllLoans } from "../method/getAllLoans.js";
import { getLoansByUser } from "../method/getLoansByUser.js";
import { getActiveLoans } from "../method/getActiveLoans.js";
import { getLoanItems } from "../method/getLoanItems.js";
import { getLoanStatuses } from "../method/getLoanStatuses.js";

/**
 * Fachada BO de préstamos y devoluciones.
 * Expone los métodos de negocio registrados en el constructor.
 *
 * @class
 */
export class Loan {
  /** Registra las operaciones expuestas por esta entidad. */
  constructor() {
    this.createLoan = createLoan;
    this.returnLoan = returnLoan;
    this.renewLoan = renewLoan;
    this.cancelLoan = cancelLoan;
    this.updateLoan = updateLoan;
    this.getLoanById = getLoanById;
    this.getAllLoans = getAllLoans;
    this.getLoansByUser = getLoansByUser;
    this.getActiveLoans = getActiveLoans;
    this.getLoanItems = getLoanItems;
    this.getLoanStatuses = getLoanStatuses;
  }
}
