import { Pool } from 'pg';
import dotenv from 'dotenv';
import Config from './config.js';
const config = new Config();
const getMessage = config.getMessage.bind(config);

dotenv.config();

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
};

console.log('DB_USER:', process.env.DB_USER);
console.log('DB_PASSWORD:', process.env.DB_PASSWORD);

const pool = new Pool(dbConfig);

pool.on('connect', async () => {
  console.log(await getMessage(config.LANGUAGE, 'db_connected_success'));
});

pool.on('error', async (err) => {
  console.error(await getMessage(config.LANGUAGE, 'db_connected_error'), err);
});

export default pool;
