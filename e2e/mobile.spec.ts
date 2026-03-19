import { test, expect } from "@playwright/test";

test.describe("Mobile Responsive", () => {
  test.use({ viewport: { width: 375, height: 667 } }); // iPhone SE

  test("homepage should be responsive", async ({ page }) => {
    await page.goto("/");
    
    // Should not have horizontal scroll
    const body = page.locator("body");
    const scrollWidth = await body.evaluate((el) => el.scrollWidth);
    const clientWidth = await body.evaluate((el) => el.clientWidth);
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 10);
  });

  test("navigation should work on mobile", async ({ page }) => {
    await page.goto("/");
    
    // Look for mobile menu button (hamburger)
    const menuBtn = page.getByRole("button", { name: /menu/i }).or(
      page.locator("[aria-label*='menu']")
    ).or(
      page.locator("button svg") // Common hamburger pattern
    );
    
    // Menu should exist or nav should be visible
    const nav = page.getByRole("navigation");
    const isNavVisible = await nav.isVisible().catch(() => false);
    const isMenuVisible = await menuBtn.first().isVisible().catch(() => false);
    
    expect(isNavVisible || isMenuVisible).toBeTruthy();
  });

  test("dashboard should be usable on mobile", async ({ page }) => {
    await page.goto("/dashboard");
    await page.waitForLoadState("networkidle");
    
    // Content should be visible
    const main = page.locator("main").or(page.locator("[role='main']")).or(page.locator(".container"));
    await expect(main.first()).toBeVisible();
  });
});

test.describe("Tablet Responsive", () => {
  test.use({ viewport: { width: 768, height: 1024 } }); // iPad

  test("should render properly on tablet", async ({ page }) => {
    await page.goto("/");
    
    const body = page.locator("body");
    const scrollWidth = await body.evaluate((el) => el.scrollWidth);
    const clientWidth = await body.evaluate((el) => el.clientWidth);
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 10);
  });
});
