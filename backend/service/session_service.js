import Config from '../config/config.js';

export default class SessionService {
  constructor() {
    if (SessionService.instance) {
      return SessionService.instance;
    }
    this.config = new Config();
    SessionService.instance = this;
  }

  setSession(req, data = {}) {
    let userData = data || {};
    if (!req?.session?.data) {
      req.session.data = {};
    }
    req.session.data = { ...req.session.data, ...userData };
    return req.session.data;
  }

  sessionExists(req) {
    return req?.session?.data && Object.keys(req?.session?.data).length > 0;
  }

  destroySession(req) {
    if (!this.sessionExists(req))
      return {
        statusCode: this.config.STATUS_CODES.UNAUTHORIZED,
        message: this.config.getMessage(req?.body?.lang, 'session_required'),
      };
    req.session.destroy((err) => {
      if (err) {
        return {
          statusCode: this.config.STATUS_CODES.INTERNAL_SERVER_ERROR,
          message: this.config.getMessage(req?.body?.lang, 'server_error'),
        };
      }
    });
    return {
      statusCode: this.config.STATUS_CODES.OK,
      message: this.config.getMessage(
        req?.body?.lang,
        'session_closed_success',
      ),
    };
  }

  getSession(req) {
    return req?.session?.data || null;
  }

  authenticate(req) {
    return Boolean(req?.session?.user);
  }
}
