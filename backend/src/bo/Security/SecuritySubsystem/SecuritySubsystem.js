import { createSecuritySubsystem } from "./methods/createSecuritySubsystem.js";
import { getSecuritySubsystemById } from "./methods/getSecuritySubsystemById.js";
import { getAllSecuritySubsystems } from "./methods/getAllSecuritySubsystems.js";
import { updateSecuritySubsystem } from "./methods/updateSecuritySubsystem.js";
import { deleteSecuritySubsystem } from "./methods/deleteSecuritySubsystem.js";

export class SecuritySubsystem {
  constructor() {
    this.createSecuritySubsystem = createSecuritySubsystem;
    this.getSecuritySubsystemById = getSecuritySubsystemById;
    this.getAllSecuritySubsystems = getAllSecuritySubsystems;
    this.updateSecuritySubsystem = updateSecuritySubsystem;
    this.deleteSecuritySubsystem = deleteSecuritySubsystem;
  }
}
