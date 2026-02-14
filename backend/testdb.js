const pool = require('./config/db');

async function testConnection() {
  try {
    const res = await pool.query('SELECT NOW()');
    console.log('Conexión OK:', res.rows[0]);
  } catch (err) {
    console.error('Error de conexión:', err);
  } finally {
    pool.end();
  }
}

testConnection();