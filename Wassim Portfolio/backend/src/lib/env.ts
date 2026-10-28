import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  SESSION_SECRET: z.string().min(32),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().default(4411),
  FRONTEND_ORIGIN: z.string().url(),
  STORAGE_DRIVER: z.enum(["local", "s3"]).default("local"),
  UPLOAD_DIR: z.string().default("./uploads"),
  PUBLIC_UPLOAD_URL: z.string().default("http://127.0.0.1:4411/uploads"),
  COOKIE_SECURE: z
    .string()
    .optional()
    .transform((v) => v === "true"),
  S3_BUCKET: z.string().optional(),
  S3_REGION: z.string().optional(),
  S3_ACCESS_KEY_ID: z.string().optional(),
  S3_SECRET_ACCESS_KEY: z.string().optional(),
  S3_ENDPOINT: z.string().optional(),
  S3_PUBLIC_URL: z.string().optional(),
  MAIL_MAILER: z.string().optional().default("smtp"),
  MAIL_HOST: z.string().optional().default(""),
  MAIL_PORT: z.coerce.number().optional().default(587),
  MAIL_USERNAME: z.string().optional().default(""),
  MAIL_PASSWORD: z.string().optional().default(""),
  MAIL_FROM_ADDRESS: z.string().optional().default(""),
  MAIL_FROM_NAME: z.string().optional().default("WassimPortfolio"),
});

export const env = envSchema.parse(process.env);
export const isProd = env.NODE_ENV === "production";
