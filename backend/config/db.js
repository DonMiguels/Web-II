import { Pool } from 'pg';
import Config from './config.js';
const config = new Config();
const getMessage = config.getMessage.bind(config);

const dbConfig = {
  host: process.env.DB_POSTGRES_HOST || process.env.DB_HOST,
  user: process.env.DB_POSTGRES_USER || process.env.DB_USER,
  password: process.env.DB_POSTGRES_PASSWORD || process.env.DB_PASSWORD,
  database: process.env.DB_POSTGRES_NAME || process.env.DB_NAME,
  port: Number(process.env.DB_POSTGRES_PORT || process.env.DB_PORT || 5432),
};

const pool = new Pool(dbConfig);

pool.on('connect', () => {
  console.log(getMessage(config.LANGUAGE, 'db_connected_success'));
});

pool.on('error', (err) => {
  console.error(getMessage(config.LANGUAGE, 'db_connected_error'), err);
});

export default pool;
