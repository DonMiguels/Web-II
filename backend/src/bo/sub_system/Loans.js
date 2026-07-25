import { Loan } from "../class/Loan.js";

/**
 * Subsistema de préstamos (Loan).
 * Agrupa las clases BO descubiertas por el method_registry.
 *
 * @class
 */
export class Loans {
  /** Registra las operaciones expuestas por esta entidad. */
  constructor() {
    this.loan = Loan;
  }
}
