export default class SessionService {
  constructor() {
    if (SessionService.instance) {
      return SessionService.instance;
    }
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
        statusCode: 401,
        message: 'Error, the session to destroy does not exist',
      };
    req.session.destroy((err) => {
      if (err) {
        return { statusCode: 500, message: 'Error destroying session' };
      }
    });
    return { statusCode: 200, message: 'Session closed successfully' };
  }

  getSession(req) {
    return req?.session?.data || null;
  }

  authenticate(req) {
    return Boolean(req?.session?.user);
  }
}
