import SS from '../session/sessionWrapper.js';
import Config from '../../config/config.js';
import Security from '../security/security.js';

/**
 * @file Despachador de transacciones de negocio.
 * @description Valida sesión, perfil y permisos antes de ejecutar una transacción.
 */

/**
 * @class Dispatcher
 * @description Singleton que orquesta autenticación, autorización y ejecución de transacciones.
 */
export default class Dispatcher {
  static instance;

  /**
   * @description Crea o reutiliza la instancia con config, sesión y seguridad.
   * @returns {Dispatcher} Instancia única del despachador.
   */
  constructor() {
    if (Dispatcher.instance) return Dispatcher.instance;

    this.config = new Config();
    this.session = new SS();
    this.security = new Security();
    Dispatcher.instance = this;
  }

  /**
   * @description Construye una respuesta de error/estado con mensaje i18n.
   * @param {string} lang - Idioma.
   * @param {number} statusCode - Código HTTP.
   * @param {string} messageKey - Clave en `config/messages`.
   * @param {Object} [params={}] - Interpolación del mensaje.
   * @returns {{statusCode: number, message: string}}
   */
  buildMessageResponse(lang, statusCode, messageKey, params = {}) {
    return {
      statusCode,
      message: this.config.getMessage(lang, messageKey, params),
    };
  }

  /**
   * @description Procesa una petición de transacción: autentica, autoriza y ejecuta.
   * @param {import('express').Request} request - Solicitud con `body.lang`, `transaction_id`, `data` y `profile`.
   * @returns {Promise<Object>} Resultado de ejecución o error con `statusCode` y `message`.
   */
  async toProccess(request) {
    const body = request?.body || {};
    const lang = body.lang || this.config.LANGUAGE || 'es';

    try {
      const txId = body.transaction_id;
      const parameters = body.data || {};
      const profile = body.profile;

      if (!this.session.authenticate(request)) {
        return this.buildMessageResponse(
          lang,
          this.config.STATUS_CODES.UNAUTHORIZED,
          'session_required',
        );
      }

      if (!txId) {
        return this.buildMessageResponse(
          lang,
          this.config.STATUS_CODES.BAD_REQUEST,
          'missing_transaction_id',
        );
      }

      if (!profile) {
        return this.buildMessageResponse(
          lang,
          this.config.STATUS_CODES.BAD_REQUEST,
          'profile_required',
        );
      }

      const userId = this.session.getUserId(request);
      if (!this.security.hasUserProfile(userId, profile)) {
        return this.buildMessageResponse(
          lang,
          this.config.STATUS_CODES.FORBIDDEN,
          'profile_not_assigned',
        );
      }

      const permissionRoute = this.security.resolveTransaction(txId);
      if (!permissionRoute) {
        return this.buildMessageResponse(
          lang,
          this.config.STATUS_CODES.NOT_FOUND,
          'transaction_not_found',
          { txId },
        );
      }

      const permission = {
        ...permissionRoute,
        profile,
      };

      if (!this.security.hasPermission(permission)) {
        return this.buildMessageResponse(
          lang,
          this.config.STATUS_CODES.FORBIDDEN,
          'unauthorized_action',
        );
      }

      return await this.security.execute(permissionRoute, parameters, lang);
    } catch (error) {
      console.error(error);
      return this.resolveErrorResponse(error, lang);
    }
  }

  /**
   * @description Normaliza errores de BO/DBMS a respuesta JSON con mensaje i18n.
   * @param {Error} error - Error capturado.
   * @param {string} lang - Idioma.
   * @returns {{statusCode: number, message: string}}
   */
  resolveErrorResponse(error, lang) {
    const fallback = this.buildMessageResponse(
      lang,
      this.config.STATUS_CODES.INTERNAL_SERVER_ERROR,
      'server_error',
    );

    if (!error?.message) {
      return fallback;
    }

    try {
      const parsed = JSON.parse(error.message);
      if (parsed?.message) {
        return {
          statusCode:
            parsed.statusCode || this.config.STATUS_CODES.INTERNAL_SERVER_ERROR,
          message: parsed.message,
        };
      }
    } catch {
      return {
        statusCode: this.config.STATUS_CODES.BAD_REQUEST,
        message: error.message,
      };
    }

    return fallback;
  }
}
