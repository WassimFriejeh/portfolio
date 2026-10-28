import type { Request, Response, NextFunction } from "express";
import { prisma } from "../lib/prisma.js";

export async function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.session.adminId) {
    return res.status(401).json({ error: "Authentication required" });
  }
  const admin = await prisma.admin.findUnique({ where: { id: req.session.adminId } });
  if (!admin) {
    req.session.destroy(() => undefined);
    return res.status(401).json({ error: "Authentication required" });
  }
  res.locals.admin = { id: admin.id, email: admin.email };
  return next();
}
