#!/usr/bin/env node
/**
 * Capture above-the-fold public homepage screenshots for portfolio seed covers.
 * Waits for the page to settle, dismisses common first popups (age gates,
 * newsletter/signup modals, cookie banners), then screenshots.
 * Public homepages only — no login, bookings, or payments.
 */
import { createRequire } from "node:module";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const backendRoot = path.resolve(__dirname, "..");
const frontendRoot = path.resolve(backendRoot, "../frontend");
const outDir = path.resolve(backendRoot, "seed-images");

const frontendRequire = createRequire(path.join(frontendRoot, "package.json"));
const { chromium } = frontendRequire("playwright");
const sharp = frontendRequire("sharp");

const VIEWPORT = { width: 1440, height: 900 };
const NAV_TIMEOUT_MS = 60_000;
const WEBP_QUALITY = 82;
const MAX_WIDTH = 1600;

/** @type {{ filename: string, url: string, name: string, passwordEnv?: string, waitForVideo?: boolean }[]} */
const SITES = [
  { filename: "bewe.webp", url: "http://beweapp.com/", name: "BEWE" },
  { filename: "pool-rewards.webp", url: "https://poolrewards.ng/", name: "Pool Rewards" },
  { filename: "almaza.webp", url: "https://www.almaza.com.lb/", name: "Almaza" },
  {
    filename: "biosphere-skincare.webp",
    url: "http://biosphereskincare.com/",
    name: "Biosphere Skincare",
  },
  { filename: "bioskin-spa.webp", url: "https://bioskinspa.com/", name: "Bioskin Spa" },
  { filename: "abc.webp", url: "https://shopwithabc.com/lb/en", name: "Shop With ABC" },
  { filename: "unigaz.webp", url: "https://unigaz.net/", name: "Unigaz" },
  { filename: "hadi-akl.webp", url: "https://hadiakl.com/", name: "Hadi Akl", waitForVideo: true },
  { filename: "mou3amalat.webp", url: "https://mou3amalat.com/", name: "Mou3amalat" },
  {
    filename: "douaihy.webp",
    url: "https://www.douaihypourlebois.com/",
    name: "Douaihy",
  },
  { filename: "unitop.webp", url: "https://unitopservices.com/", name: "Unitop" },
  { filename: "overseas.webp", url: "https://www.overseaslb.com/", name: "Overseas" },
  { filename: "launchpad101.webp", url: "https://launchpad101.com/", name: "Launchpad101" },
  { filename: "kassouf.webp", url: "http://kassouftrading.com/", name: "Kassouf" },
  { filename: "e-mood.webp", url: "https://e-mood.com/", name: "E-Mood" },
  { filename: "monty-booking.webp", url: "http://montybooking.com/", name: "Monty Booking" },
  {
    filename: "madame-coco.webp",
    url: "http://madamecocolebanon.com/",
    name: "Madame Coco",
  },
  { filename: "patchi.webp", url: "http://patchi.com/", name: "Patchi" },
  {
    filename: "romy-douby.webp",
    url: "https://romydrouby.com/",
    name: "Romy Drouby",
    // Set ROMY_SITE_PASSWORD in the environment when recapturing — never commit the secret.
    passwordEnv: "ROMY_SITE_PASSWORD",
  },
  { filename: "ibrah.webp", url: "https://ibrah.com.kw/en", name: "Ibrah" },
  { filename: "darwaksa.webp", url: "https://darwaksa.com/en", name: "Darwa" },
  { filename: "digitek.webp", url: "https://digitek.qa/", name: "Digitek", waitForVideo: true },
];

/**
 * Force-play hero <video> elements and wait until a frame is advancing.
 * @param {import('playwright').Page} page
 */
async function waitForHeroVideo(page) {
  await page.evaluate(async () => {
    for (const v of document.querySelectorAll("video")) {
      v.muted = true;
      v.playsInline = true;
      try {
        await v.play();
      } catch {
        /* ignore */
      }
    }
  });
  const deadline = Date.now() + 18_000;
  while (Date.now() < deadline) {
    const ok = await page.evaluate(() =>
      [...document.querySelectorAll("video")].some(
        (v) => v.readyState >= 2 && v.videoWidth > 0 && !v.paused && v.currentTime >= 0.4,
      ),
    );
    if (ok) {
      await page.waitForTimeout(1200);
      return true;
    }
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
    await page.waitForTimeout(400);
  }
  if ((await page.locator('iframe[src*="youtube"]').count()) > 0) {
    await page.waitForTimeout(3500);
  }
  return false;
}

