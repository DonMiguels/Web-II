import express from 'express';
import session from 'express-session';
import cors from 'cors';
import Config from '../../config/config.js';
import dotenv from 'dotenv';
import userRouter from '../session/sessionRoutes.js';
import Security from '../security/security.js';
import dispatcherRouter from '../dispatcher/dispatcherRoutes.js';

/**
 * @file Servidor HTTP Express (singleton).
 * @description Configura middleware, rutas, seguridad y arranque del servidor.
 */

dotenv.config();

/**
 * @description Lee el body crudo sin body-parser/iconv-lite (evita fallos con paths unicode).
 * @param {import('express').Request} req
 * @param {number} limit
 * @returns {Promise<Buffer>}
 */
function readRawBody(req, limit = 2 * 1024 * 1024) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    req.on('data', (chunk) => {
      size += chunk.length;
      if (size > limit) {
        reject(Object.assign(new Error('Payload too large'), { status: 413 }));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

/**
 * @class Server
 * @description Singleton del servidor Express: CORS, sesión, rutas y sincronización de seguridad.
 */
class Server {
  /**
   * @description Crea o reutiliza la instancia del servidor y registra configuración y rutas.
   * @returns {Server} Instancia única del servidor.
   */
  constructor() {
    if (Server.instance) {
      return Server.instance;
    }

    this.app = express();
    this.PORT = process.env.PORT || 3000;
    this.configuration();
    this.routes();
    this.config = new Config();
    this.security = new Security();
    Server.instance = this;
  }

  /**
   * @description Registra middleware: CORS (origen del frontend), JSON, urlencoded y sesión.
   * @returns {void}
   */
  configuration() {
    this.app.use(
      cors({
        origin: ['http://localhost:5173'],
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
      }),
    );

    // Parser JSON/urlencoded propio (utf-8) para evitar iconv-lite/body-parser
    // en rutas del filesystem con caracteres unicode.
    this.app.use(async (req, res, next) => {
      if (req.method === 'GET' || req.method === 'HEAD' || req.method === 'OPTIONS') {
        return next();
      }

      const contentType = String(req.headers['content-type'] || '');
      const isJson = contentType.includes('application/json');
      const isUrlEncoded = contentType.includes(
        'application/x-www-form-urlencoded',
      );

      if (!isJson && !isUrlEncoded) {
        return next();
      }

      try {
        const raw = await readRawBody(req);
        const text = raw.toString('utf8');

        if (isJson) {
          req.body = text ? JSON.parse(text) : {};
        } else {
          req.body = Object.fromEntries(new URLSearchParams(text));
        }
        next();
      } catch (error) {
        if (error?.status === 413) {
          return res.status(413).json({ message: 'Payload too large' });
        }
        return res.status(400).json({ message: 'Invalid request body' });
      }
    });

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

  /**
   * @description Monta las rutas del dispatcher (`/`) y de usuario (`/user`).
   * @returns {void}
   */
  routes() {
    this.app.use('/', dispatcherRouter);
    this.app.use('/user', userRouter);
  }

  /**
   * @description Inicializa configuración y sincroniza permisos, transacciones y perfiles.
   * @returns {Promise<void>}
   */
  async init() {
    await this.config.init();
    await this.security.syncPermissions();
    await this.security.syncTransactions();
    await this.security.syncUserProfiles();
  }

  /**
   * @description Arranca el servidor tras `init`; sale del proceso si falla el arranque.
   * @returns {void}
   */
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
