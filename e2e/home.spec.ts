import { expect, test } from '@playwright/test';
import { mockCategories, mockFeaturedProducts, mockProducts } from './mocks';

test.beforeEach(async ({ page }) => {
  await mockCategories(page);
  await mockProducts(page);
  await mockFeaturedProducts(page);
});

test('renders hero sections and allows navigation to category pages', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByText('Seleção destacada')).toBeVisible();
  await expect(page.getByText('Vitrine')).toBeVisible();

  await page.getByRole('link', { name: 'Camisetas' }).click();
  await expect(page).toHaveURL(/categoria\/camisetas/);
});


