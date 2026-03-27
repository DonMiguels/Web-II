import {Loan as LoanClass} from "../class/Loan.js";
import {Return} from "../class/Return.js";

export class Loans {
    constructor() {
        this.loan = LoanClass;
        this.return = Return;
    }
}
