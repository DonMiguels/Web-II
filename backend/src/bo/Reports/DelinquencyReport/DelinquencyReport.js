import { getDelinquentUsers } from './methods/getDelinquentUsers.js';

export class DelinquencyReport {
  constructor() {
    this.getDelinquentUsers = getDelinquentUsers;
  }
}
