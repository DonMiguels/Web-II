import { Pool } from 'pg';
import Config from './config.js';
import { getRuntimeEnvSync } from './env/runtime.js';
const config = new Config();
const getMessage = config.getMessage.bind(config);
const env = getRuntimeEnvSync();

const dbConfig = {
  host: env.db.host,
  user: env.db.user,
  password: env.db.password,
  database: env.db.name,
  port: env.db.port,
  max: env.db.poolMax,
  idleTimeoutMillis: env.db.poolIdleTimeoutMs,
  connectionTimeoutMillis: env.db.poolConnectionTimeoutMs,
};

if (env.db.ssl) {
  dbConfig.ssl = {
    rejectUnauthorized: env.db.sslRejectUnauthorized,
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
