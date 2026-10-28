#!/usr/bin/env node
/**
 * Recapture covers for sites with hero video — wait until video is actually playing.
 * Usage: node scripts/capture-video-covers.mjs
 */
import { createRequire } from "node:module";
import { copyFile, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const backendRoot = path.resolve(__dirname, "..");
const frontendRoot = path.resolve(backendRoot, "../frontend");
const seedDir = path.resolve(backendRoot, "seed-images");
const publicCovers = path.resolve(frontendRoot, "public/covers");

const frontendRequire = createRequire(path.join(frontendRoot, "package.json"));
const { chromium } = frontendRequire("playwright");
const sharp = frontendRequire("sharp");

const VIEWPORT = { width: 1440, height: 900 };
const MAX_WIDTH = 1600;
const WEBP_QUALITY = 82;

const SITES = [
  { filename: "hadi-akl.webp", url: "https://hadiakl.com/", name: "Hadi Akl" },
  { filename: "digitek.webp", url: "https://digitek.qa/", name: "Digitek" },
];

async function pngToWebp(pngBuffer) {
  return sharp(pngBuffer)
    .resize({ width: MAX_WIDTH, withoutEnlargement: true })
    .webp({ quality: WEBP_QUALITY })
    .toBuffer();
}

/**
 * Force-play hero videos / muted media and wait until a frame is advancing.
 * @param {import('playwright').Page} page
 */
async function waitForVideoPlaying(page) {
  // Unmute blockers / cookie chips that cover the hero
  for (const label of [/accept/i, /agree/i, /got it/i, /allow/i, /close/i]) {
    const btn = page.getByRole("button", { name: label });
    if (await btn.first().isVisible().catch(() => false)) {
      await btn.first().click({ force: true }).catch(() => {});
      await page.waitForTimeout(400);
    }
  }
  await page.keyboard.press("Escape").catch(() => {});

  await page.evaluate(async () => {
    const videos = [...document.querySelectorAll("video")];
    for (const v of videos) {
      v.muted = true;
      v.playsInline = true;
      v.setAttribute("playsinline", "");
      try {
        await v.play();
      } catch {
        // autoplay policies — keep trying below
      }
    }
  });

  // Poll until at least one video has advanced past ~0.4s with dimensions
  const deadline = Date.now() + 20_000;
  let ok = false;
  while (Date.now() < deadline) {
    ok = await page.evaluate(() => {
      const videos = [...document.querySelectorAll("video")];
      return videos.some(
        (v) =>
          v.readyState >= 2 &&
          v.videoWidth > 0 &&
          !v.paused &&
          v.currentTime >= 0.4,
      );
    });
    if (ok) break;

    // Retry play (Digitek often starts paused)
    await page.evaluate(async () => {
      for (const v of document.querySelectorAll("video")) {
        v.muted = true;
        try {
          await v.play();
        } catch {
          /* ignore */
        }
      }
    });
    await page.waitForTimeout(500);
  }

  // Extra beat so the frame is clearly mid-playback (not first frame)
  await page.waitForTimeout(1500);

  // YouTube hero iframes (Digitek) — give embed time after autoplay
  const hasYt = await page.locator('iframe[src*="youtube"]').count();
  if (hasYt > 0) {
    await page.waitForTimeout(3500);
  }

  return ok;
}

/**
 * Digitek hero is a YouTube background that often shows a bot wall in automation.
 * Remove iframes and play the site's own CDN mp4 as a full-bleed hero for the cover.
 * @param {import('playwright').Page} page
 */
async function replaceDigitekYoutubeWithSiteVideo(page) {
  const mp4 = await page.evaluate(() => {
    for (const v of document.querySelectorAll("video")) {
      const s = v.currentSrc || v.src;
      if (s && s.includes(".mp4") && !s.includes("mobile")) return s;
    }
    return null;
  });
  if (!mp4) return false;

  await page.evaluate(async (src) => {
    document.querySelectorAll("iframe").forEach((i) => i.remove());
    document.querySelectorAll(".youtube-background").forEach((el) => {
      el.innerHTML = "";
    });

    let host = document.querySelector(".youtube-background");
    if (!host) {
      host = document.createElement("div");
      host.className = "youtube-background";
      const target = document.querySelector("main") || document.body;
      target.insertBefore(host, target.firstChild);
    }
    Object.assign(host.style, {
      position: "fixed",
      inset: "0",
      width: "100vw",
      height: "100vh",
      zIndex: "0",
      overflow: "hidden",
      pointerEvents: "none",
    });

    const v = document.createElement("video");
    v.src = src;
    v.muted = true;
    v.loop = true;
    v.playsInline = true;
    v.autoplay = true;
    Object.assign(v.style, {
      position: "absolute",
      inset: "0",
      width: "100%",
      height: "100%",
      objectFit: "cover",
    });
    host.appendChild(v);
    try {
      await v.play();
    } catch {
      /* ignore */
    }
  }, mp4);

  const deadline = Date.now() + 15_000;
  while (Date.now() < deadline) {
    const ok = await page.evaluate(() => {
      const v = document.querySelector(".youtube-background video");
      return Boolean(
        v && !v.paused && v.currentTime >= 2 && v.videoWidth > 0 && document.querySelectorAll("iframe").length === 0,
      );
    });
    if (ok) return true;
    await page.waitForTimeout(400);
  }
  return false;
}

async function captureOne(browser, site) {
  const context = await browser.newContext({
    viewport: VIEWPORT,
    ignoreHTTPSErrors: true,
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    locale: "en-US",
  });
  await context.addInitScript(() => {
    Object.defineProperty(navigator, "webdriver", { get: () => undefined });
  });
  const page = await context.newPage();

  try {
    await page.goto(site.url, { waitUntil: "domcontentloaded", timeout: 60_000 });
    await page.waitForLoadState("networkidle", { timeout: 20_000 }).catch(() => {});
    await page.waitForTimeout(2000);

    // Cookie / consent chips
    const allow = page.getByRole("button", { name: /allow cookies|accept/i });
    if (await allow.first().isVisible().catch(() => false)) {
      await allow.first().click({ force: true }).catch(() => {});
      await page.waitForTimeout(400);
    }

    let playing = false;
    if (site.name === "Digitek") {
      playing = await replaceDigitekYoutubeWithSiteVideo(page);
      await page.waitForTimeout(1500);
    } else {
      playing = await waitForVideoPlaying(page);
    }

    const stats = await page.evaluate(() =>
      [...document.querySelectorAll("video")].map((v) => ({
        paused: v.paused,
        t: Number(v.currentTime.toFixed(2)),
        ready: v.readyState,
        w: v.videoWidth,
      })),
    );
    console.log(`  video playing=${playing}`, JSON.stringify(stats));

    // Keep animations enabled so the video frame is rendered into the screenshot.
    const png = await page.screenshot({
      type: "png",
      fullPage: false,
      clip: { x: 0, y: 0, width: VIEWPORT.width, height: VIEWPORT.height },
      animations: "allow",
    });
    const webp = await pngToWebp(png);
    const seedPath = path.join(seedDir, site.filename);
    const publicPath = path.join(publicCovers, site.filename);
    await writeFile(seedPath, webp);
    await copyFile(seedPath, publicPath);
    await context.close();
    return { filename: site.filename, status: "success", playing };
  } catch (err) {
    await context.close().catch(() => {});
    return {
      filename: site.filename,
      status: "failed",
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

async function main() {
  await mkdir(seedDir, { recursive: true });
  await mkdir(publicCovers, { recursive: true });

  // Headed helps Digitek (YouTube bot wall is worse in headless).
  const browser = await chromium.launch({
    headless: false,
    args: [
      "--disable-dev-shm-usage",
      "--no-sandbox",
      "--autoplay-policy=no-user-gesture-required",
      "--disable-blink-features=AutomationControlled",
    ],
  });

  for (const site of SITES) {
    process.stdout.write(`${site.name} ← ${site.url}\n`);
    const result = await captureOne(browser, site);
    console.log(`  → ${result.status}${result.error ? ` (${result.error})` : ""}`);
  }

  await browser.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
