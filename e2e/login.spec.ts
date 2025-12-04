import { expect, test } from '@playwright/test';
import { mockCategories, mockFeaturedProducts, mockLogin, mockProducts } from './mocks';

test.beforeEach(async ({ page }) => {
  await mockCategories(page);
  await mockProducts(page);
  await mockFeaturedProducts(page);
});

test('authenticates the user and persists the session', async ({ page }) => {
  await mockLogin(page);

  await page.goto('/login');
  await page.getByLabel('Email').fill('cliente@ufscompras.com');
  await page.getByLabel('Senha').fill('cliente123');
  await page.getByRole('button', { name: 'Entrar' }).click();

  await expect(page).toHaveURL('/');
  await expect(page.getByText('Olá, Cliente')).toBeVisible();

  await page.reload();
  await expect(page.getByText('Olá, Cliente')).toBeVisible();
});

test('exibe mensagem de erro para credenciais inválidas', async ({ page }) => {
  await mockLogin(page, undefined, 401);

  await page.goto('/login');
  await page.getByLabel('Email').fill('wrong@example.com');
  await page.getByLabel('Senha').fill('wrong');
  await page.getByRole('button', { name: 'Entrar' }).click();

  await expect(page.getByText('Credenciais inválidas')).toBeVisible();
});


