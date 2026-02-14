const express = require('express');
const router = express.Router();
const UserService = require('../service/user_service');
const SessionService = require('../service/session_service');
const sessionService = new SessionService();

// Registro de usuario
router.post('/register', async (req, res) => {
  try {
    const user = await UserService.register(req.body);
    sessionService.setSession(req, { user });
    res.status(201).json({ message: 'Usuario registrado', user });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const user = await UserService.login(req.body);
    if (!user) return res.status(401).json({ error: 'Credenciales inválidas' });
    sessionService.setSession(req, { user });
    res.json({ message: 'Login exitoso', user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Obtener usuario actual
router.get('/me', (req, res) => {
  if (!sessionService.authenticate(req)) {
    return res.status(401).json({ error: 'No autenticado' });
  }
  res.json({ user: sessionService.getSession(req).user });
});

// Logout
router.post('/logout', (req, res) => {
  sessionService.destroySession(req);
  res.json({ message: 'Sesión cerrada' });
});

module.exports = router;