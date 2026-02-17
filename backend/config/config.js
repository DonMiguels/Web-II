import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

export default class Config {
  constructor() {
    if (!Config.instance) {
      this.PORT = process.env.PORT || 3050;
      this.SERVER_IP = process.env.IP || 'localhost';
      this.PROTOCOL = process.env.PROTOCOL || 'http';
      this.SERVER_URL = `${this.PROTOCOL}://${this.SERVER_IP}:${this.PORT}`;

      this.MESSAGES = {};
      this.LANGUAGE = process.env.LANGUAGE || 'en';

      this.STATUS_CODES = {
        OK: 200, // La solicitud se ha procesado correctamente
        BAD_REQUEST: 400, // El servidor no pudo entender la solicitud debido a una sintaxis inválida
        UNAUTHORIZED: 401, // La solicitud requiere autenticación del usuario
        FORBIDDEN: 403, // El servidor entendió la solicitud, pero se niega a autorizarla
        NOT_FOUND: 404, // El servidor no pudo encontrar el recurso solicitado
        REQUEST_TIMEOUT: 408, // El servidor agotó el tiempo de espera esperando la solicitud
        CONFLICT: 409, // La solicitud no se pudo completar debido a un conflicto con el estado actual del recurso. Por ejemplo, intentar registrar un usuario con un nombre de usuario o correo electrónico que ya existe
        INTERNAL_SERVER_ERROR: 500, // El servidor encontró una condición inesperada que le impidió completar la solicitud
        DB_ERROR: 503, // El servidor no está disponible actualmente (porque está sobrecargado o en mantenimiento). Generalmente, esto es temporal
      };

      this.__filename = fileURLToPath(import.meta.url);
      this.__dirname = dirname(this.__filename);

      Config.instance = this;
    }
    return Config.instance;
  }

  async init() {
    await this.getMessages();
  }

  async getMessages() {
    if (!this.MESSAGES || Object.keys(this.MESSAGES).length === 0) {
      await this.mapMessages();
    }
    return this.MESSAGES;
  }

  async mapMessages() {
    const messagesDir = path.resolve(this.__dirname, './messages');
    this.MESSAGES = await this.readFiles(messagesDir);
  }

  async readFiles(dirname) {
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

  getMessage(language, messageName) {
    const lang = language || this.LANGUAGE;
    return this.MESSAGES[lang] && this.MESSAGES[lang][messageName]
      ? this.MESSAGES[lang][messageName]
      : this.MESSAGES[this.LANGUAGE][messageName] || '_message_not_found_';
  }
}
