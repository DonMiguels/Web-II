import { Loan } from './Loan/Loan.js';
import { LoanProcess } from './LoanProcess/LoanProcess.js';

export class Loans {
  constructor() {
    this.Loan = Loan;
    this.LoanProcess = LoanProcess;
  }
}
