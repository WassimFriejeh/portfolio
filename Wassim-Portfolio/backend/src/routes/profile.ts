import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { serializeProfile } from "../lib/serializers.js";
import { profileSchema } from "../lib/validators.js";
import { requireAdmin } from "../middleware/auth.js";
import { csrfProtection } from "../middleware/csrf.js";

export const publicProfileRouter = Router();
export const adminProfileRouter = Router();

async function ensureProfile() {
  return prisma.profile.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1 },
  });
}

publicProfileRouter.get("/", async (_req, res) => {
  const profile = await ensureProfile();
  res.set("Cache-Control", "public, max-age=30, stale-while-revalidate=60");
  res.json({ profile: serializeProfile(profile) });
});

adminProfileRouter.use(requireAdmin, csrfProtection);

adminProfileRouter.get("/", async (_req, res) => {
  const profile = await ensureProfile();
  res.json({ profile: serializeProfile(profile) });
});

adminProfileRouter.put("/", async (req, res) => {
  const parsed = profileSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Validation failed", details: parsed.error.flatten() });
  }
  const data = parsed.data;
  const emptyToNull = (v: string | null | undefined) => (v === "" || v === undefined ? null : v);
  const profile = await prisma.profile.upsert({
    where: { id: 1 },
    update: {
      ...data,
      email: emptyToNull(data.email),
      phone: emptyToNull(data.phone),
      linkedinUrl: emptyToNull(data.linkedinUrl),
      githubUrl: emptyToNull(data.githubUrl),
      otherLinks: data.otherLinks ?? [],
    },
    create: {
      id: 1,
      ...data,
      email: emptyToNull(data.email),
      phone: emptyToNull(data.phone),
      linkedinUrl: emptyToNull(data.linkedinUrl),
      githubUrl: emptyToNull(data.githubUrl),
      otherLinks: data.otherLinks ?? [],
    },
  });
  return res.json({ profile: serializeProfile(profile) });
});
