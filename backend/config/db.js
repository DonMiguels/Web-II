import { Pool } from 'pg';
import dotenv from 'dotenv';
import Config from './config.js';

/**
 * @file Pool de conexiones PostgreSQL.
 * @description Configura y exporta el pool `pg` a partir de variables de entorno
 * (locales o Supabase). Soporta `DATABASE_URL` o campos `DB_*` + `DB_SSL`.
 */

const config = new Config();
const getMessage = config.getMessage.bind(config);

dotenv.config();

const useSsl =
  String(process.env.DB_SSL || '').toLowerCase() === 'true' ||
  String(process.env.DATABASE_URL || '').includes('supabase.co');

/**
 * Parámetros de conexión a la base de datos.
 * Prioriza `DATABASE_URL` (Supabase) y cae a `DB_*` individuales.
 * @type {import('pg').PoolConfig}
 */
const dbConfig = process.env.DATABASE_URL
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl: useSsl ? { rejectUnauthorized: false } : undefined,
    }
  : {
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT ? Number(process.env.DB_PORT) : undefined,
      ssl: useSsl ? { rejectUnauthorized: false } : undefined,
    };

/**
 * Pool de conexiones PostgreSQL compartido por el backend.
 * @type {import('pg').Pool}
 */
const pool = new Pool(dbConfig);

pool.on('connect', () => {
  console.log(getMessage(config.LANGUAGE, 'db_connected_success'));
});

pool.on('error', (err) => {
  console.error(getMessage(config.LANGUAGE, 'db_connected_error'), err);
});

export default pool;
