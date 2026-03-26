import { recomputeOverdueSolvencyBatch } from './methods/recomputeOverdueSolvencyBatch.js';

export class SolvencyJob {
  constructor() {
    this.recomputeOverdueSolvencyBatch = recomputeOverdueSolvencyBatch;
  }
}
