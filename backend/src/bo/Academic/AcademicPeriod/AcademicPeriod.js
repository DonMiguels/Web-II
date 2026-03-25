import { createAcademicPeriod } from "./methods/createAcademicPeriod.js";
import { getAcademicPeriodById } from "./methods/getAcademicPeriodById.js";
import { getAllAcademicPeriods } from "./methods/getAllAcademicPeriods.js";
import { getAcademicPeriodsActive } from "./methods/getAcademicPeriodsActive.js";
import { updateAcademicPeriod } from "./methods/updateAcademicPeriod.js";
import { deleteAcademicPeriod } from "./methods/deleteAcademicPeriod.js";

export class AcademicPeriod {
  constructor() {
    this.createAcademicPeriod = createAcademicPeriod;
    this.getAcademicPeriodById = getAcademicPeriodById;
    this.getAllAcademicPeriods = getAllAcademicPeriods;
    this.getAcademicPeriodsActive = getAcademicPeriodsActive;
    this.updateAcademicPeriod = updateAcademicPeriod;
    this.deleteAcademicPeriod = deleteAcademicPeriod;
  }
}
