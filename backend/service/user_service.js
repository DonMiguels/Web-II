import pool from '../config/db.js';
import bcrypt from 'bcrypt';

class UserService {
  constructor() {}

  // Registro de usuario
  async register({ username, email, password }) {
    const hashedPassword = await bcrypt.hash(password, 10);

    const query = `
      INSERT INTO public.user (username, email, password, register_date)
      VALUES ($1, $2, $3, $4)
      RETURNING id, username, email, register_date
    `;
    const values = [username, email, hashedPassword, new Date()];
    try {
      const client = await pool.connect();
      const res = await client.query(query, values);
      client.release();
      return res.rows[0];
    } catch (err) {
      throw new Error(err.message);
    }
  }

  // Login
  async login({ username, password }) {
    const query = `SELECT * FROM public.user WHERE username = $1`;
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
    const query = `SELECT id, username, email, register_date FROM public.user WHERE id = $1`;
    const res = await pool.query(query, [id]);
    return res.rows[0];
  }

  // Recuperar contraseña por usuario
  async resetPasswordByUsername({ username, password }) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const query = `
      UPDATE public.user
      SET password = $1
      WHERE username = $2
      RETURNING id, username, email, register_date
    `;
    try {
      const res = await pool.query(query, [hashedPassword, username]);
      return res.rows[0] || null;
    } catch (err) {
      throw new Error(err.message);
    }
  }
}

export default UserService;
