import SS from '../session/sessionWrapper.js';
import Config from '../../config/config.js';
import Security from '../security/security.js';

export default class Dispatcher {
  static instance;

  constructor() {
    if (Dispatcher.instance) return Dispatcher.instance;

    this.config = new Config();
    this.session = new SS();
    this.security = new Security();
    Dispatcher.instance = this;
  }

  async toProccess(request) {
    try {
      if (!this.session.authenticate(request)) {
        return this.config.getMessage(request?.body?.lang, 'session_required');
      }

      // Verificar que el usuario tenga el perfil requerido
      const userId = this.session.getUserId(request);
      const requiredProfile = request?.body?.permission?.profile;

      if (!this.security.hasUserProfile(userId, requiredProfile)) {
        return this.config.getMessage(
          request?.body?.lang,
          'profile_not_assigned',
        );
      }

      if (!this.security.hasPermission(request?.body?.permission)) {
        return this.config.getMessage(
          request?.body?.lang,
          'missing_required_fields',
        );
      }

      return await this.security.executeAuthorized(request?.body?.permission);
    } catch (error) {
      return {
        statusCode: this.config.STATUS_CODES.INTERNAL_SERVER_ERROR,
        message: this.config.getMessage(request?.body?.lang, 'server_error'),
      };
    }
  }
}
