import express from 'express';
const router = express.Router();
import Session from './session.js';
const session = new Session();
import SessionWrapper from './sessionWrapper.js';
const sessionWrapper = new SessionWrapper();
import Validator from '../../utils/validator.js';
const validator = new Validator();

import Config from '../../config/config.js';
const config = new Config();
const getMessage = config.getMessage.bind(config);
const { STATUS_CODES } = config;
import Tokenizer from '../../utils/tokenizer.js';
import Mailer from '../mailer/mailer.js';
const tokenizer = new Tokenizer();
const mailer = new Mailer();

/**
 * @file Rutas Express de autenticación y sesión de usuario.
 * @description Endpoints de registro, login, perfil, recuperación de contraseña y logout.
 * @module sessionRoutes
 */

/**
 * @description Registra un nuevo usuario, valida el cuerpo y abre sesión.
 * @route POST /user/register
 * @param {import('express').Request} req - Solicitud con `username`, `password` y `person_id`.
 * @param {import('express').Response} res - Respuesta JSON con usuario o errores de validación.
 * @returns {Promise<void>}
 */
router.post('/register', async (req, res) => {
  try {
    const registerSchema = {
      username: {
        type: 'string',
        options: { required: true },
      },
      password: {
        type: 'string',
        options: {
          required: true,
          requireSpecialChars: true,
        },
      },
      person_id: {
        type: 'number',
        options: { required: true },
      },
    };

    const validation = validator.validateObject(req.body, registerSchema);
    if (!validation.isValid) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({
        message: getMessage(config.LANGUAGE, 'validation_error'),
        errors: validation.errors,
      });
    }

    const userData = await session.register(req.body);
    sessionWrapper.setSession(req, { user: userData });
    res.json({
      message: getMessage(config.LANGUAGE, 'registration_success'),
      user: userData,
    });
  } catch (error) {
    res.status(STATUS_CODES.BAD_REQUEST).json({
      message:
        error.message || getMessage(config.LANGUAGE, 'registration_error'),
      error,
    });
  }
});

/**
 * @description Autentica un usuario y establece la sesión.
 * @route POST /user/login
 * @param {import('express').Request} req - Solicitud con `username` y `password`.
 * @param {import('express').Response} res - Respuesta JSON con usuario o error de autenticación.
 * @returns {Promise<void>}
 */
router.post('/login', async (req, res) => {
  try {
    const loginSchema = {
      username: {
        type: 'string',
        options: { required: true },
      },
      password: {
        type: 'string',
        options: { required: true },
      },
    };

    const validation = validator.validateObject(req.body, loginSchema);
    if (!validation.isValid) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({
        message: getMessage(config.LANGUAGE, 'validation_error'),
        errors: validation.errors,
      });
    }

    const userData = await session.login(req.body);
    if (!userData)
      return res
        .status(STATUS_CODES.UNAUTHORIZED)
        .json({ error: getMessage(config.LANGUAGE, 'login_error') });
    sessionWrapper.setSession(req, { user: userData });
    res.json({
      message: getMessage(config.LANGUAGE, 'login_success'),
      user: userData,
    });
  } catch (error) {
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
      message: getMessage(config.LANGUAGE, 'server_error'),
      error,
    });
  }
});

/**
 * @description Devuelve el usuario de la sesión actual.
 * @route GET /user/me
 * @param {import('express').Request} req - Solicitud Express con sesión.
 * @param {import('express').Response} res - Respuesta JSON con el usuario o error 401.
 * @returns {Promise<void>}
 */
router.get('/me', async (req, res) => {
  if (!sessionWrapper.sessionExists(req)) {
    return res
      .status(STATUS_CODES.UNAUTHORIZED)
      .json({ error: getMessage(config.LANGUAGE, 'unauthorized') });
  }
  res.json(sessionWrapper.getSession(req).user);
});

