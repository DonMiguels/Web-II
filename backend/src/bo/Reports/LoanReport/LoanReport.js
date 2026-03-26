import { getPendingLoansByUser } from './methods/getPendingLoansByUser.js';

export class LoanReport {
  constructor() {
    this.getPendingLoansByUser = getPendingLoansByUser;
  }
}
