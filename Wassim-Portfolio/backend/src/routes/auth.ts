import { Router } from "express";
import bcrypt from "bcryptjs";
import rateLimit from "express-rate-limit";
import { prisma } from "../lib/prisma.js";
import { loginSchema } from "../lib/validators.js";
import { csrfProtection, issueCsrfToken } from "../middleware/csrf.js";
import { requireAdmin } from "../middleware/auth.js";

export const authRouter = Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many login attempts. Try again later." },
});

authRouter.get("/csrf", (req, res) => {
  const token = issueCsrfToken(req, res);
  res.json({ csrfToken: token });
});

authRouter.get("/me", async (req, res) => {
  if (!req.session.adminId) {
    return res.status(401).json({ authenticated: false });
  }
  const admin = await prisma.admin.findUnique({
    where: { id: req.session.adminId },
    select: { id: true, email: true },
  });
  if (!admin) {
    return res.status(401).json({ authenticated: false });
  }
  return res.json({ authenticated: true, admin });
});

authRouter.post("/login", loginLimiter, csrfProtection, async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid email or password", details: parsed.error.flatten() });
  }

  const admin = await prisma.admin.findUnique({ where: { email: parsed.data.email.toLowerCase() } });
  if (!admin) {
    return res.status(401).json({ error: "Invalid email or password" });
  }

  const ok = await bcrypt.compare(parsed.data.password, admin.passwordHash);
  if (!ok) {
    return res.status(401).json({ error: "Invalid email or password" });
  }

  req.session.adminId = admin.id;
  const csrfToken = issueCsrfToken(req, res);
  return res.json({
    ok: true,
    admin: { id: admin.id, email: admin.email },
    csrfToken,
  });
});

authRouter.post("/logout", requireAdmin, csrfProtection, (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: "Could not log out" });
    }
    res.clearCookie("wf.sid");
    res.clearCookie("wf.csrf");
    return res.json({ ok: true });
  });
});
