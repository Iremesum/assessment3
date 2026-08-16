import { test, expect } from "@playwright/test";

test("admin can login, create, edit and delete an announcement", async ({ page }) => {
  const uniqueTitle = `Playwright Announcement ${Date.now()}`;
  const editedTitle = `${uniqueTitle} Edited`;

  await page.goto("http://localhost:3001/login");

  await page.getByLabel("Email").fill("admin@example.com");
  await page.getByLabel("Password").fill("MyPassword123!");
  await page.getByRole("button", { name: "Login" }).click();

  await expect(page.getByText("Login successful.")).toBeVisible();

  await page.goto("http://localhost:3001/feeds");

  await page
    .getByRole("button", { name: "+ New Announcement" })
    .click();

  await page.getByLabel("Title").fill(uniqueTitle);
  await page.getByLabel("Posted by").fill("Playwright");
  await page
    .getByLabel("Summary")
    .fill("Created automatically by Playwright");
  await page
    .getByLabel("Full content")
    .fill("This announcement tests the complete Assessment 3 workflow.");

  await page
    .getByRole("button", { name: "Publish Announcement" })
    .click();

  await expect(
    page.getByText("Announcement published successfully.")
  ).toBeVisible();

  await expect(page.getByText(uniqueTitle)).toBeVisible();

    const postCard = page
    .locator("div.rounded-xl")
    .filter({
        has: page.getByRole("heading", {
        name: uniqueTitle,
        }),
    });

    await postCard
    .getByRole("link", { name: "Full page →" })
    .click();

  await expect(page.getByText(uniqueTitle)).toBeVisible();

  await page
    .getByRole("button", { name: "Edit Announcement" })
    .click();

  await page.getByLabel("Title").fill(editedTitle);

  await page
    .getByRole("button", { name: "Save Changes" })
    .click();

  await expect(
    page.getByText("Announcement updated successfully.")
  ).toBeVisible();

  await expect(page.getByText(editedTitle)).toBeVisible();

  page.once("dialog", async (dialog) => {
    await dialog.accept();
  });

  await page
    .getByRole("button", { name: "Delete Announcement" })
    .click();

  await expect(page).toHaveURL("http://localhost:3001/feeds");

  await expect(page.getByText(editedTitle)).not.toBeVisible();
});