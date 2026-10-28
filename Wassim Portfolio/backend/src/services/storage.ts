import fs from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import sharp from "sharp";
import { env } from "../lib/env.js";

const ALLOWED_MIME = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const MAX_BYTES = 8 * 1024 * 1024;

export type StoredFile = {
  filename: string;
  storageKey: string;
  url: string;
  mimeType: string;
  size: number;
  width: number | null;
  height: number | null;
};

export function assertAllowedUpload(mimeType: string, size: number) {
  if (!ALLOWED_MIME.has(mimeType)) {
    throw Object.assign(new Error("Unsupported file type. Use JPEG, PNG, WebP, or GIF."), {
      status: 400,
    });
  }
  if (size > MAX_BYTES) {
    throw Object.assign(new Error("File too large. Maximum size is 8MB."), { status: 400 });
  }
}

async function ensureLocalDir() {
  await fs.mkdir(env.UPLOAD_DIR, { recursive: true });
}

async function storeLocal(buffer: Buffer, originalName: string, mimeType: string): Promise<StoredFile> {
  await ensureLocalDir();
  const ext = mimeType === "image/png" ? "png" : mimeType === "image/webp" ? "webp" : mimeType === "image/gif" ? "gif" : "jpg";
  const id = randomUUID();
  const filename = `${id}.${ext}`;
  const storageKey = filename;
  const outPath = path.join(env.UPLOAD_DIR, filename);

  let width: number | null = null;
  let height: number | null = null;
  let outBuffer = buffer;
  let outMime = mimeType;
  let outFilename = filename;

  try {
    const image = sharp(buffer, { animated: mimeType === "image/gif" });
    const meta = await image.metadata();
    width = meta.width ?? null;
    height = meta.height ?? null;

    if (mimeType !== "image/gif") {
      const optimized = await image
        .rotate()
        .resize({ width: 2400, height: 2400, fit: "inside", withoutEnlargement: true })
        .webp({ quality: 82 })
        .toBuffer({ resolveWithObject: true });
      outBuffer = optimized.data;
      width = optimized.info.width;
      height = optimized.info.height;
      outMime = "image/webp";
      outFilename = `${id}.webp`;
      await fs.writeFile(path.join(env.UPLOAD_DIR, outFilename), outBuffer);
      return {
        filename: outFilename,
        storageKey: outFilename,
        url: `${env.PUBLIC_UPLOAD_URL.replace(/\/$/, "")}/${outFilename}`,
        mimeType: outMime,
        size: outBuffer.length,
        width,
        height,
      };
    }
  } catch {
    // fall through to raw write
  }

  await fs.writeFile(outPath, outBuffer);
  return {
    filename: outFilename,
    storageKey,
    url: `${env.PUBLIC_UPLOAD_URL.replace(/\/$/, "")}/${storageKey}`,
    mimeType: outMime,
    size: outBuffer.length,
    width,
    height,
  };
}

async function storeS3(_buffer: Buffer, _originalName: string, _mimeType: string): Promise<StoredFile> {
  throw Object.assign(
    new Error(
      "S3 storage is configured as the driver but AWS SDK credentials/bucket are not wired in this environment. Set STORAGE_DRIVER=local for development, or implement S3 with S3_BUCKET and keys.",
    ),
    { status: 501 },
  );
}

export async function storeUpload(
  buffer: Buffer,
  originalName: string,
  mimeType: string,
): Promise<StoredFile> {
  assertAllowedUpload(mimeType, buffer.length);
  if (env.STORAGE_DRIVER === "s3") {
    return storeS3(buffer, originalName, mimeType);
  }
  return storeLocal(buffer, originalName, mimeType);
}

export async function deleteStored(storageKey: string) {
  if (env.STORAGE_DRIVER === "local") {
    const filePath = path.join(env.UPLOAD_DIR, storageKey);
    try {
      await fs.unlink(filePath);
    } catch {
      // ignore missing
    }
  }
}
