import express from 'express';
import session from 'express-session';
import bodyParser from 'body-parser';
import cors from 'cors';
import Config from '../../config/config.js';
import userRouter from '../session/sessionRoutes.js';
import Security from '../security/security.js';
import dispatcherRouter from '../dispatcher/dispatcherRoutes.js';

class Server {
  constructor() {
    if (Server.instance) {
      return Server.instance;
    }

    this.app = express();
    this.PORT = Number(
      process.env.SERVER_BIND_PORT || process.env.SERVER_PORT || 3000,
    );
    this.configuration();
    this.routes();
    this.config = new Config();
    this.security = new Security();
    Server.instance = this;
  }

  configuration() {
    const config = new Config();
    const envAllowedValues = config.getEnvAllowedValues();

    const appEnv = process.env.APP_ENV || 'development';

    const allowedOriginsRaw =
      process.env.CORS_ALLOWED_ORIGINS ||
      process.env.SERVER_CORS_ALLOWED_ORIGINS ||
      process.env.FRONT_PUBLIC_URL ||
      process.env.FRONTEND_PUBLIC_URL ||
      'http://localhost:5173';

    const allowedMethodsCatalog = envAllowedValues.CORS_ALLOWED_METHODS || [
      'GET',
      'POST',
      'PUT',
      'PATCH',
      'DELETE',
      'OPTIONS',
    ];

    const allowedMethodsRaw =
      process.env.CORS_ALLOWED_METHODS || allowedMethodsCatalog.join(',');

    const allowedHeadersCatalog = envAllowedValues.CORS_ALLOWED_HEADERS || [
      'Content-Type',
      'Authorization',
    ];

    const allowedHeadersRaw =
      process.env.CORS_ALLOWED_HEADERS || allowedHeadersCatalog.join(',');

    const allowCredentials =
      (process.env.CORS_ALLOW_CREDENTIALS || 'true') === 'true';

    const sessionCookieSecure =
      (process.env.SESSION_COOKIE_SECURE ||
        (appEnv === 'production' ? 'true' : 'false')) === 'true';

    const sessionCookieSameSite = process.env.SESSION_COOKIE_SAME_SITE || 'lax';

    const sessionMaxAgeMs = process.env.SESSION_COOKIE_MAX_AGE_SECONDS
      ? Number(process.env.SESSION_COOKIE_MAX_AGE_SECONDS) * 1000
      : Number(process.env.SESSION_COOKIE_MAX_AGE_MS || 5 * 60 * 1000);

    const allowedOrigins = allowedOriginsRaw
      .split(',')
      .map((value) => value.trim())
      .filter(Boolean);

    const allowedMethods = allowedMethodsRaw
      .split(',')
      .map((value) => value.trim().toUpperCase())
      .filter((value) => allowedMethodsCatalog.includes(value));

    const allowedHeaderMap = new Map(
      allowedHeadersCatalog.map((value) => [value.toLowerCase(), value]),
    );

    const allowedHeaders = allowedHeadersRaw
      .split(',')
      .map((value) => value.trim().toLowerCase())
      .filter((value) => allowedHeaderMap.has(value))
      .map((value) => allowedHeaderMap.get(value));

    const effectiveAllowedMethods =
      allowedMethods.length > 0 ? allowedMethods : allowedMethodsCatalog;

    const effectiveAllowedHeaders =
      allowedHeaders.length > 0 ? allowedHeaders : allowedHeadersCatalog;

    this.app.use(
      cors({
        origin: allowedOrigins,
        credentials: allowCredentials,
        methods: effectiveAllowedMethods,
        allowedHeaders: effectiveAllowedHeaders,
      }),
    );
    this.app.use(bodyParser.json());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(
      session({
        secret: process.env.SESSION_SECRET,
        name: process.env.SESSION_COOKIE_NAME || 'webii.sid',
        resave: (process.env.SESSION_RESAVE || 'false') === 'true',
        saveUninitialized:
          (process.env.SESSION_SAVE_UNINITIALIZED || 'true') === 'true',
        cookie: {
          secure: sessionCookieSecure,
          httpOnly: (process.env.SESSION_COOKIE_HTTP_ONLY || 'true') === 'true',
          sameSite: sessionCookieSameSite,
          maxAge: sessionMaxAgeMs,
        },
      }),
    );
  }

  routes() {
    this.app.use('/', dispatcherRouter);
    this.app.use('/user', userRouter);
  }

  async init() {
    await this.config.init();
    await this.security.syncPermissions();
    await this.security.syncTransactions();
    await this.security.syncUserProfiles();
  }

  start() {
    this.init()
      .then(() => {
        this.app.listen(this.PORT, () => {
          console.log(
            `${this.config.getMessage(this.config.LANGUAGE, 'server_running')} ${this.config.SERVER_URL}`,
          );
        });
      })
      .catch((error) => {
        console.error('Error al iniciar servidor:', error?.message || error);
        process.exit(1);
      });
  }
}

export default Server;
