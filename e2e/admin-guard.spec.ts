import { expect, test } from '@playwright/test';
import {
  adminLoginResponse,
  mockCategories,
  mockFeaturedProducts,
  mockProducts,
  seedAuthState,
  userLoginResponse,
} from './mocks';

test.beforeEach(async ({ page }) => {
  await mockCategories(page);
  await mockProducts(page);
  await mockFeaturedProducts(page);
});

test('redirects anonymous visitors to the admin login', async ({ page }) => {
  await page.goto('/admin');
  await expect(page).toHaveURL(/\/admin\/login$/);
});

test('redirects authenticated non-admin users to the storefront', async ({ page }) => {
  await seedAuthState(page, userLoginResponse);
  await page.goto('/admin');
  await expect(page).toHaveURL('/');
});

test('allows admin users to access the dashboard', async ({ page }) => {
  await seedAuthState(page, adminLoginResponse);
  await page.goto('/admin');
  await expect(page.getByText('Bem-vindo ao painel')).toBeVisible();
});


