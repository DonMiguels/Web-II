import {createLoan} from "../method/createLoan.js";
import {deleteLoan} from "../method/deleteLoan.js";
import {getActiveLoans} from "../method/getActiveLoans.js";
import {getAllLoans} from "../method/getAllLoans.js";
import {getLoanById} from "../method/getLoanById.js";
import {getLoansByComponent} from "../method/getLoansByComponent.js";
import {getLoansByEquipment} from "../method/getLoansByEquipment.js";
import {getLoansByUser} from "../method/getLoansByUser.js";
import {updateLoan} from "../method/updateLoan.js";
import {createLoanWithDetails} from "../method/createLoanWithDetails.js";
import {renewLoan} from "../method/renewLoan.js";

export class Loan {
    constructor() {
        this.createLoan = createLoan;
        this.deleteLoan = deleteLoan;
        this.getActiveLoans = getActiveLoans;
        this.getAllLoans = getAllLoans;
        this.getLoanById = getLoanById;
        this.getLoansByComponent = getLoansByComponent;
        this.getLoansByEquipment = getLoansByEquipment;
        this.getLoansByUser = getLoansByUser;
        this.updateLoan = updateLoan;
        this.createLoanWithDetails = createLoanWithDetails;
        this.renewLoan = renewLoan;
    }
}
