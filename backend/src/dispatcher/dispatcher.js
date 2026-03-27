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
      const body = request?.body || {};
      const lang = body.lang || 'es';
      const txId = body.transaction_id;
      const parameters = body.data || {};
      const profile = body.profile;

      if (!this.session.authenticate(request)) {
        return this.config.getMessage(lang, 'session_required');
      }

      if (!txId) {
        return this.config.getMessage(lang, 'missing_transaction_id');
      }
      if (!profile) {
        return { statusCode: 400, message: 'Perfil no especificado en la petición' };
      }

      const userId = this.session.getUserId(request);
      if (!this.security.hasUserProfile(userId, profile)) {
        return this.config.getMessage(lang, 'profile_not_assigned');
      }

      const permissionRoute = this.security.resolveTransaction(txId);
      if (!permissionRoute) {
        return { statusCode: 404, message: `Transacción no encontrada: ${txId}` };
      }

      const permission = {
        ...permissionRoute,
        profile: profile
      };

      if (!this.security.hasPermission(permission)) {
        return this.config.getMessage(lang, 'missing_required_fields'); // O 'unauthorized_action'
      }

      return await this.security.execute(permissionRoute, parameters);

    } catch (error) {
      console.error(error);
      return {
        statusCode: this.config.STATUS_CODES?.INTERNAL_SERVER_ERROR || 500,
        message: this.config.getMessage(request?.body?.lang || 'es', 'server_error'),
      };
    }
  }
}