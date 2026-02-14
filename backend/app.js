require("dotenv").config();
const express = require("express");
const session = require("express-session");

const userRouter = require("./controller/user_controller");
const serverService = require("./service/server_service");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(
  session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false },
  }),
);

// Rutas
app.use("/users", userRouter);

// Iniciar servidor
serverService.start(app, PORT);
