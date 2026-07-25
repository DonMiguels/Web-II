import fs from 'fs/promises';
import { msg } from './messages.js';

/**
 * @file Utilidades generales del backend.
 * @description Helpers de cadenas, reflexión de métodos, manejo de errores y lectura de CSV.
 */

/**
 * @class Utils
 * @description Colección de utilidades reutilizables en el backend.
 */
export default class Utils {
  /**
   * @description Crea una instancia de Utils.
   */
  constructor() {}

  /**
   * @description Convierte la primera letra de una cadena a mayúscula.
   * @param {string} string - Cadena de entrada.
   * @returns {string} Cadena con la primera letra en mayúscula.
   */
  toUpperCaseFirstLetter = (string) =>
    string.charAt(0).toUpperCase() + string.slice(1);

  /**
   * @description Obtiene los nombres de todas las propiedades que son funciones en un objeto.
   * @param {Object} thisArg - Objeto a inspeccionar.
   * @returns {string[]} Nombres de los métodos dinámicos encontrados.
   */
  getAllDinamicMethodNames = (thisArg) =>
    Object.keys(thisArg).filter(
      (method) => typeof thisArg[method] === 'function',
    );

  /**
   * @description Lanza un error serializado en JSON con mensaje, código HTTP y detalle opcional.
   * @param {Object} options - Opciones del error.
   * @param {string} options.message - Mensaje descriptivo del error.
   * @param {number} options.statusCode - Código de estado HTTP asociado.
   * @param {Object|*} [options.error={}] - Objeto o valor de error original.
   * @throws {Error} Error cuyo mensaje es un JSON con `message`, `statusCode` y `error`.
   */
  handleError({ message, statusCode, error = {} }) {
    const errPayload = {
      message,
      statusCode,
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

  /**
   * @description Lee un archivo CSV delimitado por punto y coma e indexa las filas por la columna `id`.
   * @param {string} filePath - Ruta absoluta o relativa del archivo CSV.
   * @returns {Promise<Map<string, Object>>} Mapa clonado de `id` → fila; vacío si falla o no hay datos.
   * @throws {Error} Si falta la columna requerida `id` en los encabezados (capturado internamente; retorna Map vacío).
   */
  async readCSV(filePath) {
      try {
          const content = await fs.readFile(filePath, "utf-8");
          const lines = content.split(/\r?\n/).filter(line => line.trim().length > 0);
          if (lines.length === 0) return new Map();
          const headers = lines[0].split(";").map(h => h.trim());
          const idIndex = headers.indexOf("id");
          if (idIndex === -1) {
              throw new Error(msg('csv_missing_id_column'));
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
