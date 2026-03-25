import { createLoan } from './methods/createLoan.js';
import { getLoanById } from './methods/getLoanById.js';
import { getLoansByUser } from './methods/getLoansByUser.js';
import { getAllLoans } from './methods/getAllLoans.js';
import { getActiveLoans } from './methods/getActiveLoans.js';
import { updateLoan } from './methods/updateLoan.js';
import { deleteLoan } from './methods/deleteLoan.js';
import { getLoansByEquipment } from './methods/getLoansByEquipment.js';
import { getLoansByComponent } from './methods/getLoansByComponent.js';

export class Loan {
  constructor() {
    this.createLoan = createLoan;
    this.getLoanById = getLoanById;
    this.getLoansByUser = getLoansByUser;
    this.getAllLoans = getAllLoans;
    this.getActiveLoans = getActiveLoans;
    this.updateLoan = updateLoan;
    this.deleteLoan = deleteLoan;
    this.getLoansByEquipment = getLoansByEquipment;
    this.getLoansByComponent = getLoansByComponent;
  }
}
