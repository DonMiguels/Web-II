import { createCompensationFromDamage } from './methods/createCompensationFromDamage.js';
import { settleCompensation } from './methods/settleCompensation.js';

export class CompensationProcess {
  constructor() {
    this.createCompensationFromDamage = createCompensationFromDamage;
    this.settleCompensation = settleCompensation;
  }
}
