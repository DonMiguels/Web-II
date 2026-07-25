import Validator from './schemaValidator.js';
import Utils from './utils.js';
import Config from '../config/config.js';
import { msg } from './messages.js';

/**
 * @file Formateador de parámetros para consultas y estructuras.
 * @description Transforma objetos y arreglos a arreglos ordenados según un esquema opcional.
 */

/**
 * @class Formatter
 * @description Formatea parámetros de entrada a arreglos ordenados, con validación estructural opcional.
 */
export default class Formatter {
  /**
   * @description Inicializa el formateador con validador, utilidades y códigos de estado.
   */
  constructor() {
    this.validator = new Validator();
    this.utils = new Utils();
    this.STATUS_CODES = new Config().STATUS_CODES;
  }

  /**
   * @description Formatea parámetros de un objeto.
   * En modo objeto plano, valida (si hay schema) y retorna un arreglo ordenado por rutas.
   * En modo objeto de arrays (retrocompatibilidad), retorna un arreglo de arreglos ordenados.
   * @param {Object} obj - Objeto a formatear.
   * @param {string[]} [orderedArray=['key', 'value']] - Rutas de claves en el orden deseado.
   * @param {Object|null} [schema=null] - Schema estructural opcional para validación.
   * @returns {Array} Arreglo ordenado de valores, o arreglo de arreglos según el modo.
   * @throws {Error} Si la validación falla o falta un parámetro requerido.
   */
  formatObjectParams(obj, orderedArray = ['key', 'value'], schema = null) {
    const isObjectOfArrays =
      obj &&
      typeof obj === 'object' &&
      !Array.isArray(obj) &&
      Object.values(obj).every((v) => Array.isArray(v));

    if (!isObjectOfArrays) {
      if (
        !orderedArray ||
        !Array.isArray(orderedArray) ||
        orderedArray.length === 0
      ) {
        return [];
      }

      if (schema) {
        const validationErrors = this.validator.validateStructuredData(
          obj,
          schema,
        );
        if (validationErrors && validationErrors.length > 0) {
          this.utils.handleError({
            message: msg('invalid_parameters', {
              detail: validationErrors.join('. '),
            }),
            statusCode: this.STATUS_CODES.BAD_REQUEST,
          });
        }
      }

      const ensurePath = (root, path) => {
        const keys = path.split('.');
        let current = root;
        for (const k of keys) {
          if (current == null || !(k in current)) {
            this.utils.handleError({
              message: msg('required_param_missing', { path }),
              statusCode: this.STATUS_CODES.BAD_REQUEST,
            });
          }
          current = current[k];
        }
      };
      orderedArray.forEach((p) => ensurePath(obj, p));

      return this.structureToOrderedArray(obj, orderedArray);
    }

    const validationErrors = this.validator.validateStructuredData(obj, {
      root: 'object_of_arrays',
    });
    if (validationErrors && validationErrors.length > 0) {
      this.utils.handleError({
        message:
          'Invalid array structure for mapping' + validationErrors.join('. '),
        statusCode: this.STATUS_CODES.BAD_REQUEST,
      });
    }

    let result = [];
    let keys = Object.keys(obj);
    if (!orderedArray || !keys || keys.length === 0) {
      return result;
    }

    keys.forEach((key) => {
      const values = obj[key];
      for (const value of values) {
        result.push(this.structureToOrderedArray({ key, value }, orderedArray));
      }
    });
    return result;
  }

  /**
   * @description Formatea un arreglo de objetos a arreglos de valores ordenados.
   * @param {Object[]} array - Arreglo de objetos a formatear.
   * @param {string[]|null} orderedArray - Rutas de claves en el orden deseado; si es nulo, usa el orden de las claves.
   * @returns {Array[]} Arreglo de arreglos de valores.
   * @throws {Error} Si la estructura del arreglo no es válida.
   */
  formatArrayParams(array, orderedArray) {
    const validationErrors = this.validator.validateStructuredData(array, {
      root: 'array_of_objects',
    });
    if (validationErrors && validationErrors.length > 0) {
      this.utils.handleError({
        message:
          'Invalid array structure for mapping' + validationErrors.join('. '),
        statusCode: this.STATUS_CODES.BAD_REQUEST,
      });
    }

    let result = [];
    if (!array || array.length === 0) {
      return result;
    }

    array.forEach((obj) => {
      const keys = Object.keys(obj);
      if (orderedArray)
        result.push(this.structureToOrderedArray(obj, orderedArray));
      else result.push(keys.map((key) => obj[key]));
    });
    return result;
  }

  /**
   * @description Extrae valores de una estructura siguiendo rutas anidadas (p. ej. `a.b.c`).
   * @param {Object} structure - Objeto fuente.
   * @param {string[]} orderedArray - Lista de rutas de claves a extraer en orden.
   * @returns {Array} Valores extraídos en el orden indicado.
   */
  structureToOrderedArray(structure, orderedArray) {
    const result = [];
    orderedArray.forEach((item) => {
      const keys = item.split('.');
      let current = structure;
      keys.forEach((key) => {
        if (
          current != null &&
          Object.prototype.hasOwnProperty.call(current, key)
        ) {
          current = current[key];
        }
      });
      result.push(current);
    });
    return result;
  }
}
