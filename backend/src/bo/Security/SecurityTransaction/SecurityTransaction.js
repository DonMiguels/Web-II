import { createSecurityTransaction } from "./methods/createSecurityTransaction.js";
import { getSecurityTransactionById } from "./methods/getSecurityTransactionById.js";
import { getAllSecurityTransactions } from "./methods/getAllSecurityTransactions.js";
import { deleteSecurityTransaction } from "./methods/deleteSecurityTransaction.js";

export class SecurityTransaction {
  constructor() {
    this.createSecurityTransaction = createSecurityTransaction;
    this.getSecurityTransactionById = getSecurityTransactionById;
    this.getAllSecurityTransactions = getAllSecurityTransactions;
    this.deleteSecurityTransaction = deleteSecurityTransaction;
  }
}
