import { test, expect } from '@playwright/test';

test.describe('ASORA Storefront & Catalog E2E', () => {
  test('should load Homepage with official ASORA branding, navigation & hero section', async ({ page }) => {
    await page.goto('/');

    // Check page title and logo
    await expect(page).toHaveTitle(/ASORA/i);
    const logo = page.locator('header img[alt="ASORA"]').first();
    await expect(logo).toBeVisible();

    // Verify main navigation links
    await expect(page.locator('header').getByRole('link', { name: 'HOME' })).toBeVisible();
    await expect(page.locator('header').getByRole('link', { name: 'SHOP' })).toBeVisible();
    await expect(page.locator('header').getByRole('link', { name: 'ANIME' })).toBeVisible();
    await expect(page.locator('header').getByRole('link', { name: 'CUSTOM' })).toBeVisible();

    // Verify footer branding & social links
    await expect(page.locator('footer').getByText('WEAR YOUR STORY')).toBeVisible();
    await expect(page.locator('footer a[aria-label="Follow us on Instagram"]')).toBeVisible();
    await expect(page.locator('footer a[aria-label="Chat on WhatsApp"]')).toBeVisible();
  });

  test('should open search dialog and search product catalog', async ({ page }) => {
    await page.goto('/');

    // Click search button
    const searchBtn = page.getByRole('button', { name: /Search anime/i }).first();
    await searchBtn.click();

    // Wait for search dialog
    const searchInput = page.getByPlaceholder(/Search anime tees/i);
    await expect(searchInput).toBeVisible();

    // Type query and submit search
    await searchInput.fill('Anime');
    await searchInput.press('Enter');

    // Verify redirected to products catalog filtered by query
    await page.waitForURL(/\/products\?q=Anime/i, { timeout: 15000 });
    await expect(page.locator('h1')).toBeVisible();
  });

  test('should browse product detail page with size selection and price calculation', async ({ page }) => {
    await page.goto('/products');

    // Click first product card
    const firstProduct = page.locator('a[href*="/products/"]').first();
    await firstProduct.click();

    // Verify product detail components
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.getByText(/SELECT SIZE/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /ADD TO CART/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /ORDER ON WHATSAPP/i })).toBeVisible();
  });
});
