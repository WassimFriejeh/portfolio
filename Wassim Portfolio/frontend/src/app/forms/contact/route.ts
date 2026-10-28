import { NextResponse } from "next/server";
import { z } from "zod";
import { isMailConfigured, sendContactNotification } from "@/lib/contact-mail";
import { hasContactStore, markContactEmailSent, saveContactSubmission } from "@/lib/contact-store";

export const runtime = "nodejs";

const contactSchema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(255),
  subject: z.string().trim().max(200).optional().default(""),
  message: z.string().trim().min(10).max(5000),
});

const rateBucket = new Map<string, { count: number; resetAt: number }>();

function rateLimit(ip: string) {
  const now = Date.now();
  const windowMs = 15 * 60 * 1000;
  const max = 8;
  const entry = rateBucket.get(ip);
  if (!entry || entry.resetAt < now) {
    rateBucket.set(ip, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (entry.count >= max) return false;
  entry.count += 1;
  return true;
}

export async function POST(req: Request) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown";

  if (!rateLimit(ip)) {
    return NextResponse.json({ error: "Too many messages. Please try again later." }, { status: 429 });
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = contactSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 });
  }

  if (!hasContactStore()) {
    return NextResponse.json(
      { error: "Contact storage is not configured. Set DATABASE_URL (Neon) or CONTACT_SHEET_WEBHOOK_URL." },
      { status: 503 },
    );
  }

  const { name, email, subject, message } = parsed.data;

  let saved;
  try {
    saved = await saveContactSubmission({ name, email, subject: subject ?? "", message });
  } catch (err) {
    console.error("Failed to save contact submission:", err);
    return NextResponse.json({ error: "Could not save your message. Please try again." }, { status: 500 });
  }

  let emailSent = false;
  try {
    if (isMailConfigured()) {
      const notifyTo = process.env.CONTACT_NOTIFY_EMAIL?.trim() || "wassimfriejeh@gmail.com";
      await sendContactNotification({
        to: notifyTo,
        replyTo: email,
        name,
        email,
        subject: subject ?? "",
        message,
      });
      emailSent = true;
      await markContactEmailSent(saved);
    } else {
      console.warn("Contact saved but SMTP is not configured; email was not sent.");
    }
  } catch (err) {
    console.error("Failed to send contact notification email:", err);
  }

  // Saved row is the source of truth — succeed even if SMTP is down.
  return NextResponse.json(
    {
      ok: true,
      id: saved.id,
      emailSent,
      storage: saved.storage,
    },
    { status: 201 },
  );
}
