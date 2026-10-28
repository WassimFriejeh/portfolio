import { Router } from "express";
import rateLimit from "express-rate-limit";
import { prisma } from "../lib/prisma.js";
import { contactMessageSchema } from "../lib/validators.js";
import { isMailConfigured, sendContactNotification } from "../services/mail.js";

export const contactRouter = Router();

const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 8,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many messages. Please try again later." },
});

contactRouter.post("/", contactLimiter, async (req, res) => {
  const parsed = contactMessageSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Validation failed", details: parsed.error.flatten() });
  }

  const { name, email, subject, message } = parsed.data;

  const saved = await prisma.contactMessage.create({
    data: {
      name,
      email,
      subject: subject ?? "",
      message,
    },
  });

  let emailSent = false;
  try {
    if (isMailConfigured()) {
      const profile = await prisma.profile.findUnique({ where: { id: 1 } });
      const notifyTo = profile?.email?.trim() || email;
      await sendContactNotification({
        to: notifyTo,
        replyTo: email,
        name,
        email,
        subject: subject ?? "",
        message,
      });
      emailSent = true;
      await prisma.contactMessage.update({
        where: { id: saved.id },
        data: { emailSent: true },
      });
    } else {
      console.warn("Contact saved but SMTP is not configured; email was not sent.");
    }
  } catch (err) {
    console.error("Failed to send contact notification email:", err);
  }

  return res.status(201).json({
    ok: true,
    id: saved.id,
    emailSent,
  });
});
