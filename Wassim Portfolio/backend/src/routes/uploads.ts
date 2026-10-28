import { Router } from "express";
import multer from "multer";
import { prisma } from "../lib/prisma.js";
import { serializeMedia } from "../lib/serializers.js";
import { requireAdmin } from "../middleware/auth.js";
import { csrfProtection } from "../middleware/csrf.js";
import { deleteStored, storeUpload } from "../services/storage.js";

export const uploadsRouter = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024, files: 1 },
});

uploadsRouter.use(requireAdmin, csrfProtection);

uploadsRouter.post("/", upload.single("file"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }
  try {
    const stored = await storeUpload(req.file.buffer, req.file.originalname, req.file.mimetype);
    const alt = typeof req.body.alt === "string" ? req.body.alt : "";
    const asset = await prisma.mediaAsset.create({
      data: {
        filename: stored.filename,
        originalName: req.file.originalname,
        mimeType: stored.mimeType,
        size: stored.size,
        width: stored.width,
        height: stored.height,
        storageKey: stored.storageKey,
        url: stored.url,
        alt,
      },
    });
    return res.status(201).json({ asset: serializeMedia(asset) });
  } catch (e) {
    const err = e as Error & { status?: number };
    return res.status(err.status ?? 500).json({ error: err.message || "Upload failed" });
  }
});

uploadsRouter.delete("/:id", async (req, res) => {
  const asset = await prisma.mediaAsset.findUnique({ where: { id: req.params.id } });
  if (!asset) return res.status(404).json({ error: "Asset not found" });

  await prisma.project.updateMany({
    where: { coverImageId: asset.id },
    data: { coverImageId: null },
  });
  await prisma.mediaAsset.delete({ where: { id: asset.id } });
  await deleteStored(asset.storageKey);
  return res.json({ ok: true });
});
