import bcrypt from 'bcrypt';
import DBMS from '../dbms/dbms.js';

/**
 * @file Servicio de sesión y gestión de usuarios.
 * @description Registro, login, consulta y actualización de contraseñas vía DBMS.
 */

/**
 * @class Session
 * @description Capa de negocio para autenticación y datos de usuario en base de datos.
 */
class Session {
  /**
   * @description Inicializa el acceso a DBMS y espera su preparación asíncrona.
   */
  constructor() {
    this.dbms = new DBMS();
    this.dbmsReady = this.dbms.init();
  }

  /**
   * @description Registra un usuario con contraseña hasheada.
   * @param {Object} credentials - Datos de registro.
   * @param {string} credentials.username - Nombre de usuario.
   * @param {string} credentials.password - Contraseña en texto plano.
   * @param {number|string} credentials.person_id - Identificador de persona asociada.
   * @returns {Promise<Object|undefined>} Fila del usuario creado.
   * @throws {Error} Si falla la consulta de registro.
   */
  async register({ username, password, person_id }) {
    await this.dbmsReady;
    const hashedPassword = await bcrypt.hash(password, 10);
    try {
      const res = await this.dbms.executeNamedQuery({
        nameQuery: 'registerUser',
        params: {
          username,
          password: hashedPassword,
          person_id,
        },
      });
      return res?.rows?.[0];
    } catch (err) {
      throw new Error(err.message);
    }
  }

  /**
   * @description Autentica un usuario comparando la contraseña hasheada.
   * @param {Object} credentials - Credenciales de acceso.
   * @param {string} credentials.username - Nombre de usuario.
   * @param {string} credentials.password - Contraseña en texto plano.
   * @returns {Promise<Object|null>} Usuario sin campo `password`, o `null` si no coincide.
   * @throws {Error} Si falla la consulta de login.
   */
  async login({ username, password }) {
    try {
      await this.dbmsReady;
      const res = await this.dbms.executeNamedQuery({
        nameQuery: 'getUser',
        params: { username },
      });
      const user = res?.rows?.[0];
      if (!user) return null;

      const match = await bcrypt.compare(password, user.password);
      if (!match) return null;

      delete user.password;
      return user;
    } catch (err) {
      throw new Error(err.message);
    }
  }

  /**
   * @description Obtiene un usuario por su identificador.
   * @param {number|string} id - Identificador del usuario.
   * @returns {Promise<Object|undefined>} Fila del usuario encontrado.
   */
  async getUserById(id) {
    await this.dbmsReady;
    const res = await this.dbms.executeNamedQuery({
      nameQuery: 'getUserById',
      params: id,
    });
    return res?.rows?.[0];
  }

  /**
   * @description Obtiene un usuario por su correo electrónico.
   * @param {string} email - Correo electrónico del usuario.
   * @returns {Promise<Object|null>} Usuario encontrado o `null`.
   * @throws {Error} Si falla la consulta.
   */
  async getUserByEmail(email) {
    await this.dbmsReady;
    try {
      const res = await this.dbms.executeNamedQuery({
        nameQuery: 'getUserByEmail',
        params: { email },
      });
      return res?.rows?.[0] || null;
    } catch (err) {
      throw new Error(err.message);
    }
  }

  /**
   * @description Actualiza la contraseña de un usuario por su ID.
   * @param {Object} options - Datos de actualización.
   * @param {number|string} options.userId - Identificador del usuario.
   * @param {string} options.password - Nueva contraseña en texto plano.
   * @returns {Promise<Object|null>} Fila actualizada o `null`.
   * @throws {Error} Si falla la actualización.
   */
  async updatePasswordById({ userId, password }) {
    await this.dbmsReady;
    const hashedPassword = await bcrypt.hash(password, 10);
    try {
      const res = await this.dbms.executeNamedQuery({
        nameQuery: 'updateUserPassword',
        params: { password: hashedPassword, userId },
      });
      return res?.rows?.[0] || null;
    } catch (err) {
      throw new Error(err.message);
    }
  }

  /**
   * @description Restablece la contraseña de un usuario por nombre de usuario.
   * @param {Object} options - Datos de restablecimiento.
   * @param {string} options.username - Nombre de usuario.
   * @param {string} options.password - Nueva contraseña en texto plano.
   * @returns {Promise<Object|null>} Fila actualizada o `null`.
   * @throws {Error} Si falla la actualización.
   */
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

export default Session;
