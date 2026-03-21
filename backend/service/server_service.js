import express from 'express';
import session from 'express-session';
import bodyParser from 'body-parser';
import cors from 'cors';
import Config from '../config/config.js';
import dotenv from 'dotenv';
import userRouter from '../controller/user_controller.js';
import personRouter from '../controller/person_controller.js';
import profileRouter from '../controller/profile_controller.js';
import dispatcherRouter from '../controller/dispatcher_controller.js';
import SecurityService from './security_service.js';

dotenv.config();

class Server {
  constructor() {
    if (Server.instance) {
      return Server.instance;
    }

    this.app = express();
    this.PORT = process.env.PORT || 3000;
    this.configuration();
    this.routes();
    this.config = new Config();
    this.securityService = new SecurityService();
    Server.instance = this;
  }

  configuration() {
    this.app.use(
      cors({
        // origin: ['*'],
        origin: ['http://localhost:5173'],
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
      }),
    );
    this.app.use(bodyParser.json());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(
      session({
        secret: process.env.SECRET,
        resave: false,
        saveUninitialized: true,
        cookie: {
          secure: false,
          httpOnly: true,
          maxAge: 5 * 60 * 1000,
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
    await this.securityService.syncPermissions();
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
