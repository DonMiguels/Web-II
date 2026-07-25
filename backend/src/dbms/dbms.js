import pool from '../../config/db.js';
import Config from '../../config/config.js';
import Utils from '../../utils/utils.js';
import Formatter from '../../utils/formatter.js';
import Debugger from '../../utils/debugger.js';
import { msg } from '../../utils/messages.js';

/**
 * @file Capa de acceso a base de datos (singleton).
 * @description Pool, consultas nombradas, transacciones y CRUD genérico sobre tablas.
 */

/**
 * @class DBMS
 * @description Fachada sobre PostgreSQL: conexión, queries nombradas y operaciones CRUD.
 */
export default class DBMS {
  /**
   * @description Crea o reutiliza la instancia singleton; permite inyectar un validador.
   * @param {Object|null} [validatorInstance=null] - Instancia de validador estructural opcional.
   * @returns {DBMS} Instancia única de DBMS.
   */
  constructor(validatorInstance = null) {
    this.utils = new Utils();
    this.config = new Config();
    this.validator = validatorInstance;
    this.formatter = new Formatter();
    this.dbgr = new Debugger();

    if (!DBMS.instance) {
      this.pool = pool;
      this.STATUS_CODES = new Config().STATUS_CODES;

      DBMS.instance = this;
    }
    return DBMS.instance;
  }

  /**
   * @description Carga las consultas nombradas desde la configuración.
   * @returns {Promise<void>}
   */
  async init() {
    this.queries = await this.config.getQueries();
  }

  /**
   * @description Obtiene un cliente del pool de conexiones.
   * @returns {Promise<import('pg').PoolClient>} Cliente conectado.
   * @throws {Error} Si falla la conexión al pool.
   */
  async connection() {
    const activePool = this.pool || pool;
    return await activePool
      .connect()
      .then((cli) => cli)
      .catch((err) => {
        this.utils.handleError({
          message: msg('db_connection_error'),
          statusCode: this.STATUS_CODES.DB_ERROR,
          error: err,
        });
      });
  }

  /**
   * @description Libera un cliente de vuelta al pool.
   * @param {import('pg').PoolClient} client - Cliente a liberar.
   * @returns {void}
   * @throws {Error} Si no se proporciona cliente o falla el release.
   */
  disconnection(client) {
    if (!client) {
      this.utils.handleError({
        message: msg('db_disconnect_client_missing'),
        statusCode: this.STATUS_CODES.BAD_REQUEST,
      });
      return;
    }

    try {
      client.release();
    } catch (err) {
      this.utils.handleError({
        message: msg('db_disconnect_error'),
        statusCode: this.STATUS_CODES.DB_ERROR,
        error: err,
      });
    }
  }

  /**
   * @description Finaliza el pool de conexiones (idempotente si ya está cerrado).
   * @returns {Promise<void>}
   */
  async poolDisconnection() {
    try {
      const activePool = this.pool || pool;
      if (!activePool || activePool.ended || activePool.ending) {
        return;
      }
      await activePool.end();
      console.log('Pool de base de datos finalizado');
    } catch (err) {
      console.warn(
        'Advertencia al finalizar pool de base de datos:',
        err?.message || err,
      );
    }
  }

  /**
   * @description Ejecuta una consulta SQL.
   * Acepta `(queryString, paramsArray)` o `({ query, params })` por compatibilidad.
   * @param {string|Object} arg1 - SQL como string u objeto `{ query, params }`.
   * @param {Array} [arg2] - Parámetros si `arg1` es string.
   * @returns {Promise<import('pg').QueryResult|undefined>} Resultado de la consulta.
   * @throws {Error} Si la consulta es nula o falla la ejecución.
   */
  async query(arg1, arg2) {
    let queryString = null;
    let params = [];

    if (typeof arg1 === 'string') {
      queryString = arg1;
      params = Array.isArray(arg2) ? arg2 : [];
    } else if (arg1 && typeof arg1 === 'object') {
      queryString = arg1.query;
      params = Array.isArray(arg1.params) ? arg1.params : arg1.params || [];
    }

    if (!queryString) {
      this.utils.handleError({
        message: msg('db_null_query'),
        statusCode: this.STATUS_CODES.DB_ERROR,
      });
      return;
    }

    const client = await this.connection();
    try {
      return await client.query(queryString, params);
    } catch (error) {
      try {
        if (
          (error && error.code === '23505') ||
          (typeof queryString === 'string' &&
            queryString.includes('public."transaction"'))
        ) {
          const info = {
            code: error && error.code,
            detail: error && error.detail,
            message: error && error.message,
            query: queryString,
            params,
            stack: new Error().stack,
          };
        }
      } catch (e) {}
      this.utils.handleError({
        message: error.message || msg('server_error'),
        statusCode: this.STATUS_CODES.DB_ERROR,
        error,
      });
    } finally {
      this.disconnection(client);
    }
  }

