import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import yaml from 'js-yaml';

export default class Config {
  constructor() {
    if (!Config.instance) {
      this.PORT = process.env.PORT || 3050;
      this.SERVER_IP = process.env.IP || 'localhost';
      this.PROTOCOL = process.env.PROTOCOL || 'http';
      this.SERVER_URL = `${this.PROTOCOL}://${this.SERVER_IP}:${this.PORT}`;

      this.ERROR_CODES = {
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

  async getMessages() {
    if (!this.MESSAGES) {
      await this.mapMessages();
    }
    return this.MESSAGES;
  }

  async mapMessages() {
    const messagesPath = path.resolve(
      this.__dirname,
      '../config/messages.yaml',
    );
    this.MESSAGES = await new Promise((resolve) => {
      fs.readFile(messagesPath, 'utf8', (err, data) => {
        if (err) {
          console.error(`Error leyendo YAML desde ${messagesPath}:`, err);
          resolve(null);
        } else {
          try {
            // El archivo messages.yaml tiene formato JSON, pero con extensión YAML
            // Si realmente es YAML, usar yaml.load(data)
            // Si es JSON, usar JSON.parse(data)
            // Aquí intentamos ambas opciones
            let result;
            try {
              result = yaml.load(data);
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
            resolve(result);
          } catch (parseErr) {
            console.error(
              `Error parseando YAML desde ${queriesPath}:`,
              parseErr,
            );
            resolve(null);
          }
        }
      });
    });
  }

  async getLanguage() {
    console.log(this.getMessages());
  }
}
