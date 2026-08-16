import { test, expect } from "@playwright/test";

test("feeds page loads announcements", async ({ page }) => {
  await page.goto("http://localhost:3001/feeds");

  await expect(
    page.getByRole("heading", { name: "Feeds / Announcements" })
  ).toBeVisible();

  await expect(
    page.getByPlaceholder("Search posts...")
  ).toBeVisible();

  await expect(
    page.getByText("Latest announcements published through the RSS Server.")
  ).toBeVisible();
});