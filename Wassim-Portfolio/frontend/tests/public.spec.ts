import { test, expect } from "@playwright/test";
import path from "node:path";
import fs from "node:fs";

const shotDir = path.join(process.cwd(), "test-results", "visual");

test.beforeAll(() => {
  fs.mkdirSync(shotDir, { recursive: true });
});

test.describe("public portfolio", () => {
  test("home renders hero, services, and work", async ({ page }, testInfo) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Wassim");
    await expect(page.getByRole("heading", { name: /build for you/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Selected work" })).toBeVisible();
    await expect(page.getByRole("link", { name: /view all projects/i })).toBeVisible();
    await page.screenshot({
      path: path.join(shotDir, `home-${testInfo.project.name}.png`),
      fullPage: true,
    });
  });

  test("project card opens modal with details and app links", async ({ page }, testInfo) => {
    test.skip(test.info().project.name !== "desktop", "Modal flow once on desktop");
    await page.goto("/");
    await page.getByRole("button", { name: /BEWE/i }).first().click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole("heading", { name: "BEWE" })).toBeVisible();
    await expect(dialog.getByRole("link", { name: /visit website/i })).toBeVisible();
    await expect(dialog.getByRole("link", { name: /download android/i })).toBeVisible();
    await expect(dialog.getByRole("link", { name: /download ios/i })).toBeVisible();
    await page.screenshot({
      path: path.join(shotDir, `modal-bewe-${testInfo.project.name}.png`),
    });
    await dialog.getByRole("button", { name: /close/i }).click();
    await expect(dialog).toHaveCount(0);
  });

  test("work page filters and detail routes", async ({ page }, testInfo) => {
    await page.goto("/work");
    await expect(page.getByRole("heading", { level: 1, name: "Work" })).toBeVisible();
    const ecommerce = page.getByRole("tab", { name: "E-commerce" });
    if (await ecommerce.isVisible()) {
      await ecommerce.click();
      await expect(page.getByRole("button", { name: /Almaza/i })).toBeVisible();
    }
    await page.screenshot({
      path: path.join(shotDir, `work-${testInfo.project.name}.png`),
      fullPage: true,
    });

    await page.goto("/work/bewe");
    await expect(page.getByRole("heading", { level: 1, name: "BEWE" })).toBeVisible();
    await expect(page.getByText(/related product apps/i)).toBeVisible();
  });

  test("keyboard focus is visible on primary nav", async ({ page }) => {
    await page.goto("/");
    await page.keyboard.press("Tab");
    const focused = page.locator(":focus-visible");
    await expect(focused.first()).toBeVisible();
  });
});
