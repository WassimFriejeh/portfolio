import fs from "node:fs/promises";
import path from "node:path";
import { prisma } from "../lib/prisma.js";
import { seedProjects } from "../data/projects.seed.js";
import { env } from "../lib/env.js";

async function ensureProfile() {
  await prisma.profile.upsert({
    where: { id: 1 },
    update: {
      email: "wassimfriejeh@gmail.com",
      phone: "+96171484101",
      location: "Beirut, Lebanon",
      about:
        "Based in Beirut, Lebanon, with three years of professional experience across websites, web applications, backend systems, APIs, e-commerce, payment integrations, and deployment.",
      linkedinUrl: "https://www.linkedin.com/in/wassim-friejeh/",
      otherLinks: [
        { label: "Instagram", url: "https://www.instagram.com/wassim.friejeh/" },
      ],
    },
    create: {
      id: 1,
      email: "wassimfriejeh@gmail.com",
      phone: "+96171484101",
      location: "Beirut, Lebanon",
      about:
        "Based in Beirut, Lebanon, with three years of professional experience across websites, web applications, backend systems, APIs, e-commerce, payment integrations, and deployment.",
      linkedinUrl: "https://www.linkedin.com/in/wassim-friejeh/",
      otherLinks: [
        { label: "Instagram", url: "https://www.instagram.com/wassim.friejeh/" },
      ],
    },
  });
}

async function attachCoverIfPresent(slug: string, coverFilename?: string) {
  if (!coverFilename) return null;
  const seedDir = path.resolve("seed-images");
  const filePath = path.join(seedDir, coverFilename);
  try {
    await fs.access(filePath);
  } catch {
    return null;
  }

  await fs.mkdir(env.UPLOAD_DIR, { recursive: true });
  const destName = coverFilename;
  const dest = path.join(env.UPLOAD_DIR, destName);
  await fs.copyFile(filePath, dest);
  const stat = await fs.stat(dest);
  const url = `${env.PUBLIC_UPLOAD_URL.replace(/\/$/, "")}/${destName}`;

  const asset = await prisma.mediaAsset.create({
    data: {
      filename: destName,
      originalName: coverFilename,
      mimeType: coverFilename.endsWith(".png") ? "image/png" : "image/webp",
      size: stat.size,
      width: null,
      height: null,
      storageKey: destName,
      url,
      alt: `${slug} website screenshot`,
    },
  });
  return asset.id;
}

async function main() {
  await ensureProfile();

  for (const project of seedProjects) {
    const { coverFilename, ...data } = project;
    const existing = await prisma.project.findUnique({ where: { slug: data.slug } });
    if (existing) {
      await prisma.project.update({
        where: { slug: data.slug },
        data: {
          name: data.name,
          shortDescription: data.shortDescription,
          longDescription: data.longDescription,
          category: data.category,
          developmentStatus: data.developmentStatus,
          contributionNote: data.contributionNote,
          confirmedContribution: data.confirmedContribution,
          techTags: data.techTags,
          websiteUrl: data.websiteUrl,
          androidUrl: data.androidUrl,
          iosUrl: data.iosUrl,
          partnerUrl: data.partnerUrl,
          partnerUrlPublic: data.partnerUrlPublic,
          featured: data.featured,
          displayOrder: data.displayOrder,
          status: data.status,
          detailsIncomplete: data.detailsIncomplete,
        },
      });
      // Always refresh cover from seed-images when present (re-capture workflow)
      const coverId = await attachCoverIfPresent(data.slug, coverFilename);
      if (coverId) {
        await prisma.project.update({
          where: { slug: data.slug },
          data: { coverImageId: coverId },
        });
      }
      continue;
    }

    const coverId = await attachCoverIfPresent(data.slug, coverFilename);
    await prisma.project.create({
      data: {
        ...data,
        coverImageId: coverId,
      },
    });
  }

  console.log(`Seeded ${seedProjects.length} projects.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
