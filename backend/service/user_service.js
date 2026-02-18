import bcrypt from 'bcrypt';
import DBMS from '../src/dbms/dbms.js';

class UserService {
  constructor() {
    this.dbms = new DBMS();
    this.dbmsReady = this.dbms.init();
  }

  // Registro de usuario
  async register({ username, email, password }) {
    await this.dbmsReady;
    const hashedPassword = await bcrypt.hash(password, 10);
    try {
      const res = await this.dbms.executeNamedQuery({
        nameQuery: 'registerUser',
        params: {
          username,
          email,
          password: hashedPassword,
          register_date: new Date().toISOString(),
        },
      });
      return res?.rows?.[0];
    } catch (err) {
      throw new Error(err.message);
    }
  }

  // Login
  async login({ username, password }) {
    try {
      await this.dbmsReady;
      const res = await this.dbms.executeNamedQuery({
        nameQuery: 'getUser',
        params: username,
      });
      const user = res?.rows?.[0];
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
    await this.dbmsReady;
    const res = await this.dbms.executeNamedQuery({
      nameQuery: 'getUserById',
      params: id,
    });
    return res?.rows?.[0];
  }

  // Obtener usuario por email
  async getUserByEmail(email) {
    const query = `SELECT id, username, email FROM public.user WHERE email = $1`;
    try {
      const res = await pool.query(query, [email]);
      return res.rows[0] || null;
    } catch (err) {
      throw new Error(err.message);
    }
  }

  // Actualizar contraseña por ID
  async updatePasswordById({ userId, password }) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const query = `
      UPDATE public.user
      SET password = $1
      WHERE id = $2
      RETURNING id, username, email, register_date
    `;
    try {
      const res = await pool.query(query, [hashedPassword, userId]);
      return res.rows[0] || null;
    } catch (err) {
      throw new Error(err.message);
    }
  }

  // Recuperar contraseña por usuario
  async resetPasswordByUsername({ username, password }) {
    await this.dbmsReady;
    const hashedPassword = await bcrypt.hash(password, 10);
    try {
      const res = await this.dbms.executeNamedQuery({
        nameQuery: 'updateUserPasswordByUsername',
        params: { password: hashedPassword, username },
      });
      return res?.rows?.[0] || null;
    } catch (err) {
      throw new Error(err.message);
    }
  }
}

export default UserService;
