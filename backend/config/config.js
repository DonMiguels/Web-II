import fs from 'fs';
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

  getMessages() {
    if (!this.MESSAGES || Object.keys(this.MESSAGES).length === 0) {
      this.mapMessages();
    }
    return this.MESSAGES;
  }

  mapMessages() {
    const messagesDir = path.resolve(this.__dirname, '../messages');
    this.MESSAGES = this.readFiles(messagesDir);
  }

  readFiles(dirname) {
    let data = {};
    fs.readdir(dirname, (err, filenames) => {
      if (err) {
        console.error('Error reading directory:', err);
        return;
      }
      filenames.forEach((filename) => {
        fs.readFile(path.join(dirname, filename), 'utf-8', (err, content) => {
          if (err) {
            console.error('Error reading file:', err);
            return;
          }
          if (!filename.endsWith('.json')) {
            console.warn(
              `Only JSON files are supported. Skipping non-JSON file: ${filename}`,
            );
            return;
          }
          const lang = filename.split('.')[0];
          try {
            data[lang] = JSON.parse(content);
          } catch (parseErr) {
            data[lang] = 'Error parsing JSON';
          }
        });
      });
    });
    return data;
  }

  getMessage(language, messageName) {
    return this.MESSAGES[language] && this.MESSAGES[language][messageName]
      ? this.MESSAGES[language][messageName]
      : this.MESSAGES[this.LANGUAGE][messageName];
  }
}
