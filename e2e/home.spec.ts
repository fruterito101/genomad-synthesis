import { test, expect } from "@playwright/test";

test.describe("Home Page", () => {
  test("should load homepage", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/Genomad/i);
  });

  test("should have navigation", async ({ page }) => {
    await page.goto("/");
    
    // Check main nav elements exist
    await expect(page.getByRole("navigation")).toBeVisible();
  });

  test("should show connect wallet button", async ({ page }) => {
    await page.goto("/");
    
    // Look for login/connect button
    const connectBtn = page.getByRole("button", { name: /connect|login|wallet/i });
    await expect(connectBtn).toBeVisible();
  });
});

test.describe("Dashboard Page", () => {
  test("should load dashboard", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/dashboard/);
  });
});

test.describe("Agents Page", () => {
  test("should load agents page", async ({ page }) => {
    await page.goto("/agents");
    await expect(page).toHaveURL(/agents/);
  });
});

test.describe("Breeding Page", () => {
  test("should load breeding page", async ({ page }) => {
    await page.goto("/breeding");
    await expect(page).toHaveURL(/breeding/);
  });
});
