import express from 'express';
const router = express.Router();
import UserService from '../service/user_service.js';
const userService = new UserService();
import SessionService from '../service/session_service.js';
const sessionService = new SessionService();
import Validator from '../utils/validator.js';
const validator = new Validator();

import Config from '../config/config.js';
const config = new Config();
const getMessage = config.getMessage.bind(config);
const { STATUS_CODES } = config;

// Registro de usuario
router.post('/register', async (req, res) => {
  try {
    // Schema de validación para registro
    const registerSchema = {
      username: {
        type: 'string',
        options: { required: true }
      },
      email: {
        type: 'email',
        options: { required: true }
      },
      password: {
        type: 'string',
        options: { 
          required: true,
          requireSpecialChars: true 
        }
      }
    };

    // Validar todos los campos
    const validation = validator.validateObject(req.body, registerSchema);
    if (!validation.isValid) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({
        message: getMessage(config.LANGUAGE, 'validation_error'),
        errors: validation.errors
      });
    }

    const userData = await userService.register(req.body);
    sessionService.setSession(req, { user: userData });
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
    // Schema de validación para login
    const loginSchema = {
      username: {
        type: 'string',
        options: { required: true }
      },
      password: {
        type: 'string',
        options: { required: true }
      }
    };

    // Validar campos de login
    const validation = validator.validateObject(req.body, loginSchema);
    if (!validation.isValid) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({
        message: getMessage(config.LANGUAGE, 'validation_error'),
        errors: validation.errors
      });
    }

    const userData = await userService.login(req.body);
    if (!userData)
      return res
        .status(STATUS_CODES.UNAUTHORIZED)
        .json({ error: getMessage(config.LANGUAGE, 'login_error') });
    sessionService.setSession(req, { user: userData });
    res.json({
      message: getMessage(config.LANGUAGE, 'login_success'),
      user: userData,
    });
  } catch (error) {
    console.error('Login error:', error); 
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
      message: getMessage(config.LANGUAGE, 'server_error'),
      error,
    });
  }
});

// Obtener usuario actual
router.get('/me', async (req, res) => {
  if (!sessionService.sessionExists(req)) {
    return res
      .status(STATUS_CODES.UNAUTHORIZED)
      .json({ error: getMessage(config.LANGUAGE, 'unauthorized') });
  }
  res.json(sessionService.getSession(req).user);
});

<<<<<<< Updated upstream
=======
// Recuperacion de contrasena (olvido de clave)
router.post('/forgot-password', async (req, res) => {
  const { username, password, confirmPassword } = req.body || {};

  // Terminar la sesion si existe
  await sessionService.destroySession(req);

  // Schema de validación para forgot password
  const forgotPasswordSchema = {
    username: {
      type: 'string',
      options: { required: true }
    },
    password: {
      type: 'string',
      options: { 
        required: true,
        requireSpecialChars: true 
      }
    },
    confirmPassword: {
      type: 'string',
      options: { required: true }
    }
  };

  // Validar todos los campos
  const validation = validator.validateObject(req.body, forgotPasswordSchema);
  if (!validation.isValid) {
    return res.status(STATUS_CODES.BAD_REQUEST).json({
      message: getMessage(config.LANGUAGE, 'validation_error'),
      errors: validation.errors
    });
  }

  // Validación específica de coincidencia de contraseñas
  if (password !== confirmPassword) {
    return res.status(STATUS_CODES.BAD_REQUEST).json({
      error: getMessage(config.LANGUAGE, 'passwords_do_not_match'),
    });
  }

  try {
    const userData = await userService.resetPasswordByUsername({
      username,
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
    return res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
      message: getMessage(config.LANGUAGE, 'server_error'),
      error,
    });
  }
});

>>>>>>> Stashed changes
// Logout
router.post('/logout', async (req, res) => {
  sessionService.destroySession(req);
  res.json({ message: getMessage(config.LANGUAGE, 'logout_success') });
});

export default router;
