import jwt from 'jsonwebtoken';

/**
 * Genera un token JWT con la data del usuario
 * @param {Object} userData - Información del usuario para el payload
 * @returns {string} Token JWT
 */
export default class Tokenizer {
  constructor() {
    this.secret = process.env.AUTH_JWT_SECRET || process.env.JWT_SECRET;
    this.expiresIn =
      process.env.AUTH_JWT_EXPIRES_IN || process.env.JWT_EXPIRES_IN || '5m';
    this.issuer = process.env.AUTH_JWT_ISSUER;
    this.audience = process.env.AUTH_JWT_AUDIENCE;
    this.algorithm = process.env.AUTH_JWT_ALGORITHM || 'HS256';

    if (!this.secret) {
      throw new Error('AUTH_JWT_SECRET is required');
    }
  }

  generateToken(userData) {
    const signOptions = {
      expiresIn: this.expiresIn,
      algorithm: this.algorithm,
    };

    if (this.issuer) signOptions.issuer = this.issuer;
    if (this.audience) signOptions.audience = this.audience;

    return jwt.sign(userData, this.secret, signOptions);
  }

  verifyToken(token) {
    try {
      const verifyOptions = {
        algorithms: [this.algorithm],
      };

      if (this.issuer) verifyOptions.issuer = this.issuer;
      if (this.audience) verifyOptions.audience = this.audience;

      return jwt.verify(token, this.secret, verifyOptions);
    } catch (error) {
      return null;
    }
  }
}
