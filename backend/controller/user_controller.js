import express from 'express';
const router = express.Router();
import UserService from '../service/user_service.js';
const userService = new UserService();
import SessionService from '../service/session_service.js';
const sessionService = new SessionService();

import Config from '../config/config.js';
const config = new Config();
const { getMessage, STATUS_CODES } = config;

// Registro de usuario
router.post('/register', async (req, res) => {
  try {
    const userData = await userService.register(req.body);
    sessionService.setSession(req, { user: userData });
    res.json({
      message: getMessage(config.LANGUAGE, 'registration_success'),
      user: userData,
    });
  } catch (error) {
    res.status(STATUS_CODES.BAD_REQUEST).json({
      message: getMessage(config.LANGUAGE, 'registration_error'),
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
        .json({ error: getMessage(config.LANGUAGE, 'login_error') });
    sessionService.setSession(req, { user: userData });
    res.json({
      message: getMessage(config.LANGUAGE, 'login_success'),
      user: userData,
    });
  } catch (error) {
    res
      .status(STATUS_CODES.INTERNAL_SERVER_ERROR)
      .json({ message: getMessage(config.LANGUAGE, 'server_error'), error });
  }
});

// Obtener usuario actual
router.get('/me', (req, res) => {
  if (!sessionService.sessionExists(req)) {
    return res
      .status(STATUS_CODES.UNAUTHORIZED)
      .json({ error: getMessage(config.LANGUAGE, 'unauthorized') });
  }
  res.json(sessionService.getSession(req).user);
});

// Logout
router.post('/logout', (req, res) => {
  sessionService.destroySession(req);
  res.json({ message: getMessage(config.LANGUAGE, 'logout_success') });
});

export default router;
