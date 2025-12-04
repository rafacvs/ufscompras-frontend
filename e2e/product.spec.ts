import { expect, test } from '@playwright/test';
import {
  mockAccessories,
  mockCategories,
  mockProductById,
  mockProducts,
  mockPurchase,
  seedAuthState,
  userLoginResponse,
} from './mocks';

test.beforeEach(async ({ page }) => {
  await mockCategories(page);
  await mockProducts(page);
  await mockProductById(page);
  await mockAccessories(page);
});

test('redirects visitors to login when trying to buy without authentication', async ({ page }) => {
  await page.goto('/produto/prod-shirt');
  await page.getByRole('button', { name: 'Comprar' }).click();
  await expect(page).toHaveURL(/login\?from=%2Fproduto%2Fprod-shirt/);
});

test('allows authenticated users to purchase with accessories selected', async ({ page }) => {
  await seedAuthState(page, userLoginResponse);
  await mockPurchase(page);

  await page.goto('/produto/prod-shirt');
  await expect(page.getByText('Camiseta Minimal')).toBeVisible();

  await page.getByLabel('Bucket Hat').check();
  await page.getByLabel('Cinto Minimal').check();

  await expect(page.getByText('Total com acessórios').locator('xpath=following-sibling::*[1]')).toHaveText(/299,70/);

  const dialogPromise = page.waitForEvent('dialog');
  await page.getByRole('button', { name: 'Comprar' }).click();
  const dialog = await dialogPromise;
  expect(dialog.message()).toContain('Compra confirmada');
  await dialog.dismiss();
});


