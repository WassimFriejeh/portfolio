import { randomUUID } from "node:crypto";
import { Pool } from "pg";

export type ContactSubmission = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

export type SavedContact = {
  id: string;
  storage: "postgres" | "sheet";
};

let pool: Pool | null = null;

function getPool() {
  const url = process.env.DATABASE_URL;
  if (!url) return null;
  if (!pool) {
    pool = new Pool({
      connectionString: url,
      // Neon / serverless-friendly; local Postgres is fine too.
      ssl: url.includes("sslmode=require") || url.includes("neon.tech") ? { rejectUnauthorized: false } : undefined,
      max: 2,
    });
  }
  return pool;
}

let ensuredTable = false;

async function ensureContactTable(db: Pool) {
  if (ensuredTable) return;
  await db.query(`
    CREATE TABLE IF NOT EXISTS "ContactMessage" (
      "id" TEXT PRIMARY KEY,
      "name" TEXT NOT NULL,
      "email" TEXT NOT NULL,
      "subject" TEXT NOT NULL DEFAULT '',
      "message" TEXT NOT NULL,
      "emailSent" BOOLEAN NOT NULL DEFAULT false,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);
  await db.query(`CREATE INDEX IF NOT EXISTS "ContactMessage_createdAt_idx" ON "ContactMessage"("createdAt")`);
  ensuredTable = true;
}

async function saveToPostgres(data: ContactSubmission): Promise<SavedContact> {
  const db = getPool();
  if (!db) throw new Error("DATABASE_URL is not set");
  await ensureContactTable(db);

  const id = randomUUID();
  await db.query(
    `INSERT INTO "ContactMessage" ("id", "name", "email", "subject", "message", "emailSent", "createdAt")
     VALUES ($1, $2, $3, $4, $5, false, NOW())`,
    [id, data.name, data.email, data.subject, data.message],
  );
  return { id, storage: "postgres" };
}

async function markEmailSentPostgres(id: string) {
  const db = getPool();
  if (!db) return;
  await db.query(`UPDATE "ContactMessage" SET "emailSent" = true WHERE "id" = $1`, [id]);
}

async function saveToSheet(data: ContactSubmission): Promise<SavedContact> {
  const webhook = process.env.CONTACT_SHEET_WEBHOOK_URL?.trim();
  if (!webhook) throw new Error("CONTACT_SHEET_WEBHOOK_URL is not set");

  const res = await fetch(webhook, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      name: data.name,
      email: data.email,
      subject: data.subject,
      message: data.message,
      createdAt: new Date().toISOString(),
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Sheet webhook failed (${res.status}): ${text.slice(0, 200)}`);
  }

  let id: string = randomUUID();
  try {
    const body = (await res.json()) as { id?: string };
    if (body.id) id = body.id;
  } catch {
    // webhook may return empty / plain text
  }
  return { id, storage: "sheet" };
}

/** Prefer Postgres/Neon when configured; otherwise Google Sheet webhook. */
export function hasContactStore() {
  return Boolean(process.env.DATABASE_URL || process.env.CONTACT_SHEET_WEBHOOK_URL);
}

export async function saveContactSubmission(data: ContactSubmission): Promise<SavedContact> {
  if (process.env.DATABASE_URL) {
    return saveToPostgres(data);
  }
  if (process.env.CONTACT_SHEET_WEBHOOK_URL) {
    return saveToSheet(data);
  }
  throw new Error("No contact store configured (set DATABASE_URL or CONTACT_SHEET_WEBHOOK_URL)");
}

export async function markContactEmailSent(saved: SavedContact) {
  if (saved.storage === "postgres") {
    await markEmailSentPostgres(saved.id);
  }
}
