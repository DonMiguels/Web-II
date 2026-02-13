const { Pool } = require('pg');
require('dotenv').config({ path: './db.env' });

const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: 'SDP',
  port: process.env.DB_PORT,
});

pool.on('connect', () => {
  console.log('Conectado a PostgreSQL');
});

pool.on('error', (err) => {
  console.error('Error en la conexión a PostgreSQL', err);
});

module.exports = pool;