  /**
   * @description Ejecuta una consulta nombrada definida en `queries.yaml`, con validación y formateo de parámetros.
   * Soporta definición string o `{ query, structure_params, orderArray }`.
   * @param {Object} options - Opciones de ejecución.
   * @param {string} options.nameQuery - Nombre de la consulta en el mapa de queries.
   * @param {Array|Object|string|number|boolean} [options.params=[]] - Parámetros de la consulta.
   * @returns {Promise<import('pg').QueryResult|undefined>} Resultado de la consulta.
   * @throws {Error} Si la consulta no existe, los parámetros son inválidos o falla la ejecución.
   */
  async executeNamedQuery({ nameQuery, params = [] }) {
    if (!this.queries || !this.queries[nameQuery]) {
      this.utils.handleError({
        message: msg('named_query_not_found', { nameQuery }),
        statusCode: this.STATUS_CODES.BAD_REQUEST,
      });
      return;
    }
    const queryDef = this.queries[nameQuery];

    const queryString =
      typeof queryDef === 'string' ? queryDef : queryDef.query;
    const structure =
      typeof queryDef === 'object' && queryDef.structure_params
        ? queryDef.structure_params
        : null;
    const orderArray =
      typeof queryDef === 'object' && Array.isArray(queryDef.orderArray)
        ? queryDef.orderArray
        : null;

    const isFieldSchema =
      structure && typeof structure === 'object' && !structure.root;
    const isObjectParams =
      params && !Array.isArray(params) && typeof params === 'object';
    if (isFieldSchema && orderArray !== null) {
      if (isObjectParams) {
        if (
          this.validator &&
          typeof this.validator.validateStructuredData === 'function'
        ) {
          const errors = this.validator.validateStructuredData(
            params,
            structure,
          );
          if (errors && errors.length > 0) {
            this.utils.handleError({
              message: msg('named_query_invalid_params', { nameQuery, detail: errors.join('. ') }),
              statusCode: this.STATUS_CODES.BAD_REQUEST,
            });
            return;
          }
        }
        params = this.formatter.formatObjectParams(
          params,
          orderArray,
          structure,
        );
      }
      else if (Array.isArray(params)) {
        if (orderArray.length === 0 && params.length === 0) {
        } else {
          if (params.length !== orderArray.length) {
            this.utils.handleError({
              message: msg('named_query_param_count', { nameQuery, expected: orderArray.length, received: params.length }),
              statusCode: this.STATUS_CODES.BAD_REQUEST,
            });
            return;
          }
          const obj = {};
          orderArray.forEach((k, i) => (obj[k] = params[i]));
          if (
            this.validator &&
            typeof this.validator.validateStructuredData === 'function'
          ) {
            const errors = this.validator.validateStructuredData(
              obj,
              structure,
            );
            if (errors && errors.length > 0) {
              this.utils.handleError({
                message: msg('named_query_invalid_params', { nameQuery, detail: errors.join('. ') }),
                statusCode: this.STATUS_CODES.BAD_REQUEST,
              });
              return;
            }
          }
        }
      }
      else if (
        orderArray.length === 1 &&
        (typeof params === 'string' ||
          typeof params === 'number' ||
          typeof params === 'boolean')
      ) {
        const obj = { [orderArray[0]]: params };
        if (
          this.validator &&
          typeof this.validator.validateStructuredData === 'function'
        ) {
          const errors = this.validator.validateStructuredData(obj, structure);
          if (errors && errors.length > 0) {
            this.utils.handleError({
              message: msg('named_query_invalid_params', { nameQuery, detail: errors.join('. ') }),
              statusCode: this.STATUS_CODES.BAD_REQUEST,
            });
            return;
          }
        }
        params = [params];
      }
      else if (
        (params == null ||
          (typeof params === 'object' && Object.keys(params).length === 0)) &&
        orderArray.length === 0
      ) {
        params = [];
      } else if (
        (params == null || (Array.isArray(params) && params.length === 0)) &&
        orderArray.length > 0
      ) {
        this.utils.handleError({
          message: msg('named_query_params_required', { nameQuery }),
          statusCode: this.STATUS_CODES.BAD_REQUEST,
        });
        return;
      }
    } else if (
      structure &&
      this.validator &&
      typeof this.validator.validateStructuredData === 'function'
    ) {
      const errors = this.validator.validateStructuredData(params, structure);
      if (errors && errors.length > 0) {
        this.utils.handleError({
          message: msg('named_query_invalid_params', { nameQuery, detail: errors.join('. ') }),
          statusCode: this.STATUS_CODES.BAD_REQUEST,
        });
        return;
      }
    }

    try {
      const res = await this.query({ query: queryString, params });
      return res;
    } catch (error) {
      return this.utils.handleError({
        message: msg('named_query_exec_error', { nameQuery }),
        statusCode: this.STATUS_CODES.DB_ERROR,
        error,
      });
    }
  }

