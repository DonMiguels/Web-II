import { LoanReport } from './LoanReport/LoanReport.js';
import { SolvencyReport } from './SolvencyReport/SolvencyReport.js';
import { DelinquencyReport } from './DelinquencyReport/DelinquencyReport.js';
import { LoanStatsReport } from './LoanStatsReport/LoanStatsReport.js';

export class Reports {
  constructor() {
    this.LoanReport = LoanReport;
    this.SolvencyReport = SolvencyReport;
    this.DelinquencyReport = DelinquencyReport;
    this.LoanStatsReport = LoanStatsReport;
  }
}
