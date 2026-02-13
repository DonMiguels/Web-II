const pool = require('../config/db');
const bcrypt = require('bcrypt');

class UserService {
  constructor() {}

  // Registro de usuario
  async register({ username, email, password }) {
    const hashedPassword = await bcrypt.hash(password, 10);

    const query = `
      INSERT INTO users (username, email, password)
      VALUES ($1, $2, $3)
      RETURNING id, username, email, register_date
    `;
    const values = [username, email, hashedPassword];

    try {
      const res = await pool.query(query, values);
      return res.rows[0];
    } catch (err) {
      throw new Error(err.message);
    }
  }

  // Login
  async login({ username, password }) {
    const query = `SELECT * FROM users WHERE username = $1`;
    try {
      const res = await pool.query(query, [username]);
      const user = res.rows[0];
      if (!user) return null;

      const match = await bcrypt.compare(password, user.password);
      if (!match) return null;

      // No devolvemos la contraseña
      delete user.password;
      return user;
    } catch (err) {
      throw new Error(err.message);
    }
  }

  // Obtener usuario por ID
  async getUserById(id) {
    const query = `SELECT id, username, email, register_date FROM users WHERE id = $1`;
    const res = await pool.query(query, [id]);
    return res.rows[0];
  }
}

module.exports = new UserService();