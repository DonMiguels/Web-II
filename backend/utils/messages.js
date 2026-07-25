import Config from '../config/config.js';

/**
 * @file Acceso corto a mensajes i18n del backend.
 * @description Envuelve `Config.getMessage` para uso en BO, DBMS y utilidades.
 */

const config = new Config();

/**
 * Resuelve un mensaje de `config/messages` con interpolación opcional.
 *
 * @param {string} key - Clave del mensaje.
 * @param {Object.<string, string|number|boolean>} [params={}] - Valores `{{clave}}`.
 * @param {string} [lang] - Idioma; por defecto `Config.LANGUAGE`.
 * @returns {string} Mensaje localizado.
 */
export function msg(key, params = {}, lang) {
  return config.getMessage(lang || config.LANGUAGE, key, params);
}

/**
 * Instancia de configuración compartida (códigos HTTP, idioma, etc.).
 * @type {Config}
 */
export { config };
