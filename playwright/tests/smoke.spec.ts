import { test, expect } from "@playwright/test";

test.describe("Demo app smoke", () => {
  test("loads and shows demo title", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "Tooltip sanity check" })).toBeVisible();
  });

  test("tooltip trigger is visible", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("button", { name: "Hover or focus me" })).toBeVisible();
  });
});
