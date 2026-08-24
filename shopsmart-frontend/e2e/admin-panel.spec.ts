import { test, expect } from '@playwright/test';

test.describe('ASORA Admin Console & Governance E2E', () => {
  test('should authenticate admin user and load dashboard metrics', async ({ page }) => {
    await page.goto('/login?redirect=/admin');

    // Fill Admin credentials
    await page.getByPlaceholder(/m@example.com/i).fill('admin@shopsmart.com');
    await page.locator('input[type="password"]').fill('Admin@123456');

    // Click Sign In
    await page.getByRole('button', { name: /Sign In/i }).click();

    // Wait for redirect to /admin
    await page.waitForURL(/\/admin/, { timeout: 20000 });

    // Verify Admin Console navigation
    await expect(page.getByText(/Admin Console/i).first()).toBeVisible();
    await expect(page.locator('h1').first()).toBeVisible();
  });

  test('should view Admin Products and Store Settings', async ({ page }) => {
    // Authenticate first
    await page.goto('/login?redirect=/admin');
    await page.getByPlaceholder(/m@example.com/i).fill('admin@shopsmart.com');
    await page.locator('input[type="password"]').fill('Admin@123456');
    await page.getByRole('button', { name: /Sign In/i }).click();
    await page.waitForURL(/\/admin/, { timeout: 20000 });

    // Click Products link in sidebar
    await page.locator('aside').getByRole('link', { name: /Products/i }).click();
    await page.waitForURL(/\/admin\/products/, { timeout: 15000 });
    await expect(page.getByText(/Products Catalog/i)).toBeVisible();

    // Click Settings link in sidebar
    await page.locator('aside').getByRole('link', { name: /Settings/i }).click();
    await page.waitForURL(/\/admin\/settings/, { timeout: 15000 });
    await expect(page.getByText(/Platform Settings/i)).toBeVisible();
  });
});
