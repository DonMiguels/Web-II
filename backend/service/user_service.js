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
