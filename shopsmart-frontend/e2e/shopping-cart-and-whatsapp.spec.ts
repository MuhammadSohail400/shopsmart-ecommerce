import { test, expect } from '@playwright/test';

test.describe('ASORA Frictionless Shopping & WhatsApp Order E2E', () => {
  test('should allow frictionless Add to Cart without login popup', async ({ page }) => {
    // Navigate directly to product detail page
    await page.goto('/products/domain-expansion-heavyweight-tee');

    // Select Size pill from variant container
    const sizeBtn = page.locator('div.flex.flex-wrap.gap-2 button').first();
    if (await sizeBtn.isVisible()) {
      await sizeBtn.click();
    }

    // Click ADD TO CART
    const addToCartBtn = page.locator('button:has-text("ADD TO CART")').first();
    await expect(addToCartBtn).toBeVisible();
    await addToCartBtn.click();

    // Verify user is not redirected to /login
    await expect(page).not.toHaveURL(/\/login/);
    await page.waitForTimeout(2000);

    // Go to Cart page
    await page.goto('/cart');

    // Verify cart page loads without login barrier
    await expect(page.locator('h1')).toBeVisible();
  });

  test('should open WhatsApp Quick Order Dialog and fill delivery address', async ({ page }) => {
    await page.goto('/products/domain-expansion-heavyweight-tee');

    // Click ORDER ON WHATSAPP
    const whatsappBtn = page.locator('button:has-text("ORDER ON WHATSAPP")').first();
    await whatsappBtn.click();

    // Verify WhatsApp order dialog opens
    const dialog = page.locator('div[role="dialog"]');
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText(/1-Click WhatsApp Order/i)).toBeVisible();

    // Fill customer delivery details
    await dialog.getByPlaceholder(/Ali Khan/i).fill('Ali Hassan');
    await dialog.getByPlaceholder(/0300 1234567/i).fill('03110297772');
    await dialog.getByPlaceholder(/Karachi \/ Lahore/i).fill('Lahore');
    await dialog.getByPlaceholder(/House #/i).fill('House 45, Street 2, Gulberg III');

    // Verify submit button is enabled
    const submitOrderBtn = dialog.locator('button:has-text("SEND ORDER TO WHATSAPP")');
    await expect(submitOrderBtn).toBeEnabled();
  });
});
