import { expireReservationJob } from './methods/expireReservationJob.js';

export class ReservationJob {
  constructor() {
    this.expireReservationJob = expireReservationJob;
  }
}
