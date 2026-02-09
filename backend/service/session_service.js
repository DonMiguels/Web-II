class SessionService {
    constructor() {
        if (SessionService.instance) {
            return SessionService.instance;
        }
        SessionService.instance = this;
    }

    setSession(req, data = {}) {
        if (!req) return false;
        Object.assign(req.session, data);
        return true;
    }

    sessionExists(req) {
        return Boolean(req && req.session);
    }

    destroySession(req) {
        if (!req || !req.session) return false;
        req.session.destroy(() => {
        });
        return true;
    }

    getSession(req) {
        return req?.session || null;
    }

    authenticate(req) {
        return Boolean(req?.session?.user);
    }
}

module.exports = SessionService;
