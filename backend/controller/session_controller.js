const sessionRouter = require("express").Router();
const SessionService = require("../service/session_service");
const sessionConfig = new SessionService();

sessionRouter.post("/login", (req, res) => {
  sessionConfig.setSession(req, { user: { id: 1, name: "Marcelo" } });
  console.log(req.body);
  res.json({ ok: true });
});

sessionRouter.get("/me", (req, res) => {
  if (!sessionConfig.authenticate(req)) return res.status(401).json({ ok: false });
  res.json({ user: req.session.user });
});

sessionRouter.post("/logout", (req, res) => {
  sessionConfig.destroySession(req);
  res.json({ ok: true });
});

module.exports = sessionRouter;