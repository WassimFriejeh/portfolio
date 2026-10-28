import nodemailer from "nodemailer";
import { env } from "../lib/env.js";

export function isMailConfigured() {
  return Boolean(env.MAIL_HOST && env.MAIL_USERNAME && env.MAIL_PASSWORD && env.MAIL_FROM_ADDRESS);
}

function createTransport() {
  if (!isMailConfigured()) {
    throw new Error("SMTP is not configured");
  }
  return nodemailer.createTransport({
    host: env.MAIL_HOST,
    port: env.MAIL_PORT,
    secure: env.MAIL_PORT === 465,
    auth: {
      user: env.MAIL_USERNAME,
      pass: env.MAIL_PASSWORD,
    },
  });
}

export type ContactMailPayload = {
  to: string;
  replyTo: string;
  name: string;
  email: string;
  subject: string;
  message: string;
};

export async function sendContactNotification(payload: ContactMailPayload) {
  const transport = createTransport();
  const subjectLine = payload.subject?.trim()
    ? `Portfolio contact: ${payload.subject.trim()}`
    : `Portfolio contact from ${payload.name}`;

  await transport.sendMail({
    from: `"${env.MAIL_FROM_NAME}" <${env.MAIL_FROM_ADDRESS}>`,
    to: payload.to,
    replyTo: payload.replyTo,
    subject: subjectLine,
    text: [
      `New message from the portfolio contact form.`,
      ``,
      `Name: ${payload.name}`,
      `Email: ${payload.email}`,
      `Subject: ${payload.subject || "(none)"}`,
      ``,
      payload.message,
    ].join("\n"),
    html: `
      <div style="font-family:system-ui,sans-serif;line-height:1.5;color:#111">
        <p style="margin:0 0 12px">New message from the portfolio contact form.</p>
        <p style="margin:0 0 4px"><strong>Name:</strong> ${escapeHtml(payload.name)}</p>
        <p style="margin:0 0 4px"><strong>Email:</strong> ${escapeHtml(payload.email)}</p>
        <p style="margin:0 0 16px"><strong>Subject:</strong> ${escapeHtml(payload.subject || "(none)")}</p>
        <div style="white-space:pre-wrap;border-top:1px solid #ddd;padding-top:12px">${escapeHtml(payload.message)}</div>
      </div>
    `,
  });
}

export async function sendTestEmail(to: string) {
  const transport = createTransport();
  await transport.sendMail({
    from: `"${env.MAIL_FROM_NAME}" <${env.MAIL_FROM_ADDRESS}>`,
    to,
    subject: "WassimPortfolio — SMTP test",
    text: "This is a test email from WassimPortfolio. Contact form SMTP is working.",
    html: `<p>This is a test email from <strong>WassimPortfolio</strong>. Contact form SMTP is working.</p>`,
  });
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
