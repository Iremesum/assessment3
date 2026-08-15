import { test, expect } from '@playwright/test';

test('feeds page loads RSS data', async ({ page }) => {
  await page.goto('http://localhost:3001/feeds');

  await expect(
    page.getByText('Feeds / Announcements')
  ).toBeVisible();

  await expect(
    page.getByText('Live RSS XML data fetched from the RSS Server backend')
  ).toBeVisible();

  await expect(
    page.getByRole('button', { name: 'Refresh Feed' })
  ).toBeVisible();

  await expect(
    page.getByText('No posts available yet.')
  ).toBeVisible();
});