import express from 'express';
import session from 'express-session';
import bodyParser from 'body-parser';
import cors from 'cors';
import Config from '../../config/config.js';
import userRouter from '../session/sessionRoutes.js';
import Security from '../security/security.js';

import personRouter from '../../controller/person_controller.js';
import profileRouter from '../../controller/profile_controller.js';
import dispatcherRouter from '../../controller/dispatcher_controller.js';

class Server {
  constructor() {
    if (Server.instance) {
      return Server.instance;
    }

    this.app = express();
    this.PORT = process.env.SERVER_PORT || process.env.PORT || 3000;
    this.configuration();
    this.routes();
    this.config = new Config();
    this.security = new Security();
    Server.instance = this;
  }

  configuration() {
    const allowedOriginsRaw =
      process.env.SERVER_CORS_ALLOWED_ORIGINS ||
      process.env.CORS_ALLOWED_ORIGINS ||
      process.env.FRONTEND_PUBLIC_URL ||
      process.env.FRONTEND_URL ||
      'http://localhost:5173';
    const allowedOrigins = allowedOriginsRaw
      .split(',')
      .map((value) => value.trim())
      .filter(Boolean);

    this.app.use(
      cors({
        origin: allowedOrigins,
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
      }),
    );
    this.app.use(bodyParser.json());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(
      session({
        secret: process.env.SESSION_SECRET || process.env.SECRET,
        name: process.env.SESSION_COOKIE_NAME || 'webii.sid',
        resave: (process.env.SESSION_RESAVE || 'false') === 'true',
        saveUninitialized:
          (process.env.SESSION_SAVE_UNINITIALIZED || 'true') === 'true',
        cookie: {
          secure: (process.env.SESSION_COOKIE_SECURE || 'false') === 'true',
          httpOnly: (process.env.SESSION_COOKIE_HTTP_ONLY || 'true') === 'true',
          maxAge: Number(process.env.SESSION_COOKIE_MAX_AGE_MS || 5 * 60 * 1000),
        },
      }),
    );
  }

  routes() {
    this.app.use('/person', personRouter);
    this.app.use('/user', userRouter);
    this.app.use('/profile', profileRouter);
    this.app.use('/dispatcher', dispatcherRouter);
  }

  async init() {
    await this.config.init();
    await this.security.syncPermissions();
  }

  start() {
    this.init()
      .then(() => {
        this.app.listen(this.PORT, () => {
          console.log(
            `${this.config.getMessage(this.config.LANGUAGE, 'server_running')} http://localhost:${this.PORT}`,
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
