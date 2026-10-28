import nodemailer from "nodemailer";

export function isMailConfigured() {
  return Boolean(
    process.env.MAIL_HOST &&
      process.env.MAIL_USERNAME &&
      process.env.MAIL_PASSWORD &&
      process.env.MAIL_FROM_ADDRESS,
  );
}

function createTransport() {
  if (!isMailConfigured()) {
    throw new Error("SMTP is not configured");
  }
  const port = Number(process.env.MAIL_PORT || 587);
  return nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port,
    secure: port === 465,
    auth: {
      user: process.env.MAIL_USERNAME,
      pass: process.env.MAIL_PASSWORD,
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

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export async function sendContactNotification(payload: ContactMailPayload) {
  const transport = createTransport();
  const fromName = process.env.MAIL_FROM_NAME || "WassimPortfolio";
  const fromAddress = process.env.MAIL_FROM_ADDRESS!;
  const subjectLine = payload.subject?.trim()
    ? `Portfolio contact: ${payload.subject.trim()}`
    : `Portfolio contact from ${payload.name}`;

  await transport.sendMail({
    from: `"${fromName}" <${fromAddress}>`,
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
