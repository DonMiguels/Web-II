import express from 'express';
import session from 'express-session';
import bodyParser from 'body-parser';
import cors from 'cors';
import Config from '../../config/config.js';
import userRouter from '../session/sessionRoutes.js';
import Security from '../security/security.js';
import dispatcherRouter from '../dispatcher/dispatcherRoutes.js';
import { getRuntimeEnv } from '../../config/env-runtime.js';

class Server {
  constructor() {
    if (Server.instance) {
      return Server.instance;
    }

    this.app = express();
    this.env = getRuntimeEnv();
    this.PORT = this.env.server.bindPort;
    this.configuration();
    this.routes();
    this.config = new Config();
    this.security = new Security();
    Server.instance = this;
  }

  configuration() {
    const config = new Config();
    const runtimeEnv = this.env;

    this.app.use(
      cors({
        origin: runtimeEnv.cors.allowedOrigins,
        credentials: runtimeEnv.cors.allowCredentials,
        methods: runtimeEnv.cors.allowedMethods,
        allowedHeaders: runtimeEnv.cors.allowedHeaders,
      }),
    );
    this.app.use(bodyParser.json());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(
      session({
        secret: runtimeEnv.session.secret,
        name: runtimeEnv.session.cookieName,
        resave: runtimeEnv.session.resave,
        saveUninitialized: runtimeEnv.session.saveUninitialized,
        cookie: {
          secure: runtimeEnv.session.cookieSecure,
          httpOnly: runtimeEnv.session.cookieHttpOnly,
          sameSite: runtimeEnv.session.cookieSameSite,
          maxAge: runtimeEnv.session.cookieMaxAgeMs,
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
