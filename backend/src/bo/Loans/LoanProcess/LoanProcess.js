import { createLoanWithDetails } from './methods/createLoanWithDetails.js';
import { renewLoan } from './methods/renewLoan.js';

export class LoanProcess {
  constructor() {
    this.createLoanWithDetails = createLoanWithDetails;
    this.renewLoan = renewLoan;
  }
}
