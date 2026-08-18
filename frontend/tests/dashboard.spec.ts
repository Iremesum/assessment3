import { test, expect } from '@playwright/test';

test('dashboard loads successfully', async ({ page }) => {
  await page.goto("/");

  await expect(page.getByText('RSS Server Dashboard')).toBeVisible();
  await expect(page.getByText('Server Health')).toBeVisible();
  await expect(page.getByText('Total Requests')).toBeVisible();
});