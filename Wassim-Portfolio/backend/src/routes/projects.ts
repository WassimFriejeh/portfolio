import { Router } from "express";
import { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import { serializeProject } from "../lib/serializers.js";
import { projectPatchSchema, projectWriteSchema, reorderSchema } from "../lib/validators.js";
import { requireAdmin } from "../middleware/auth.js";
import { csrfProtection } from "../middleware/csrf.js";

export const publicProjectsRouter = Router();
export const adminProjectsRouter = Router();

const includeMedia = {
  coverImage: true,
  gallery: { orderBy: { sortOrder: "asc" as const } },
};

publicProjectsRouter.get("/", async (req, res) => {
  const category = typeof req.query.category === "string" ? req.query.category : undefined;
  const featured = req.query.featured === "true" ? true : undefined;

  const projects = await prisma.project.findMany({
    where: {
      status: "PUBLISHED",
      ...(category ? { category } : {}),
      ...(featured !== undefined ? { featured } : {}),
    },
    include: includeMedia,
    orderBy: [{ featured: "desc" }, { displayOrder: "asc" }, { name: "asc" }],
  });

  res.set("Cache-Control", "public, max-age=5, stale-while-revalidate=15");
  res.json({ projects: projects.map((p) => serializeProject(p)) });
});

publicProjectsRouter.get("/categories", async (_req, res) => {
  const rows = await prisma.project.findMany({
    where: { status: "PUBLISHED", category: { not: "" } },
    select: { category: true },
    distinct: ["category"],
    orderBy: { category: "asc" },
  });
  res.json({ categories: rows.map((r) => r.category).filter(Boolean) });
});

publicProjectsRouter.get("/:slug", async (req, res) => {
  const project = await prisma.project.findFirst({
    where: { slug: req.params.slug, status: "PUBLISHED" },
    include: includeMedia,
  });
  if (!project) {
    return res.status(404).json({ error: "Project not found" });
  }
  res.set("Cache-Control", "public, max-age=5, stale-while-revalidate=15");
  return res.json({ project: serializeProject(project) });
});

adminProjectsRouter.use(requireAdmin, csrfProtection);

adminProjectsRouter.get("/", async (_req, res) => {
  const projects = await prisma.project.findMany({
    include: includeMedia,
    orderBy: [{ displayOrder: "asc" }, { name: "asc" }],
  });
  res.json({ projects: projects.map((p) => serializeProject(p, { admin: true })) });
});

adminProjectsRouter.get("/:id", async (req, res) => {
  const project = await prisma.project.findUnique({
    where: { id: req.params.id },
    include: includeMedia,
  });
  if (!project) return res.status(404).json({ error: "Project not found" });
  return res.json({ project: serializeProject(project, { admin: true }) });
});

adminProjectsRouter.post("/", async (req, res) => {
  const parsed = projectWriteSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Validation failed", details: parsed.error.flatten() });
  }
  const { galleryIds, coverImageId, ...data } = parsed.data;
  try {
    const project = await prisma.$transaction(async (tx) => {
      const created = await tx.project.create({
        data: {
          ...data,
          websiteUrl: data.websiteUrl ?? null,
          androidUrl: data.androidUrl ?? null,
          iosUrl: data.iosUrl ?? null,
          partnerUrl: data.partnerUrl ?? null,
          coverImageId: coverImageId ?? null,
        },
      });
      if (galleryIds?.length) {
        await tx.mediaAsset.updateMany({
          where: { id: { in: galleryIds } },
          data: { projectId: created.id },
        });
      }
      return tx.project.findUniqueOrThrow({
        where: { id: created.id },
        include: includeMedia,
      });
    });
    return res.status(201).json({ project: serializeProject(project, { admin: true }) });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return res.status(409).json({ error: "A project with this slug already exists" });
    }
    throw e;
  }
});

adminProjectsRouter.patch("/:id", async (req, res) => {
  const parsed = projectPatchSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Validation failed", details: parsed.error.flatten() });
  }
  const { galleryIds, ...data } = parsed.data;
  try {
    const project = await prisma.$transaction(async (tx) => {
      await tx.project.update({
        where: { id: req.params.id },
        data: {
          ...data,
          ...(data.websiteUrl !== undefined ? { websiteUrl: data.websiteUrl } : {}),
        },
      });
      if (galleryIds) {
        await tx.mediaAsset.updateMany({
          where: { projectId: req.params.id, id: { notIn: galleryIds } },
          data: { projectId: null },
        });
        await tx.mediaAsset.updateMany({
          where: { id: { in: galleryIds } },
          data: { projectId: req.params.id },
        });
        await Promise.all(
          galleryIds.map((id, index) =>
            tx.mediaAsset.update({ where: { id }, data: { sortOrder: index } }),
          ),
        );
      }
      return tx.project.findUniqueOrThrow({
        where: { id: req.params.id },
        include: includeMedia,
      });
    });
    return res.json({ project: serializeProject(project, { admin: true }) });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2025") {
      return res.status(404).json({ error: "Project not found" });
    }
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return res.status(409).json({ error: "A project with this slug already exists" });
    }
    throw e;
  }
});

adminProjectsRouter.delete("/:id", async (req, res) => {
  try {
    await prisma.project.delete({ where: { id: req.params.id } });
    return res.json({ ok: true });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2025") {
      return res.status(404).json({ error: "Project not found" });
    }
    throw e;
  }
});

adminProjectsRouter.post("/reorder", async (req, res) => {
  const parsed = reorderSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Validation failed", details: parsed.error.flatten() });
  }
  await prisma.$transaction(
    parsed.data.items.map((item) =>
      prisma.project.update({
        where: { id: item.id },
        data: { displayOrder: item.displayOrder },
      }),
    ),
  );
  res.json({ ok: true });
});