  /**
   * @description Ejecuta varias consultas nombradas a partir de un objeto clave → parámetros.
   * @param {Object.<string, *>} jsonParams - Mapa de nombre de consulta a parámetros.
   * @returns {Promise<Array>} Resultados de cada consulta nombrada.
   * @throws {Error} Si no hay parámetros o faltan parámetros requeridos.
   */
  async executeJsonNamedQuery(jsonParams) {
    if (!jsonParams || Object.keys(jsonParams).length === 0) {
      this.utils.handleError({
        message:
          'No se proporcionaron parámetros necesarios para executeJsonNamedQuery',
        statusCode: this.STATUS_CODES.BAD_REQUEST,
      });
      return;
    }
    const iterable = Object.keys(jsonParams);
    let result = [];
    for (const key of iterable) {
      let value = jsonParams[key];
      const queryDef = this.queries && this.queries[key];
      const orderArray =
        queryDef && Array.isArray(queryDef.orderArray)
          ? queryDef.orderArray
          : [];

      if (value == null) {
        if (orderArray.length === 0) {
          value = {};
        } else {
          this.utils.handleError({
            message: msg('named_query_params_missing_key', { key }),
            statusCode: this.STATUS_CODES.BAD_REQUEST,
          });
          continue;
        }
      }

      result.push(
        await this.executeNamedQuery({ nameQuery: key, params: value }),
      );
    }
    return result;
  }

  /**
   * @description Inicia una transacción SQL (`BEGIN`) y retorna el cliente.
   * @returns {Promise<import('pg').PoolClient|undefined>} Cliente con transacción abierta.
   * @throws {Error} Si falla el inicio de la transacción.
   */
  beginTransaction = async () => {
    try {
      const client = await this.connection();
      await client.query('BEGIN');
      return client;
    } catch (error) {
      this.utils.handleError({
        message: msg('db_transaction_begin_error'),
        statusCode: this.STATUS_CODES.DB_ERROR,
        error,
      });
    }
  };

  /**
   * @description Ejecuta consultas nombradas dentro de una transacción con commit/rollback.
   * @param {Object.<string, *>} jsonParams - Mapa de consultas a ejecutar.
   * @param {string} [errorMessage='Error ejecutando la transacción'] - Mensaje si falla.
   * @returns {Promise<Array|undefined>} Resultados de las consultas.
   * @throws {Error} Si falla la ejecución (tras rollback).
   */
  async executeJsonTransaction(
    jsonParams,
    errorMessage = 'Error ejecutando la transacción',
  ) {
    const client = await this.beginTransaction();
    try {
      const result = await this.executeJsonNamedQuery(jsonParams);
      await this.commitTransaction(client);
      return result;
    } catch (error) {
      await this.rollbackTransaction(client);
      this.utils.handleError({
        message: errorMessage,
        statusCode: this.STATUS_CODES.DB_ERROR,
        error,
      });
    } finally {
      this.endTransaction(client);
    }
  }

