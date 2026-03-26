import { getLoanStatistics } from './methods/getLoanStatistics.js';

export class LoanStatsReport {
  constructor() {
    this.getLoanStatistics = getLoanStatistics;
  }
}
