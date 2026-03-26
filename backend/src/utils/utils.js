import fs from 'fs/promises';
import { DOMAIN_ERROR_CODES } from '../bo/_shared/domainError.js';

export default class Utils {
  constructor() {}

  mapStatusToDomainCode(statusCode) {
    if (statusCode === 404) return DOMAIN_ERROR_CODES.NOT_FOUND;
    if (statusCode === 409) return DOMAIN_ERROR_CODES.CONFLICT;
    if (statusCode === 422) return DOMAIN_ERROR_CODES.VALIDATION_ERROR;
    return DOMAIN_ERROR_CODES.UNEXPECTED_ERROR;
  }

  toUpperCaseFirstLetter = (string) =>
    string.charAt(0).toUpperCase() + string.slice(1);

  getAllDinamicMethodNames = (thisArg) =>
    Object.keys(thisArg).filter(
      (method) => typeof thisArg[method] === 'function',
    );

  handleError({ message, statusCode, error = {} }) {
    const normalizedStatus = Number(statusCode) || 500;
    const normalizedCode = this.mapStatusToDomainCode(normalizedStatus);
    const normalizedDetails =
      error && typeof error === 'object'
        ? {
            message: error.message || undefined,
            code: error.code || error.errno || undefined,
            detail: error.detail || undefined,
          }
        : {
            message: error,
          };

    const errPayload = {
      message,
      statusCode: normalizedStatus,
      code: normalizedCode,
      details: normalizedDetails,
      error:
        error && typeof error === 'object'
          ? {
              message: error.message || undefined,
              code: error.code || error.errno || undefined,
              detail: error.detail || undefined,
            }
          : error,
    };
    throw new Error(JSON.stringify(errPayload));
  }
  async readCSV(filePath) {
      try {
          const content = await fs.readFile(filePath, "utf-8");
          const lines = content.split(/\r?\n/).filter(line => line.trim().length > 0);
          if (lines.length === 0) return new Map();
          const headers = lines[0].split(";").map(h => h.trim());
          const idIndex = headers.indexOf("id");
          if (idIndex === -1) {
              throw new Error('Missing required column "id" in CSV headers.');
          }
          const dataById = new Map();
          for (const line of lines.slice(1)) {
              const values = line.split(";").map(v => v.trim());
              const rowObject = headers.reduce((obj, header, i) => {
                  obj[header] = values[i] ?? "";
                  return obj;
              }, {});
              const idValue = values[idIndex];
              if (!idValue) continue;
              dataById.set(idValue, rowObject);
          }
          return structuredClone(dataById);
      } catch (error) {
          console.error("Error reading file:", error.message);
          return new Map();
      }
  }
}