import { Reservation } from './Reservation/Reservation.js';
import { ReservationJob } from './ReservationJob/ReservationJob.js';

export class Reservations {
  constructor() {
    this.Reservation = Reservation;
    this.ReservationJob = ReservationJob;
  }
}
