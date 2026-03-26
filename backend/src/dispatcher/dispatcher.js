import SS from '../session/sessionWrapper.js';
import Config from '../../config/config.js';
import Security from '../security/security.js';
import { createSanitizer } from '../sanitizer/sanitizer.js';

export default class Dispatcher {
  static instance;

  constructor() {
    if (Dispatcher.instance) return Dispatcher.instance;

    this.config = new Config();
    this.session = new SS();
    this.security = new Security();
    this.sanitizer = createSanitizer();
    Dispatcher.instance = this;
  }

  sanitizeReturnValue(payload, routeKey = 'dispatcher.response') {
    if (payload === null || payload === undefined) return payload;
    if (typeof payload !== 'object') return payload;

    return this.sanitizer.sanitizePayload(payload, { routeKey }).cleanedPayload;
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
        return this.sanitizeReturnValue(
          { statusCode: 400, message: 'Perfil no especificado en la petición' },
          'dispatcher.response.error',
        );
      }

      const userId = this.session.getUserId(request);
      if (!this.security.hasUserProfile(userId, profile)) {
        return this.config.getMessage(lang, 'profile_not_assigned');
      }

      const permissionRoute = this.security.resolveTransaction(txId);
      if (!permissionRoute) {
        return this.sanitizeReturnValue(
          { statusCode: 404, message: `Transacción no encontrada: ${txId}` },
          'dispatcher.response.error',
        );
      }

      const permission = {
        ...permissionRoute,
        profile: profile,
      };

      if (!this.security.hasPermission(permission)) {
        return this.config.getMessage(lang, 'missing_required_fields'); // O 'unauthorized_action'
      }

      const executionResult = await this.security.execute(permissionRoute, {
        ...parameters,
        _session_user_id: userId,
        _session_profile: profile,
      });

      const executionStatusCode = Number(executionResult?.statusCode) || 200;
      const executionRouteKey =
        executionStatusCode >= 400
          ? 'dispatcher.response.error'
          : 'dispatcher.response.success';

      return this.sanitizeReturnValue(executionResult, executionRouteKey);
    } catch (error) {
      console.error(error);
      return this.sanitizeReturnValue(
        {
          statusCode: this.config.STATUS_CODES?.INTERNAL_SERVER_ERROR || 500,
          message: this.config.getMessage(
            request?.body?.lang || 'es',
            'server_error',
          ),
        },
        'dispatcher.response.error',
      );
    }
  }
}