  /**
   * @description Confirma una transacción (`COMMIT`).
   * @param {import('pg').PoolClient} client - Cliente con transacción abierta.
   * @returns {Promise<void>}
   * @throws {Error} Si falla el commit.
   */
  commitTransaction = async (client) => {
    try {
      await client.query('COMMIT');
    } catch (error) {
      this.utils.handleError({
        message: msg('db_transaction_commit_error'),
        statusCode: this.STATUS_CODES.DB_ERROR,
        error,
      });
    }
  };

  /**
   * @description Revierte una transacción (`ROLLBACK`).
   * @param {import('pg').PoolClient} client - Cliente con transacción abierta.
   * @returns {Promise<void>}
   * @throws {Error} Si falla el rollback.
   */
  rollbackTransaction = async (client) => {
    try {
      await client.query('ROLLBACK');
    } catch (error) {
      this.utils.handleError({
        message: msg('db_transaction_rollback_error'),
        statusCode: this.STATUS_CODES.DB_ERROR,
        error,
      });
    }
  };

  /**
   * @description Finaliza el uso del cliente liberándolo al pool.
   * @param {import('pg').PoolClient} client - Cliente a liberar.
   * @returns {Promise<void>}
   */
  endTransaction = async (client) => {
    this.disconnection(client);
  };

  /**
   * @description Selecciona todos los registros de una tabla.
   * @param {Object} options - Opciones de consulta.
   * @param {string} options.tableName - Nombre de la tabla.
   * @param {string} [options.dbSchema='public'] - Esquema de BD.
   * @returns {Promise<{data: Object[]}|{statusCode: number, message: string}>} Filas o respuesta de error/vacío.
   */
  get = async ({ tableName, dbSchema = 'public' }) => {
    const queryString = `SELECT * FROM ${dbSchema}.${tableName}`;
    const values = [];

    try {
      const result = await this.query({
        query: queryString,
        params: values,
      }).then((res) => res);
      if (result && result.rows && result.rows.length > 0)
        return { data: result.rows };
      else
        return {
          statusCode: this.STATUS_CODES.NOT_FOUND,
          message: msg('db_records_not_found'),
        };
    } catch (error) {
      this.utils.handleError({
        message: msg('db_fetch_error', { tableName }),
        statusCode: this.STATUS_CODES.INTERNAL_SERVER_ERROR,
        error,
      });
      return {
        statusCode: this.STATUS_CODES.INTERNAL_SERVER_ERROR,
        message: msg('server_error'),
      };
    }
  };

  /**
   * @description Selecciona registros filtrados por pares clave-valor.
   * @param {Object} options - Opciones de consulta.
   * @param {string} options.tableName - Nombre de la tabla.
   * @param {Object} options.data - Debe incluir `keyValueData` con filtros.
   * @param {string} [options.dbSchema='public'] - Esquema de BD.
   * @returns {Promise<{data: Object[]}|{statusCode: number, message: string, error?: *}>} Filas o error.
   */
  getWhere = async ({ tableName, data, dbSchema = 'public' }) => {
    const keys = Object.keys(data.keyValueData || {});
    const values = Object.values(data.keyValueData || {});
    const queryString = `SELECT * FROM ${dbSchema}.${tableName} WHERE ${keys
      .map((f, i) => `${f} = $${i + 1}`)
      .join(' AND ')};`;

    if (values.length === 0 || keys.length === 0) {
      return {
        statusCode: this.STATUS_CODES.BAD_REQUEST,
        message: msg('db_missing_query_data'),
      };
    }

    try {
      const result = await this.query({
        query: queryString,
        params: values,
      }).then((res) => res);
      if (result && result.rows && result.rows.length > 0)
        return { data: result.rows };
      else
        return {
          statusCode: this.STATUS_CODES.NOT_FOUND,
          message: msg('db_records_not_found'),
        };
    } catch (error) {
      this.utils.handleError({
        message: msg('db_fetch_error', { tableName }),
        statusCode: this.STATUS_CODES.INTERNAL_SERVER_ERROR,
        error,
      });
      return {
        statusCode: this.STATUS_CODES.INTERNAL_SERVER_ERROR,
        message: msg('server_error'),
        error,
      };
    }
  };

