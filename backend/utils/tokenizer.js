import jwt from 'jsonwebtoken';

/**
 * @file Utilidad de tokens JWT.
 * @description Generación y verificación de tokens JSON Web Token para autenticación y recuperación.
 */

/**
 * @class Tokenizer
 * @description Encapsula la creación y verificación de tokens JWT con secreto de entorno.
 */
export default class Tokenizer {
  /**
   * @description Inicializa el tokenizer con el secreto JWT (o un valor por defecto).
   */
  constructor() {
    this.secret = process.env.JWT_SECRET || 'default_secret';
  }

  /**
   * @description Genera un token JWT con la data del usuario.
   * @param {Object} userData - Información del usuario para el payload.
   * @returns {string} Token JWT firmado con expiración de 5 minutos.
   */
  generateToken(userData) {
    return jwt.sign(userData, this.secret, { expiresIn: '5min' });
  }

  /**
   * @description Verifica un token JWT y retorna el payload si es válido.
   * @param {string} token - Token JWT a verificar.
   * @returns {Object|null} Payload decodificado o `null` si el token es inválido o expirado.
   */
  verifyToken(token) {
    try {
      return jwt.verify(token, this.secret);
    } catch (error) {
      return null;
    }
  }
}
