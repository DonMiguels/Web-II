import { createReservation } from './methods/createReservation.js';
import { convertReservationToLoan } from './methods/convertReservationToLoan.js';

export class Reservation {
  constructor() {
    this.createReservation = createReservation;
    this.convertReservationToLoan = convertReservationToLoan;
  }
}