  /**
   * @description Inserta un registro en una tabla a partir de `keyValueData`.
   * @param {Object} options - Opciones de inserción.
   * @param {string} options.tableName - Nombre de la tabla.
   * @param {Object} options.data - Debe incluir `keyValueData` con columnas y valores.
   * @param {string} [options.dbSchema='public'] - Esquema de BD.
   * @returns {Promise<{message: string}|{statusCode: number, message: string, error?: *}>} Resultado de la inserción.
   */
  insert = async ({ tableName, data, dbSchema = 'public' }) => {
    const keys = Object.keys(data.keyValueData || {});
    const values = Object.values(data.keyValueData || {});
    const queryString = `
      INSERT INTO ${dbSchema}.${tableName} (${keys.join(', ')})
      VALUES (${keys.map((_, i) => `$${i + 1}`).join(', ')});
    `;

    if (values.length === 0 || keys.length === 0) {
      return {
        statusCode: this.STATUS_CODES.BAD_REQUEST,
        message: msg('db_missing_query_data'),
      };
    }

    try {
      const result = await this.query({
        query: queryString,
        params: values,
      }).then((res) => res);

      if (result && result.rowCount > 0) {
        return { message: msg('db_insert_success') };
      } else {
        return {
          statusCode: this.STATUS_CODES.NOT_FOUND,
          message:
            'No se encontraron registros que coincidan con los criterios',
        };
      }
    } catch (error) {
      this.utils.handleError({
        message: msg('db_insert_error', { tableName }),
        statusCode: this.STATUS_CODES.INTERNAL_SERVER_ERROR,
        error,
      });
      return {
        statusCode: this.STATUS_CODES.INTERNAL_SERVER_ERROR,
        message: msg('server_error'),
        error,
      };
    }
  };

  /**
   * @description Actualiza un registro por `id` (`data.userId`).
   * @param {Object} options - Opciones de actualización.
   * @param {string} options.tableName - Nombre de la tabla.
   * @param {Object} options.data - Incluye `userId` y `keyValueData`.
   * @param {string} [options.dbSchema='public'] - Esquema de BD.
   * @returns {Promise<{message: string}|{statusCode: number, message: string, error?: *}>} Resultado de la actualización.
   */
  updateById = async ({ tableName, data, dbSchema = 'public' }) => {
    const { userId } = data;
    const keys = Object.keys(data.keyValueData || {});
    const values = Object.values(data.keyValueData || {});
    const queryString = `
      UPDATE ${dbSchema}.${tableName}
      SET ${keys.map((key, i) => `${key} = $${i + 1}`).join(', ')}
      WHERE id = $${keys.length + 1};
    `;

    if (values.length === 0 || keys.length === 0 || !userId) {
      return {
        statusCode: this.STATUS_CODES.BAD_REQUEST,
        message: msg('db_missing_query_data'),
      };
    }

    try {
      const result = await this.query({
        query: queryString,
        params: [...values, userId],
      }).then((res) => res);
      if (result && result.rowCount > 0) {
        return { message: msg('db_update_success') };
      } else {
        return {
          statusCode: this.STATUS_CODES.NOT_FOUND,
          message:
            'No se encontraron registros que coincidan con los criterios',
        };
      }
    } catch (error) {
      this.utils.handleError({
        message: msg('db_update_error', { tableName }),
        statusCode: this.STATUS_CODES.INTERNAL_SERVER_ERROR,
        error,
      });
      return {
        statusCode: this.STATUS_CODES.INTERNAL_SERVER_ERROR,
        message: msg('server_error'),
        error,
      };
    }
  };

  /**
   * @description Actualiza un registro por `username`.
   * @param {Object} options - Opciones de actualización.
   * @param {string} options.tableName - Nombre de la tabla.
   * @param {Object} options.data - Incluye `username` y `keyValueData`.
   * @param {string} [options.dbSchema='public'] - Esquema de BD.
   * @returns {Promise<{message: string}|{statusCode: number, message: string, error?: *}>} Resultado de la actualización.
   */
  updateByUsername = async ({ tableName, data, dbSchema = 'public' }) => {
    const { username } = data;
    const keys = Object.keys(data.keyValueData || {});
    const values = Object.values(data.keyValueData || {});
    const queryString = `
      UPDATE ${dbSchema}.${tableName}
      SET ${keys.map((key, i) => `${key} = $${i + 1}`).join(', ')}
      WHERE username = $${keys.length + 1};
    `;

    if (values.length === 0 || keys.length === 0 || !username) {
      return {
        statusCode: this.STATUS_CODES.BAD_REQUEST,
        message: msg('db_missing_query_data'),
      };
    }

    try {
      const result = await this.query({
        query: queryString,
        params: [...values, username],
      }).then((res) => res);
      if (result && result.rowCount > 0) {
        return { message: msg('db_update_success') };
      } else {
        return {
          statusCode: this.STATUS_CODES.NOT_FOUND,
          message:
            'No se encontraron registros que coincidan con los criterios',
        };
      }
    } catch (error) {
      this.utils.handleError({
        message: msg('db_update_error', { tableName }),
        statusCode: this.STATUS_CODES.INTERNAL_SERVER_ERROR,
        error,
      });
      return {
        statusCode: this.STATUS_CODES.INTERNAL_SERVER_ERROR,
        message: msg('server_error'),
        error,
      };
    }
  };

