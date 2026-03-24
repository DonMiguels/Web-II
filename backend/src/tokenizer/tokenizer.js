import jwt from 'jsonwebtoken';
import { getRuntimeEnv } from '../../config/env/runtime.js';

/**
 * Genera un token JWT con la data del usuario
 * @param {Object} userData - Información del usuario para el payload
 * @returns {string} Token JWT
 */
export default class Tokenizer {
  constructor() {
    const env = getRuntimeEnv();
    this.secret = env.auth.jwtSecret;
    this.expiresIn = env.auth.jwtExpiresIn;
    this.issuer = env.auth.jwtIssuer;
    this.audience = env.auth.jwtAudience;
    this.algorithm = env.auth.jwtAlgorithm;

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