/**
 * @description Solicita recuperación de contraseña: envía email con token si el correo existe.
 * @route POST /user/forgot-password
 * @param {import('express').Request} req - Solicitud con `email`.
 * @param {import('express').Response} res - Respuesta genérica de envío (no revela existencia).
 * @returns {Promise<void>}
 */
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body || {};

  await sessionWrapper.destroySession(req);

  const forgotPasswordSchema = {
    email: {
      type: 'email',
      options: { required: true },
    },
  };

  const validation = validator.validateObject(req.body, forgotPasswordSchema);
  if (!validation.isValid) {
    return res.status(STATUS_CODES.BAD_REQUEST).json({
      message: getMessage(config.LANGUAGE, 'validation_error'),
      errors: validation.errors,
    });
  }

  try {
    const userData = await session.getUserByEmail(email);
    if (userData) {
      const token = tokenizer.generateToken({
        id: userData.id,
        username: userData.username,
        email: userData.email,
      });
      const origin = process.env.FRONTEND_URL || req.headers.origin;
      await mailer.sendRecoveryEmail({
        email: userData.email,
        token,
        origin,
        username: userData.username,
      });
    }

    return res.json({
      message: config.getMessage(config.LANGUAGE, 'recovery_email_sent'),
    });
  } catch (error) {
    console.error('Error en forgot-password:', error);
    return res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
      message: config.getMessage(config.LANGUAGE, 'server_error'),
      error,
    });
  }
});

/**
 * @description Restablece la contraseña usando un token JWT válido.
 * @route POST /user/reset-password
 * @param {import('express').Request} req - Solicitud con `token`, `password` y `confirmPassword`.
 * @param {import('express').Response} res - Respuesta de éxito o error de validación/token.
 * @returns {Promise<void>}
 */
router.post('/reset-password', async (req, res) => {
  const { token, password, confirmPassword } = req.body || {};

  await sessionWrapper.destroySession(req);

  const resetPasswordSchema = {
    token: {
      type: 'string',
      options: { required: true },
    },
    password: {
      type: 'string',
      options: {
        required: true,
        requireSpecialChars: true,
      },
    },
    confirmPassword: {
      type: 'string',
      options: { required: true },
    },
  };

  const validation = validator.validateObject(req.body, resetPasswordSchema);
  if (!validation.isValid) {
    return res.status(STATUS_CODES.BAD_REQUEST).json({
      message: getMessage(config.LANGUAGE, 'validation_error'),
      errors: validation.errors,
    });
  }

  if (password !== confirmPassword) {
    return res.status(STATUS_CODES.BAD_REQUEST).json({
      error: getMessage(config.LANGUAGE, 'passwords_do_not_match'),
    });
  }

  const tokenPayload = tokenizer.verifyToken(token);
  if (!tokenPayload?.id) {
    return res.status(STATUS_CODES.BAD_REQUEST).json({
      error: config.getMessage(config.LANGUAGE, 'invalid_or_expired_token'),
    });
  }

  try {
    const userData = await session.updatePasswordById({
      userId: tokenPayload.id,
      password,
    });
    if (!userData) {
      return res
        .status(STATUS_CODES.NOT_FOUND)
        .json({ error: getMessage(config.LANGUAGE, 'user_not_found') });
    }
    return res.json({
      message: getMessage(config.LANGUAGE, 'password_reset_success'),
      user: userData,
    });
  } catch (error) {
    console.error('Error en reset-password:', error);
    return res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
      message: getMessage(config.LANGUAGE, 'server_error'),
      error,
    });
  }
});

/**
 * @description Cierra la sesión del usuario autenticado.
 * @route POST /user/logout
 * @param {import('express').Request} req - Solicitud Express autenticada.
 * @param {import('express').Response} res - Respuesta de cierre de sesión.
 * @returns {Promise<void>}
 */
router.post('/logout', async (req, res) => {
  if (!sessionWrapper.authenticate(req))
    return res
      .status(STATUS_CODES.UNAUTHORIZED)
      .json({ error: getMessage(config.LANGUAGE, 'unauthorized') });
  const result = await sessionWrapper.destroySession(req);
  return res.status(result?.statusCode || STATUS_CODES.OK).json({
    message: result?.message || getMessage(config.LANGUAGE, 'logout_success'),
  });
});

export default router;