  /**
   * @description Elimina un registro por `username`; exige confirmación en tablas join (`_`).
   * @param {Object} options - Opciones de eliminación.
   * @param {string} options.tableName - Nombre de la tabla.
   * @param {Object} options.data - Incluye `username` y, si aplica, `confirmDelete`.
   * @param {string} [options.dbSchema='public'] - Esquema de BD.
   * @returns {Promise<{message: string}|{statusCode: number, message: string, error?: *}>} Resultado de la eliminación.
   */
  deleteByUsername = async ({ tableName, data, dbSchema = 'public' }) => {
    const { username } = data;
    const queryString = `DELETE FROM ${dbSchema}.${tableName} WHERE username = $1;`;

    if (!username) {
      return {
        statusCode: this.STATUS_CODES.BAD_REQUEST,
        message: msg('db_missing_query_data'),
      };
    }
    if (tableName.includes('_')) {
      const expected = `DELETE_${tableName.toUpperCase()}`;
      if (!data.confirmDelete || data.confirmDelete !== expected) {
        return {
          statusCode: this.STATUS_CODES.BAD_REQUEST,
          message: msg('db_confirm_required', { expected, tableName }),
        };
      }
    }

    try {
      const result = await this.query({
        query: queryString,
        params: [username],
      }).then((res) => res);
      if (result && result.rowCount > 0) {
        return { message: msg('db_delete_success') };
      } else {
        return {
          statusCode: this.STATUS_CODES.NOT_FOUND,
          message:
            'No se encontraron registros que coincidan con los criterios',
        };
      }
    } catch (error) {
      this.utils.handleError({
        message: msg('db_delete_error', { tableName }),
        statusCode: this.STATUS_CODES.INTERNAL_SERVER_ERROR,
        error,
      });
      return {
        statusCode: this.STATUS_CODES.INTERNAL_SERVER_ERROR,
        message: msg('server_error'),
        error,
      };
    }
  };

  /**
   * @description Elimina un registro por `id` (`data.userId`); exige confirmación en tablas join.
   * @param {Object} options - Opciones de eliminación.
   * @param {string} options.tableName - Nombre de la tabla.
   * @param {Object} options.data - Incluye `userId` y, si aplica, `confirmDelete`.
   * @param {string} [options.dbSchema='public'] - Esquema de BD.
   * @returns {Promise<{message: string}|{statusCode: number, message: string, error?: *}>} Resultado de la eliminación.
   */
  deleteById = async ({ tableName, data, dbSchema = 'public' }) => {
    const { userId } = data;
    const queryString = `DELETE FROM ${dbSchema}.${tableName} WHERE id = $1;`;

    if (!userId) {
      return {
        statusCode: this.STATUS_CODES.BAD_REQUEST,
        message: msg('db_missing_query_data'),
      };
    }
    if (tableName.includes('_')) {
      const expected = `DELETE_${tableName.toUpperCase()}`;
      if (!data.confirmDelete || data.confirmDelete !== expected) {
        return {
          statusCode: this.STATUS_CODES.BAD_REQUEST,
          message: msg('db_confirm_required', { expected, tableName }),
        };
      }
    }

    try {
      const result = await this.query({
        query: queryString,
        params: [userId],
      }).then((res) => res);
      if (result && result.rowCount > 0) {
        return { message: msg('db_delete_success') };
      } else {
        return {
          statusCode: this.STATUS_CODES.NOT_FOUND,
          message:
            'No se encontraron registros que coincidan con los criterios',
        };
      }
    } catch (error) {
      this.utils.handleError({
        message: msg('db_delete_error', { tableName }),
        statusCode: this.STATUS_CODES.INTERNAL_SERVER_ERROR,
        error,
      });
      return {
        statusCode: this.STATUS_CODES.INTERNAL_SERVER_ERROR,
        message: msg('server_error'),
        error,
      };
    }
  };

