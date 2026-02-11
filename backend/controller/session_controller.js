import { Router } from 'express';
import SessionService from '../service/session_service.js';
const sessionRouter = Router();
const sessionConfig = new SessionService();

sessionRouter.post('/login', (req, res) => {
  sessionConfig.setSession(req, { user: { id: 1, name: 'Marcelo' } });
  res.json({ ok: true });
});

sessionRouter.get('/me', (req, res) => {
  if (!sessionConfig.authenticate(req))
    return res.status(401).json({ ok: false });
  res.json({ user: req.session.user });
});

sessionRouter.post('/logout', async (req, res) => {
  const resp = await sessionConfig.destroySession(req);
  res.status(resp.statusCode).json(resp);
});

export { sessionRouter };
