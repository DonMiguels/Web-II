const express = require("express");
const session = require("express-session");
const {sessionRouter} = require("../controller");
const bodyParser = require("body-parser");

require('dotenv').config();

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
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(bodyParser.json());
    this.app.use(session({
      secret: process.env.SECRET,
      resave: false,
      saveUninitialized: true
    }));
  }

  routes() {
    this.app.use("/", sessionRouter);
  }

  start() {
    this.app.listen(process.env.PORT, () => {
      console.log(`Servidor corriendo en http://localhost:${process.env.PORT}`);
    });
  }
}

const server = new Server();

module.exports = server;
