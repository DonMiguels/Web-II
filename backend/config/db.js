import { Pool } from 'pg';
import Config from './config.js';
const config = new Config();
const getMessage = config.getMessage.bind(config);

const toBool = (value, fallback = false) => {
  if (value === undefined || value === null || value === '') return fallback;
  return String(value).toLowerCase() === 'true';
};

const sslEnabled = toBool(
  process.env.DB_SSL ?? process.env.DB_POSTGRES_SSL,
  false,
);

const dbConfig = {
  host: process.env.DB_HOST || process.env.DB_POSTGRES_HOST,
  user: process.env.DB_USER || process.env.DB_POSTGRES_USER,
  password: process.env.DB_PASSWORD || process.env.DB_POSTGRES_PASSWORD,
  database: process.env.DB_NAME || process.env.DB_POSTGRES_NAME,
  port: Number(process.env.DB_PORT || process.env.DB_POSTGRES_PORT || 5432),
  max: Number(process.env.DB_POOL_MAX || 10),
  idleTimeoutMillis: Number(process.env.DB_POOL_IDLE_TIMEOUT_MS || 30000),
  connectionTimeoutMillis: Number(
    process.env.DB_POOL_CONNECTION_TIMEOUT_MS || 2000,
  ),
};

if (sslEnabled) {
  dbConfig.ssl = {
    rejectUnauthorized: toBool(process.env.DB_SSL_REJECT_UNAUTHORIZED, true),
  };
}

const pool = new Pool(dbConfig);

pool.on('connect', () => {
  console.log(getMessage(config.LANGUAGE, 'db_connected_success'));
});

pool.on('error', (err) => {
  console.error(getMessage(config.LANGUAGE, 'db_connected_error'), err);
});

export default pool;
