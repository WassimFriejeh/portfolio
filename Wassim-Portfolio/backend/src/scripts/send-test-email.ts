import { prisma } from "../lib/prisma.js";
import { isMailConfigured, sendTestEmail } from "../services/mail.js";

async function main() {
  if (!isMailConfigured()) {
    throw new Error("SMTP is not configured. Set MAIL_* env vars in backend/.env");
  }

  const profile = await prisma.profile.findUnique({ where: { id: 1 } });
  const to = profile?.email?.trim() || "wassimfriejeh@gmail.com";
  await sendTestEmail(to);
  console.log(`Test email sent to ${to}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
