import { createReservation } from './methods/createReservation.js';
import { convertReservationToLoan } from './methods/convertReservationToLoan.js';
import { cancelReservation } from './methods/cancelReservation.js';
import { getReservationById } from './methods/getReservationById.js';
import { getReservationsByUser } from './methods/getReservationsByUser.js';

export class Reservation {
  constructor() {
    this.createReservation = createReservation;
    this.convertReservationToLoan = convertReservationToLoan;
    this.cancelReservation = cancelReservation;
    this.getReservationById = getReservationById;
    this.getReservationsByUser = getReservationsByUser;
  }
}
