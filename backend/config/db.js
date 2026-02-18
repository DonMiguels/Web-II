import { Pool } from "pg";
import dotenv from "dotenv";
import Config from "./config.js";
const config = new Config();
<<<<<<< HEAD
=======
const getMessage = config.getMessage.bind(config);
>>>>>>> 80b3f1f224b6addbf5e37e1f4fd647a491622165

dotenv.config();

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
};

const pool = new Pool(dbConfig);

pool.on('connect', () => {
  console.log(config.getMessage(config.LANGUAGE, 'db_connected_success'));
});

pool.on('error', (err) => {
  console.error(config.getMessage(config.LANGUAGE, 'db_connected_error'), err);
});

export default pool;
