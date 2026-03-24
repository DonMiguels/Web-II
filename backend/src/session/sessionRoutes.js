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
import Tokenizer from '../tokenizer/tokenizer.js';
import Mailer from '../mailer/mailer.js';
import { getRuntimeEnv } from '../../config/env/runtime.js';
import { createSanitizer } from '../sanitizer/sanitizer.js';
const tokenizer = new Tokenizer();
const mailer = new Mailer();
const runtimeEnv = getRuntimeEnv();
const sanitizer = createSanitizer();

const sanitizeOrReject = (req, res, routeKey, forceIncludePaths = []) => {
  const sanitizeResult = sanitizer.sanitizePayload(req.body || {}, {
    routeKey,
    forceIncludePaths,
  });

  req.body = sanitizeResult.cleanedPayload;

  if (sanitizeResult.rejected) {
    return res.status(sanitizeResult.response.statusCode).json({
      code: sanitizeResult.response.code,
      message: sanitizeResult.response.message,
      fields: sanitizeResult.response.fields,
      rules: sanitizeResult.response.rules,
    });
  }

  return null;
};

// Registro de usuario
router.post('/register', async (req, res) => {
  try {
    const sanitizeError = sanitizeOrReject(req, res, 'session.register', [
      'username',
      'password',
      'person_id',
    ]);
    if (sanitizeError) return sanitizeError;

    // Schema de validación para registro
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

    // Validar todos los campos
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

// Login
router.post('/login', async (req, res) => {
  try {
    const sanitizeError = sanitizeOrReject(req, res, 'session.login', [
      'username',
      'password',
    ]);
    if (sanitizeError) return sanitizeError;

    // Schema de validación para login
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

    // Validar campos de login
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

// Obtener usuario actual
router.get('/me', async (req, res) => {
  if (!sessionWrapper.sessionExists(req)) {
    return res
      .status(STATUS_CODES.UNAUTHORIZED)
      .json({ error: getMessage(config.LANGUAGE, 'unauthorized') });
  }
  res.json(sessionWrapper.getSession(req).user);
});

// Recuperacion de contrasena
router.post('/forgot-password', async (req, res) => {
  const sanitizeError = sanitizeOrReject(req, res, 'session.forgotPassword', [
    'email',
  ]);
  if (sanitizeError) return sanitizeError;

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
      const origin = runtimeEnv.frontend.publicUrl || req.headers.origin;
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

router.post('/reset-password', async (req, res) => {
  const sanitizeError = sanitizeOrReject(req, res, 'session.resetPassword', [
    'token',
    'password',
    'confirmPassword',
  ]);
  if (sanitizeError) return sanitizeError;

  const { token, password, confirmPassword } = req.body || {};

  // Terminar la sesion si existe
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
// Logout
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