  /**
   * @description Elimina todos los registros de una tabla (requiere confirmación `DELETE_ALL_<TABLA>`).
   * @param {Object} options - Opciones de eliminación.
   * @param {string} options.tableName - Nombre de la tabla.
   * @param {Object} options.data - Debe incluir `confirmDelete` válido.
   * @param {string} [options.dbSchema='public'] - Esquema de BD.
   * @returns {Promise<{message: string}|{statusCode: number, message: string, error?: *}>} Resultado de la eliminación.
   */
  deleteAll = async ({ tableName, data, dbSchema = 'public' }) => {
    if (
      !data.confirmDelete ||
      data.confirmDelete !== `DELETE_ALL_${tableName.toUpperCase()}`
    ) {
      return {
        statusCode: this.STATUS_CODES.BAD_REQUEST,
        message: msg('db_confirm_invalid', { tableName }),
      };
    }

    const queryString = `DELETE FROM ${dbSchema}.${tableName};`;
    try {
      const result = await this.query({ query: queryString }).then(
        (res) => res,
      );
      if (result && result.rowCount > 0)
        return {
          message: msg('db_delete_all_success', { tableName }),
        };
      else
        return {
          statusCode: this.STATUS_CODES.NOT_FOUND,
          message:
            'No se encontraron registros que coincidan con los criterios',
        };
    } catch (error) {
      this.utils.handleError({
        message: msg('db_delete_error', { tableName }),
        statusCode: this.STATUS_CODES.INTERNAL_SERVER_ERROR,
        error,
      });
      return {
        statusCode: this.STATUS_CODES.INTERNAL_SERVER_ERROR,
        message: msg('server_error'),
        error,
      };
    }
  };

  /**
   * @description Elimina registros filtrados por `keyValueData`; exige confirmación en tablas join.
   * @param {Object} options - Opciones de eliminación.
   * @param {string} options.tableName - Nombre de la tabla.
   * @param {Object} options.data - Incluye `keyValueData` y, si aplica, `confirmDelete`.
   * @param {string} [options.dbSchema='public'] - Esquema de BD.
   * @returns {Promise<{message: string}|{statusCode: number, message: string, error?: *}>} Resultado de la eliminación.
   */
  deleteWhere = async ({ tableName, data, dbSchema = 'public' }) => {
    const keys = Object.keys(data.keyValueData || {});
    const values = Object.values(data.keyValueData || {});
    const queryString = `DELETE FROM ${dbSchema}.${tableName} WHERE ${keys
      .map((f, i) => `${f} = $${i + 1}`)
      .join(' AND ')};`;

    if (values.length === 0 || keys.length === 0) {
      return {
        statusCode: this.STATUS_CODES.BAD_REQUEST,
        message: msg('db_missing_query_data'),
      };
    }
    if (tableName.includes('_')) {
      const expected = `DELETE_${tableName.toUpperCase()}`;
      if (!data.confirmDelete || data.confirmDelete !== expected) {
        return {
          statusCode: this.STATUS_CODES.BAD_REQUEST,
          message: msg('db_confirm_required', { expected, tableName }),
        };
      }
    }

    try {
      const result = await this.query({
        query: queryString,
        params: values,
      }).then((res) => res);
      if (result && result.rowCount > 0)
        return {
          message: msg('db_delete_where_success'),
        };
      else
        return {
          statusCode: this.STATUS_CODES.NOT_FOUND,
          message:
            'No se encontraron registros que coincidan con los criterios',
        };
    } catch (error) {
      this.utils.handleError({
        message: msg('db_delete_error', { tableName }),
        statusCode: this.STATUS_CODES.INTERNAL_SERVER_ERROR,
        error,
      });
      return {
        statusCode: this.STATUS_CODES.INTERNAL_SERVER_ERROR,
        message: msg('server_error'),
        error,
      };
    }
  };
}
