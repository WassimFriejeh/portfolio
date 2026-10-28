import { test, expect } from "@playwright/test";

const email = process.env.ADMIN_EMAIL ?? "admin@wassim.local";
const password = process.env.ADMIN_PASSWORD ?? "WassimPortfolioAdmin1!";
const api = process.env.API_URL ?? "http://127.0.0.1:4411";

test.describe("admin CMS", () => {
  test("unauthenticated write is rejected by API", async ({ request }) => {
    const res = await request.post(`${api}/api/admin/projects`, {
      data: {
        name: "Hack",
        slug: "hack-attempt",
        developmentStatus: "INDEPENDENT",
      },
    });
    expect([401, 403]).toContain(res.status());
  });

  test("login, create draft, keep private, then cleanup", async ({ page, request }) => {
    test.skip(test.info().project.name !== "desktop", "Run CMS flow once on desktop");

    await page.goto("/admin");
    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Password").fill(password);
    await page.getByRole("button", { name: /sign in/i }).click();
    await expect(page.getByRole("heading", { name: "Projects" })).toBeVisible({ timeout: 15000 });

    await page.getByRole("main").getByRole("link", { name: "New project" }).click();
    const slug = `e2e-draft-${Date.now()}`;
    await page.getByLabel("Name").fill("E2E Draft Project");
    await page.getByLabel("Slug").fill(slug);
    await page.getByLabel("Short description").fill("Temporary draft for automated test.");
    await page.getByLabel("Status", { exact: true }).selectOption("DRAFT");
    await page.getByRole("button", { name: /create project/i }).click();
    await expect(page.getByText("Created.")).toBeVisible({ timeout: 15000 });

    const publicRes = await request.get(`${api}/api/projects/${slug}`);
    expect(publicRes.status()).toBe(404);

    await page.goto("/admin/dashboard");
    const row = page.locator("li", { hasText: "E2E Draft Project" });
    await expect(row).toBeVisible();
    page.once("dialog", (d) => d.accept());
    await row.getByRole("button", { name: "Delete" }).click();
    await expect(row).toHaveCount(0, { timeout: 10000 });

    await page.getByRole("button", { name: /log out/i }).click();
    await expect(page.getByRole("heading", { name: "Admin" })).toBeVisible();
  });
});
