import express from 'express';
const router = express.Router();
import UserService from '../service/user_service.js';
const userService = new UserService();
import SessionService from '../service/session_service.js';
const sessionService = new SessionService();
import Config from '../config/config.js';
const config = new Config();
const getMessage = config.getMessage.bind(config);
const { STATUS_CODES } = config;
import Tokenizer from '../src/tokenizer/tokenizer.js';
import Mailer from '../src/mailer/mailer.js';
import Validator from '../src/validator/validator.js';
const tokenizer = new Tokenizer();
const mailer = new Mailer();
const validator = new Validator();

// Registro de usuario
router.post('/register', async (req, res) => {
  try {
    const userData = await userService.register(req.body);
    sessionService.setSession(req, { user: userData });
    res.json({
      message: config.getMessage(config.LANGUAGE, 'registration_success'),
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
    const userData = await userService.login(req.body);
    if (!userData)
      return res
        .status(STATUS_CODES.UNAUTHORIZED)
        .json({ error: config.getMessage(config.LANGUAGE, 'login_error') });
    sessionService.setSession(req, { user: userData });
    res.json({
      message: config.getMessage(config.LANGUAGE, 'login_success'),
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
  if (!sessionService.sessionExists(req)) {
    return res
      .status(STATUS_CODES.UNAUTHORIZED)
      .json({ error: config.getMessage(config.LANGUAGE, 'unauthorized') });
  }
  res.json(sessionService.getSession(req).user);
});

// Recuperacion de contrasena
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body || {};

  await sessionService.destroySession(req);

  if (!email) {
    return res.status(STATUS_CODES.BAD_REQUEST).json({
      error: config.getMessage(config.LANGUAGE, 'missing_required_fields'),
    });
  }

  try {
    const userData = await userService.getUserByEmail(email);
    if (userData) {
      const token = tokenizer.generateToken({
        id: userData.id,
        username: userData.username,
        email: userData.email,
      });
      const origin =
        process.env.FRONTEND_URL ||
        req.headers.origin ||
        'http://localhost:5173/reset-password';
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
    return res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
      message: config.getMessage(config.LANGUAGE, 'server_error'),
      error,
    });
  }
});

router.post('/reset-password', async (req, res) => {
  const { token, password, confirmPassword } = req.body || {};

  // Terminar la sesion si existe
  await sessionService.destroySession(req);

  if (!token || !password || !confirmPassword) {
    return res.status(STATUS_CODES.BAD_REQUEST).json({
      error: config.getMessage(config.LANGUAGE, 'missing_required_fields'),
    });
  }

  const tokenPayload = tokenizer.verifyToken(token);
  if (!tokenPayload?.id) {
    return res.status(STATUS_CODES.BAD_REQUEST).json({
      error: config.getMessage(config.LANGUAGE, 'invalid_or_expired_token'),
    });
  }

  const passwordError = validator.validatePassword(password);
  if (passwordError) {
    return res.status(STATUS_CODES.BAD_REQUEST).json({ error: passwordError });
  }

  const confirmError = validator.validateConfirmPassword(
    password,
    confirmPassword,
  );
  if (confirmError) {
    return res.status(STATUS_CODES.BAD_REQUEST).json({ error: confirmError });
  }

  try {
    const userData = await userService.updatePasswordById({
      userId: tokenPayload.id,
      password,
    });
    if (!userData) {
      return res
        .status(STATUS_CODES.NOT_FOUND)
        .json({ error: config.getMessage(config.LANGUAGE, 'user_not_found') });
    }
    return res.json({
      message: config.getMessage(config.LANGUAGE, 'password_reset_success'),
      user: userData,
    });
  } catch (error) {
    return res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
      message: config.getMessage(config.LANGUAGE, 'server_error'),
      error,
    });
  }
});

// Logout
router.post('/logout', async (req, res) => {
  if (!sessionService.authenticate(req))
    return res
      .status(STATUS_CODES.UNAUTHORIZED)
      .json({ error: getMessage(config.LANGUAGE, 'unauthorized') });
  const result = await sessionService.destroySession(req);
  return res
    .status(result?.statusCode || STATUS_CODES.OK)
    .json({
      message: result?.message || getMessage(config.LANGUAGE, 'logout_success'),
    });
});

export default router;
