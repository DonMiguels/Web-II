import Config from '../../config/config.js';

/**
 * @file Wrapper de sesión Express (singleton).
 * @description Lectura, escritura, autenticación y destrucción de datos de sesión.
 */

/**
 * @class SessionWrapper
 * @description Facade sobre `req.session` para gestionar datos de usuario autenticado.
 */
export default class SessionWrapper {
  /**
   * @description Crea o reutiliza la instancia singleton del wrapper.
   * @returns {SessionWrapper} Instancia única.
   */
  constructor() {
    if (SessionWrapper.instance) {
      return SessionWrapper.instance;
    }
    this.config = new Config();
    SessionWrapper.instance = this;
  }

  /**
   * @description Fusiona datos en `req.session.data`.
   * @param {import('express').Request} req - Solicitud Express.
   * @param {Object} [data={}] - Datos a fusionar en la sesión.
   * @returns {Object} Datos de sesión resultantes.
   */
  setSession(req, data = {}) {
    let userData = data || {};
    if (!req?.session?.data) {
      req.session.data = {};
    }
    req.session.data = { ...req.session.data, ...userData };
    return req.session.data;
  }

  /**
   * @description Indica si existe una sesión con datos no vacíos.
   * @param {import('express').Request} req - Solicitud Express.
   * @returns {boolean} `true` si hay datos de sesión.
   */
  sessionExists(req) {
    return Boolean(
      req?.session?.data && Object.keys(req.session.data).length > 0,
    );
  }

  /**
   * @description Destruye la sesión actual si existe.
   * @param {import('express').Request} req - Solicitud Express.
   * @returns {Promise<{statusCode: number, message: string}>} Resultado con código HTTP y mensaje.
   */
  async destroySession(req) {
    if (!this.sessionExists(req))
      return {
        statusCode: this.config.STATUS_CODES.UNAUTHORIZED,
        message: this.config.getMessage(req?.body?.lang, 'session_required'),
      };

    return new Promise((resolve) => {
      req.session.destroy((err) => {
        if (err) {
          return resolve({
            statusCode: this.config.STATUS_CODES.INTERNAL_SERVER_ERROR,
            message: this.config.getMessage(req?.body?.lang, 'server_error'),
          });
        }
        return resolve({
          statusCode: this.config.STATUS_CODES.OK,
          message: this.config.getMessage(
            req?.body?.lang,
            'session_closed_success',
          ),
        });
      });
    });
  }

  /**
   * @description Obtiene los datos almacenados en la sesión.
   * @param {import('express').Request} req - Solicitud Express.
   * @returns {Object|null} Datos de sesión o `null`.
   */
  getSession(req) {
    return req?.session?.data || null;
  }

  /**
   * @description Comprueba si la sesión contiene un usuario autenticado.
   * @param {import('express').Request} req - Solicitud Express.
   * @returns {boolean} `true` si existe `req.session.data.user`.
   */
  authenticate(req) {
    return Boolean(req?.session?.data?.user);
  }

  /**
   * @description Obtiene el identificador del usuario en sesión (`id`, `username` o `user_id`).
   * @param {import('express').Request} req - Solicitud Express.
   * @returns {string|number|undefined} Identificador del usuario o `undefined`.
   */
  getUserId(req) {
    return (
      req?.session?.data?.user?.id ||
      req?.session?.data?.user?.username ||
      req?.session?.data?.user?.user_id
    );
  }
}
