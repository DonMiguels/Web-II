<<<<<<< Updated upstream
import express from 'express';
import session from 'express-session';
import { sessionRouter } from '../controller/index.js';
import bodyParser from 'body-parser';
import cors from 'cors';
import path from 'path';
import Config from '../config/config.js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
=======
const express = require('express');
const session = require('express-session');
const { sessionRouter } = require('../controller');
const userRouter = require('../controller/user_controller'); 
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
>>>>>>> Stashed changes

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({
  path: path.resolve(__dirname, '../../.env'),
});

class Server {
  constructor() {
    if (Server.instance) {
      return Server.instance;
    }
    this.app = express();
    this.configuration();
    this.routes();
    this.config = new Config();
    Server.instance = this;
  }

  configuration() {
    this.app.use(
      cors({
        origin: ['http://localhost:5173'],
        credentials: true,
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
    this.app.use('/', sessionRouter);
    this.app.use('/users', userRouter); 
  }

  start() {
    this.app.listen(process.env.PORT, async () => {
      console.log(`Servidor corriendo en http://localhost:${process.env.PORT}`);
    });
  }
}

const server = new Server();

<<<<<<< Updated upstream
export { server };
=======
module.exports = server;
>>>>>>> Stashed changes
