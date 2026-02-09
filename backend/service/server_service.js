const express = require('express');
const session = require('express-session');
const { sessionRouter } = require('../controller');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

require('dotenv').config({
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
          maxAge: 5 * 60 * 1000, // 5 minutes
        },
      }),
    );
  }

  routes() {
    this.app.use('/', sessionRouter);
  }

  start() {
    this.app.listen(process.env.PORT, () => {
      console.log(`Servidor corriendo en http://localhost:${process.env.PORT}`);
    });
  }
}

const server = new Server();

module.exports = server;
