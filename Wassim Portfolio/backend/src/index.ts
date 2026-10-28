import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import path from "node:path";
import { env, isProd } from "./lib/env.js";
import { applySession } from "./middleware/session.js";
import { authRouter } from "./routes/auth.js";
import { adminProjectsRouter, publicProjectsRouter } from "./routes/projects.js";
import { adminProfileRouter, publicProfileRouter } from "./routes/profile.js";
import { contactRouter } from "./routes/contact.js";
import { uploadsRouter } from "./routes/uploads.js";

const app = express();

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: false,
  }),
);

app.use(
  cors({
    origin: env.FRONTEND_ORIGIN,
    credentials: true,
  }),
);

app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());
applySession(app);

if (env.STORAGE_DRIVER === "local") {
  app.use(
    "/uploads",
    express.static(path.resolve(env.UPLOAD_DIR), {
      // Short cache so re-seeded covers are not stuck for a week in browsers.
      maxAge: "5m",
      etag: true,
      lastModified: true,
      fallthrough: true,
      setHeaders(res) {
        res.setHeader("Cache-Control", "public, max-age=300, must-revalidate");
      },
    }),
  );
}

app.get("/health", (_req, res) => {
  res.json({ ok: true, env: env.NODE_ENV, storage: env.STORAGE_DRIVER });
});

app.use("/api/auth", authRouter);
app.use("/api/projects", publicProjectsRouter);
app.use("/api/profile", publicProfileRouter);
app.use("/api/contact", contactRouter);
app.use("/api/admin/projects", adminProjectsRouter);
app.use("/api/admin/profile", adminProfileRouter);
app.use("/api/admin/uploads", uploadsRouter);

app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  if (isProd) {
    return res.status(500).json({ error: "Internal server error" });
  }
  const message = err instanceof Error ? err.message : "Internal server error";
  return res.status(500).json({ error: message });
});

if (process.env.NODE_ENV !== "test") {
  app.listen(env.PORT, "0.0.0.0", () => {
    console.log(`API listening on http://127.0.0.1:${env.PORT}`);
  });
}

export { app };
