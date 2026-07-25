import fs from 'fs/promises';
import fsSync from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import yaml from 'yaml';

/**
 * @file Configuración central del backend (singleton).
 * @description Expone puerto, URL, códigos HTTP, mensajes i18n, consultas YAML y validaciones.
 */

/**
 * @class Config
 * @description Singleton de configuración de servidor, mensajes, queries y reglas de validación.
 */
export default class Config {
  /**
   * @description Crea o reutiliza la instancia singleton con valores de entorno y códigos de estado.
   * @returns {Config} Instancia única de configuración.
   */
  constructor() {
    if (!Config.instance) {
      this.PORT = process.env.PORT || 3050;
      this.SERVER_IP = process.env.IP || 'localhost';
      this.PROTOCOL = process.env.PROTOCOL || 'http';
      this.SERVER_URL = `${this.PROTOCOL}://${this.SERVER_IP}:${this.PORT}`;

      this.MESSAGES = {};
      this.LANGUAGE = process.env.LANGUAGE || 'en';

      /**
       * Códigos de estado HTTP usados en el backend.
       * @type {Object.<string, number>}
       */
      this.STATUS_CODES = {
        OK: 200,
        BAD_REQUEST: 400,
        UNAUTHORIZED: 401,
        FORBIDDEN: 403,
        NOT_FOUND: 404,
        REQUEST_TIMEOUT: 408,
        CONFLICT: 409,
        INTERNAL_SERVER_ERROR: 500,
        DB_ERROR: 503,
      };

      this.__filename = fileURLToPath(import.meta.url);
      this.__dirname = dirname(this.__filename);

      Config.instance = this;
    }
    return Config.instance;
  }

  /**
   * @description Inicializa recursos asíncronos de configuración (mensajes).
   * @returns {Promise<void>}
   */
  async init() {
    await this.getMessages();
  }

  /**
   * @description Obtiene el mapa de mensajes; lo carga desde disco si aún está vacío.
   * @returns {Promise<Object>} Mensajes indexados por idioma.
   */
  async getMessages() {
    if (!this.MESSAGES || Object.keys(this.MESSAGES).length === 0) {
      await this.mapMessages();
    }
    return this.MESSAGES;
  }

  /**
   * @description Devuelve los códigos de estado HTTP configurados.
   * @returns {Promise<Object.<string, number>>} Mapa de códigos de estado.
   */
  async getErrorCodes() {
    return this.STATUS_CODES;
  }

  /**
   * @description Carga los archivos JSON de mensajes desde el directorio `messages`.
   * @returns {Promise<void>}
   */
  async mapMessages() {
    const messagesDir = path.resolve(this.__dirname, './messages');
    this.MESSAGES = await this.readJSONFiles(messagesDir);
  }

  /**
   * @description Lee todos los archivos `.json` de un directorio y los parsea por idioma.
   * @param {string} dirname - Ruta del directorio a leer.
   * @returns {Promise<Object>} Objeto con claves de idioma y contenido JSON.
   */
  async readJSONFiles(dirname) {
    const data = {};
    try {
      const filenames = await fs.readdir(dirname);
      await Promise.all(
        filenames.map(async (filename) => {
          if (!filename.endsWith('.json')) {
            console.warn(
              `Only JSON files are supported. Skipping non-JSON file: ${filename}`,
            );
            return;
          }
          const content = await fs.readFile(
            path.join(dirname, filename),
            'utf-8',
          );
          const lang = filename.split('.')[0];
          try {
            data[lang] = JSON.parse(content);
          } catch (parseErr) {
            data[lang] = {};
          }
        }),
      );
    } catch (err) {
      console.error('Error reading directory:', err);
    }
    return data;
  }

  /**
   * @description Obtiene un mensaje localizado por idioma y clave, con interpolación opcional.
   * @param {string} [language] - Código de idioma; usa el idioma por defecto si se omite.
   * @param {string} messageName - Clave del mensaje en `config/messages`.
   * @param {Object.<string, string|number|boolean>} [params={}] - Valores para reemplazar `{{clave}}` en el texto.
   * @returns {string} Mensaje encontrado, mensaje del idioma por defecto, la clave, o `_message_not_found_`.
   */
  getMessage(language, messageName, params = {}) {
    const lang = language || this.LANGUAGE;
    const requestedMessage = this.MESSAGES?.[lang]?.[messageName];
    const defaultLanguageMessage = this.MESSAGES?.[this.LANGUAGE]?.[messageName];

    let message =
      requestedMessage ||
      defaultLanguageMessage ||
      messageName ||
      '_message_not_found_';

    if (params && typeof params === 'object') {
      for (const [key, value] of Object.entries(params)) {
        message = message.replaceAll(`{{${key}}}`, String(value ?? ''));
      }
    }

    return message;
  }

  /**
   * @description Obtiene el mapa de consultas nombradas; lo carga si aún no existe.
   * @returns {Promise<Object|null>} Consultas definidas en `queries.yaml`.
   */
  async getQueries() {
    if (!this.QUERIES) {
      await this.mapQueries();
    }
    return this.QUERIES;
  }

  /**
   * @description Carga y parsea `queries.yaml` (con fallback a JSON).
   * @returns {Promise<void>}
   */
  async mapQueries() {
    const queriesPath = path.resolve(this.__dirname, '../config/queries.yaml');
    try {
      const data = await fs.readFile(queriesPath, 'utf8');
      let result;
      try {
        result = yaml.parse(data);
      } catch (yamlErr) {
        try {
          result = JSON.parse(data);
        } catch (jsonErr) {
          console.error(
            'Error parseando queries.yaml como YAML y JSON:',
            yamlErr,
            jsonErr,
          );
          result = null;
        }
      }
      this.QUERIES = result;
    } catch (err) {
      console.error(`Error leyendo YAML desde ${queriesPath}:`, err);
      this.QUERIES = null;
    }
  }

  /**
   * @description Devuelve los tipos personalizados de validación registrados en la configuración.
   * @returns {*} Tipos personalizados (`customTypes`).
   */
  getCustomTypes() {
    return this.customTypes;
  }

  /**
   * @description Carga y expone las reglas de validación desde `config/validations.json`.
   * @returns {Object} Reglas de validación parseadas, o `{}` si falla la carga.
   */
  getValidationValues() {
    try {
      if (!this.VALIDATIONS) {
        const validationsPath = path.resolve(
          this.__dirname,
          './validations.json',
        );
        const raw = fsSync.readFileSync(validationsPath, 'utf8');
        this.VALIDATIONS = JSON.parse(raw);
      }
      return this.VALIDATIONS;
    } catch (err) {
      console.error('Error cargando validations.json:', err);
      return {};
    }
  }
}
