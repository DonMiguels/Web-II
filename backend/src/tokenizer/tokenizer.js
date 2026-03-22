import jwt from 'jsonwebtoken';

/**
 * Genera un token JWT con la data del usuario
 * @param {Object} userData - Información del usuario para el payload
 * @returns {string} Token JWT
 */
export default class Tokenizer {
  constructor() {
    this.secret = process.env.JWT_SECRET;
    this.expiresIn = process.env.JWT_EXPIRES_IN || '5m';

    if (!this.secret) {
      throw new Error('JWT_SECRET is required');
    }
  }

  generateToken(userData) {
    return jwt.sign(userData, this.secret, { expiresIn: this.expiresIn });
  }

  verifyToken(token) {
    try {
      return jwt.verify(token, this.secret);
    } catch (error) {
      return null;
    }
  }
}
