import { randomBytes, createHmac, timingSafeEqual } from "node:crypto";
import type { Request, Response, NextFunction } from "express";
import { env, isProd } from "../lib/env.js";

const SAFE = new Set(["GET", "HEAD", "OPTIONS"]);

function sign(token: string, secret: string) {
  return createHmac("sha256", secret).update(token).digest("hex");
}

export function ensureCsrfSecret(req: Request) {
  if (!req.session.csrfSecret) {
    req.session.csrfSecret = randomBytes(32).toString("hex");
  }
  return req.session.csrfSecret;
}

export function issueCsrfToken(req: Request, res: Response) {
  const secret = ensureCsrfSecret(req);
  const token = randomBytes(24).toString("hex");
  const signature = sign(token, secret);
  const value = `${token}.${signature}`;
  res.cookie("wf.csrf", value, {
    httpOnly: false,
    secure: env.COOKIE_SECURE || isProd,
    sameSite: isProd ? "none" : "lax",
    path: "/",
  });
  return value;
}

function readToken(req: Request): string | undefined {
  const header = req.get("x-csrf-token");
  if (header) return header;
  if (typeof req.body?.csrfToken === "string") return req.body.csrfToken;
  return undefined;
}

export function csrfProtection(req: Request, res: Response, next: NextFunction) {
  if (SAFE.has(req.method)) {
    return next();
  }

  const secret = req.session.csrfSecret;
  const token = readToken(req);
  if (!secret || !token || !token.includes(".")) {
    return res.status(403).json({ error: "Invalid CSRF token" });
  }

  const [raw, signature] = token.split(".");
  if (!raw || !signature) {
    return res.status(403).json({ error: "Invalid CSRF token" });
  }

  const expected = sign(raw, secret);
  try {
    const a = Buffer.from(signature);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !timingSafeEqual(a, b)) {
      return res.status(403).json({ error: "Invalid CSRF token" });
    }
  } catch {
    return res.status(403).json({ error: "Invalid CSRF token" });
  }

  return next();
}
