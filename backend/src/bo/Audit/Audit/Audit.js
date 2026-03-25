import { createAudit } from "./methods/createAudit.js";
import { getAuditById } from "./methods/getAuditById.js";
import { getAuditByUser } from "./methods/getAuditByUser.js";
import { getAllAudits } from "./methods/getAllAudits.js";
import { deleteAudit } from "./methods/deleteAudit.js";

export class Audit {
  constructor() {
    this.createAudit = createAudit;
    this.getAuditById = getAuditById;
    this.getAuditByUser = getAuditByUser;
    this.getAllAudits = getAllAudits;
    this.deleteAudit = deleteAudit;
  }
}
