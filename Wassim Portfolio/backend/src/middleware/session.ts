import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import type { Express } from "express";
import { env, isProd } from "../lib/env.js";

const PgStore = connectPgSimple(session);

export function applySession(app: Express) {
  app.set("trust proxy", 1);
  app.use(
    session({
      store: new PgStore({
        conString: env.DATABASE_URL,
        createTableIfMissing: true,
        tableName: "session",
      }),
      name: "wf.sid",
      secret: env.SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        secure: env.COOKIE_SECURE || isProd,
        sameSite: isProd ? "none" : "lax",
        maxAge: 1000 * 60 * 60 * 24 * 7,
        path: "/",
      },
    }),
  );
}

declare module "express-session" {
  interface SessionData {
    adminId?: string;
    csrfSecret?: string;
  }
}