/**
 * @param {string} name
 * @returns {Promise<Buffer>}
 */
async function createPlaceholder(name) {
  const width = VIEWPORT.width;
  const height = VIEWPORT.height;
  const escaped = name
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="#0A0A0A"/>
  <text x="50%" y="50%" fill="#E8E8E8" font-family="Arial, Helvetica, sans-serif"
        font-size="48" font-weight="600" text-anchor="middle" dominant-baseline="middle">${escaped}</text>
</svg>`;
  return sharp(Buffer.from(svg))
    .resize({ width: Math.min(width, MAX_WIDTH), withoutEnlargement: true })
    .webp({ quality: WEBP_QUALITY })
    .toBuffer();
}

/**
 * @param {Buffer} pngBuffer
 * @returns {Promise<Buffer>}
 */
async function pngToWebp(pngBuffer) {
  return sharp(pngBuffer)
    .resize({ width: MAX_WIDTH, withoutEnlargement: true })
    .webp({ quality: WEBP_QUALITY })
    .toBuffer();
}

/**
 * Click the first visible matching control, if any.
 * @param {import('playwright').Page} page
 * @param {import('playwright').Locator} locator
 */
async function clickIfVisible(page, locator) {
  const count = await locator.count().catch(() => 0);
  for (let i = 0; i < count; i++) {
    const el = locator.nth(i);
    if (await el.isVisible().catch(() => false)) {
      await el.click({ timeout: 2500, force: true }).catch(() => {});
      await page.waitForTimeout(400);
      return true;
    }
  }
  return false;
}

/**
 * Detect Cloudflare / bot interstitials.
 * @param {import('playwright').Page} page
 */
async function isChallengePage(page) {
  const title = (await page.title().catch(() => "")) || "";
  const bodyText = await page
    .locator("body")
    .innerText({ timeout: 5_000 })
    .catch(() => "");
  const hay = `${title}\n${bodyText}`;
  const textHit =
    /just a moment|security verification|verify you are human|attention required|checking your browser|performing security verification|verifying\.\.\.|cf-browser-verification|challenge-platform/i.test(
      hay,
    );
  if (textHit) return true;
  const domHit = await page
    .evaluate(() => {
      if (document.querySelector("#challenge-stage, .cf-turnstile, #cf-challenge-running"))
        return true;
      if ([...document.querySelectorAll("iframe")].some((f) => /challenges\.cloudflare|turnstile/i.test(f.src)))
        return true;
      return false;
    })
    .catch(() => false);
  return Boolean(domHit);
}

/**
 * Wait for Cloudflare to clear; click the human checkbox when present.
 * @param {import('playwright').Page} page
 */
async function tryPassCloudflare(page) {
  for (let attempt = 0; attempt < 8; attempt++) {
    if (!(await isChallengePage(page))) return true;

    // Turnstile / checkbox iframe
    for (const frame of page.frames()) {
      const box = frame.locator(
        'input[type="checkbox"], .cf-turnstile, #challenge-stage input, label:has-text("Verify")',
      );
      if ((await box.count().catch(() => 0)) > 0) {
        await box.first().click({ timeout: 2000, force: true }).catch(() => {});
      }
    }
    const hostCheckbox = page.locator(
      'input[type="checkbox"], .cf-turnstile, #challenge-stage, label:has-text("Verify you are human")',
    );
    await clickIfVisible(page, hostCheckbox);

    await page.waitForTimeout(2500);
    await page.waitForLoadState("networkidle", { timeout: 8_000 }).catch(() => {});
  }
  return !(await isChallengePage(page));
}

/**
 * Dismiss age gates, signup/newsletter popups, cookie banners, and generic closes.
 * Does not submit forms or navigate away intentionally.
 * @param {import('playwright').Page} page
 * @param {string} siteName
 */
async function dismissFirstPopups(page, siteName) {
  const dismissed = [];

  // Age / 18+ gates — Almaza uses "YES PROCEED" / "NO NOT YET"
  const ageYes = page.getByRole("button", {
    name: /yes\s*(proceed|i am|i'm|enter)?|oui|enter\s*(site|now)?|i am (over )?(18|21)|confirm.{0,20}(18|21)/i,
  });
  const ageYesAlt = page.locator(
    'button, a, [role="button"], input[type="button"], input[type="submit"], .btn',
  ).filter({
    hasText: /yes\s*proceed|^(yes|oui)\b|enter\s*(site|now)?|i\s*am\s*(over\s*)?(18|21)|18\+|over\s*18|confirm\s*age/i,
  });
  if (await clickIfVisible(page, ageYes)) dismissed.push("age-gate");
  else if (await clickIfVisible(page, ageYesAlt)) dismissed.push("age-gate");

  // Cookie / consent (EN + FR + common CMP ids)
  const cookie = page.getByRole("button", {
    name: /^(accept|agree|allow|got it|ok|okay|i agree|accept all|accept cookies|consent|accepter|tout accepter|refuser|refuse|reject all|refuser les)/i,
  });
  const cookieAlt = page.locator(
    '#onetrust-accept-btn-handler, #onetrust-reject-all-handler, .cc-btn.cc-dismiss, .cookie-accept, [data-testid*="accept"], .js-cookie-accept, button:has-text("REFUSER"), button:has-text("ACCEPTER"), button:has-text("Accept all"), button:has-text("Refuse")',
  );
  if (await clickIfVisible(page, cookie)) dismissed.push("cookie");
  else if (await clickIfVisible(page, cookieAlt)) dismissed.push("cookie");

  // Explicit FR cookie refuse (Biosphere CMP)
  const frRefuse = page.locator("button, a, [role='button']").filter({
    hasText: /refuser les non essentiels|refuser|tout refuser|je refuse|refuse non.?essential/i,
  });
  if (await clickIfVisible(page, frRefuse)) dismissed.push("cookie-fr-refuse");

  // Newsletter / signup / promo popups — close icons and "No thanks" style actions
  const noThanks = page.getByRole("button", {
    name: /no[,\s]?thanks|not now|maybe later|close|dismiss|skip|continue without|no thank|fermer/i,
  });
  if (await clickIfVisible(page, noThanks)) dismissed.push("promo-decline");

  // Common modal close buttons (Klaviyo, Shopify, generic, Shopify popup apps)
  const closeSelectors = [
    'button[aria-label*="close" i]',
    'button[aria-label*="dismiss" i]',
    '[aria-label="Close"]',
    '[aria-label="Fermer"]',
    ".needsclick.kl-private-reset-css-Xuajs1",
    ".klaviyo-close-form",
    "button.needsclick.klaviyo-close-form",
    ".popup-close",
    ".modal-close",
    ".mfp-close",
    ".fancybox-close",
    ".fancybox-button--close",
    ".dialog-close",
    ".close-modal",
    ".js-modal-close",
    "[data-dismiss='modal']",
    ".age-gate__button--yes",
    ".age-verification__confirm",
    "#age-gate-yes",
    ".btn-age-yes",
    ".needsclick[aria-label*='Close' i]",
    ".popup__close",
    ".modal__close",
    "button.close",
    "[class*='close-button']",
    "[class*='CloseButton']",
    ".privy-dismiss-content",
    "#privy-dismiss",
  ];
  for (const sel of closeSelectors) {
    if (await clickIfVisible(page, page.locator(sel))) {
      dismissed.push(`close:${sel}`);
      break;
    }
  }

  // Escape key as a gentle fallback for open dialogs
  await page.keyboard.press("Escape").catch(() => {});
  await page.waitForTimeout(500);

  // Second pass for stacked popups (cookie then newsletter, or age then promo)
  if (await clickIfVisible(page, noThanks)) dismissed.push("promo-decline-2");
  if (await clickIfVisible(page, frRefuse)) dismissed.push("cookie-fr-refuse-2");
  for (const sel of closeSelectors.slice(0, 12)) {
    if (await clickIfVisible(page, page.locator(sel))) {
      dismissed.push(`close2:${sel}`);
      break;
    }
  }

  // Site-specific heuristics
  if (/almaza/i.test(siteName)) {
    const almazaYes = page.locator("button, a, .btn, [role='button']").filter({
      hasText: /yes\s*proceed|yes|oui|enter/i,
    });
    if (await clickIfVisible(page, almazaYes)) dismissed.push("almaza-age");
    await page.waitForTimeout(800);
  }
  if (/biosphere|bioskin/i.test(siteName)) {
    // Wait briefly for delayed Klaviyo / complimentary popups
    await page.waitForTimeout(2500);
    const bioClose = page.locator(
      'button[aria-label*="close" i], button[aria-label*="fermer" i], .klaviyo-close-form, .needsclick[aria-label*="Close" i], .popup__close, .modal__close',
    );
    if (await clickIfVisible(page, bioClose)) dismissed.push("biosphere-close");
    else if (await clickIfVisible(page, noThanks)) dismissed.push("biosphere-decline");
    if (await clickIfVisible(page, frRefuse)) dismissed.push("biosphere-cookie");

    // Soft-hide leftover signup / coupon / cookie boxes (never near-full viewport)
    await page.evaluate(() => {
      document.querySelectorAll("div, aside, section, [role='dialog']").forEach((el) => {
        const t = (el.textContent || "").trim();
        const r = el.getBoundingClientRect();
        if (r.width > 1100 || r.height > 850 || t.length > 900) return;
        if (
          /INSCRIVEZ-VOUS ET PROFITEZ|Rejoignez-nous et faites-vous plaisir|Dépensez 200|Gérer le consentement|Complimentary Service|Get Your First Complimentary/i.test(
            t,
          )
        ) {
          el.style.display = "none";
        }
      });
    });
    await page.keyboard.press("Escape").catch(() => {});
    await page.waitForTimeout(400);
  }

  return dismissed;
}

/**
 * Unlock a simple password gate when `passwordEnv` is set and present in env.
 * @param {import('playwright').Page} page
 * @param {string | undefined} passwordEnv
 */
async function unlockPasswordGate(page, passwordEnv) {
  if (!passwordEnv) return false;
  const password = process.env[passwordEnv];
  if (!password) {
    console.warn(`  (skip unlock: env ${passwordEnv} not set)`);
    return false;
  }
  const field = page.locator('input[type="password"]').first();
  if (!(await field.isVisible().catch(() => false))) return false;
  await field.fill(password);
  const enter = page.getByRole("button", { name: /enter|submit|unlock|continue/i });
  if (await enter.first().isVisible().catch(() => false)) {
    await enter.first().click({ force: true }).catch(() => {});
  } else {
    await field.press("Enter").catch(() => {});
  }
  await page.waitForLoadState("networkidle", { timeout: 20_000 }).catch(() => {});
  await page.waitForTimeout(2000);
  return true;
}

/**
 * @param {import('playwright').Browser} browser
 * @param {{ filename: string, url: string, name: string, passwordEnv?: string, waitForVideo?: boolean }} site
 */
async function captureOne(browser, site) {
  const outPath = path.join(outDir, site.filename);
  const context = await browser.newContext({
    viewport: VIEWPORT,
    ignoreHTTPSErrors: true,
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    locale: "en-US",
    javaScriptEnabled: true,
  });
  await context.addInitScript(() => {
    Object.defineProperty(navigator, "webdriver", { get: () => undefined });
  });
  const page = await context.newPage();

  try {
    try {
      await page.goto(site.url, {
        waitUntil: "domcontentloaded",
        timeout: NAV_TIMEOUT_MS,
      });
    } catch (navErr) {
      const msg = navErr instanceof Error ? navErr.message : String(navErr);
      if (!/Timeout/i.test(msg)) throw navErr;
    }

    // Wait for network to quiet, then allow late popups / CF challenge to appear
    await page.waitForLoadState("networkidle", { timeout: 20_000 }).catch(() => {});
    await page.waitForTimeout(2500);

    // Try to clear Cloudflare Turnstile / "Verify you are human"
    const passedCf = await tryPassCloudflare(page);
    if (!passedCf) {
      const title = (await page.title().catch(() => "")) || "";
      const placeholder = await createPlaceholder(site.name);
      await writeFile(outPath, placeholder);
      await context.close();
      return {
        filename: site.filename,
        status: "placeholder",
        error: `bot/challenge interstitial (title: ${title || "n/a"})`,
        dismissed: [],
      };
    }

    await unlockPasswordGate(page, site.passwordEnv);

    const bodyText = await page
      .locator("body")
      .innerText({ timeout: 5_000 })
      .catch(() => "");
    const blank =
      !bodyText.trim() ||
      (await page
        .evaluate(() => {
          const text = (document.body?.innerText || "").trim();
          const imgs = document.images?.length || 0;
          return text.length < 20 && imgs === 0;
        })
        .catch(() => false));

    if (blank) {
      const placeholder = await createPlaceholder(site.name);
      await writeFile(outPath, placeholder);
      await context.close();
      return {
        filename: site.filename,
        status: "placeholder",
        error: "blank or empty homepage",
        dismissed: [],
      };
    }

    // Wait for late-loading signup/age overlays (Biosphere Klaviyo often delayed)
    await page.waitForTimeout(3500);

    const dismissed = await dismissFirstPopups(page, site.name);
    await page.waitForTimeout(1500);
    const dismissed2 = await dismissFirstPopups(page, site.name);
    await page.waitForTimeout(1200);
    const dismissed3 = await dismissFirstPopups(page, site.name);
    await page.waitForTimeout(800);

    if (site.waitForVideo) {
      await waitForHeroVideo(page);
    }

    const png = await page.screenshot({
      type: "png",
      fullPage: false,
      clip: { x: 0, y: 0, width: VIEWPORT.width, height: VIEWPORT.height },
      // Allow animations so hero videos render a live frame (not a frozen poster).
      animations: site.waitForVideo ? "allow" : "disabled",
    });
    const webp = await pngToWebp(png);
    await writeFile(outPath, webp);
    await context.close();
    return {
      filename: site.filename,
      status: "success",
      error: null,
      dismissed: [...dismissed, ...dismissed2, ...dismissed3],
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    try {
      const placeholder = await createPlaceholder(site.name);
      await writeFile(outPath, placeholder);
      await context.close().catch(() => {});
      return {
        filename: site.filename,
        status: "placeholder",
        error: message.split("\n")[0],
        dismissed: [],
      };
    } catch (placeholderErr) {
      await context.close().catch(() => {});
      const pMsg =
        placeholderErr instanceof Error ? placeholderErr.message : String(placeholderErr);
      return {
        filename: site.filename,
        status: "failed",
        error: `${message.split("\n")[0]} | placeholder: ${pMsg.split("\n")[0]}`,
        dismissed: [],
      };
    }
  }
}

async function main() {
  await mkdir(outDir, { recursive: true });
  const filter = process.argv.slice(2).map((s) => s.toLowerCase());
  const sites =
    filter.length > 0
      ? SITES.filter(
          (s) =>
            filter.some((f) => s.filename.includes(f) || s.name.toLowerCase().includes(f)),
        )
      : SITES;
  if (sites.length === 0) {
    console.error(`No sites matched filter: ${filter.join(", ")}`);
    process.exit(1);
  }
  console.log(`Output directory: ${outDir}`);
  console.log(`Capturing ${sites.length} homepages (with popup dismiss)…\n`);

  const browser = await chromium.launch({
    headless: true,
    args: [
      "--disable-dev-shm-usage",
      "--no-sandbox",
      "--disable-blink-features=AutomationControlled",
      "--autoplay-policy=no-user-gesture-required",
    ],
  });

  /** @type {{ filename: string, status: string, error: string | null, dismissed?: string[] }[]} */
  const results = [];

  for (const site of sites) {
    process.stdout.write(`${site.filename} ← ${site.url} … `);
    const result = await captureOne(browser, site);
    results.push(result);
    if (result.status === "success") {
      const note = result.dismissed?.length ? ` [dismissed: ${result.dismissed.join(", ")}]` : "";
      console.log(`OK${note}`);
    } else if (result.status === "placeholder") {
      console.log(`PLACEHOLDER (${result.error})`);
    } else {
      console.log(`FAILED (${result.error})`);
    }
  }

  await browser.close();

  console.log("\n=== Summary ===");
  console.log("| filename | status | dismissed | error |");
  console.log("|---|---|---|---|");
  for (const r of results) {
    console.log(
      `| ${r.filename} | ${r.status} | ${(r.dismissed || []).join("; ") || "—"} | ${r.error ?? ""} |`,
    );
  }

  const counts = {
    success: results.filter((r) => r.status === "success").length,
    placeholder: results.filter((r) => r.status === "placeholder").length,
    failed: results.filter((r) => r.status === "failed").length,
  };
  console.log(
    `\nTotals: ${counts.success} success, ${counts.placeholder} placeholder, ${counts.failed} failed`,
  );

  await writeFile(
    path.join(outDir, "_capture-summary.json"),
    JSON.stringify({ generatedAt: new Date().toISOString(), counts, results }, null, 2),
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
