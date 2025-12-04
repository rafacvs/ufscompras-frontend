import { expect, test, type Route } from '@playwright/test';
import { makeBackendProduct } from '../src/test/factories';
import { categories, mockCategories, mockFeaturedProducts, productList } from './mocks';

const jsonFulfill = (route: Route, data: unknown, status = 200) =>
  route.fulfill({
    status,
    contentType: 'application/json',
    body: JSON.stringify(data),
  });

test.beforeEach(async ({ page }) => {
  await mockCategories(page);
  await mockFeaturedProducts(page);
});

test('applies filters and paginates through the catalog', async ({ page }) => {
  const extendedCatalog = [
    ...productList,
    ...Array.from({ length: 14 }).map((_, index) =>
      makeBackendProduct({
        _id: `prod-extra-${index}`,
        nome: `Produto Extra ${index + 1}`,
        preco: 99 + index,
        id_categoria: { _id: categories[0]._id, nome: categories[0].nome, slug: categories[0].slug },
      }),
    ),
  ];

  await page.route(/\/api\/products(\?.*)?$/, (route) => {
    const url = new URL(route.request().url());
    const pageParam = Number(url.searchParams.get('page') ?? '1');
    const limit = Number(url.searchParams.get('limit') ?? 12);
    const start = (pageParam - 1) * limit;
    const slice = extendedCatalog.slice(start, start + limit);
    jsonFulfill(route, {
      data: slice,
      pagination: {
        page: pageParam,
        limit,
        total: extendedCatalog.length,
        totalPages: Math.ceil(extendedCatalog.length / limit),
      },
    });
  });

  await page.goto('/produtos');
  await expect(page.getByText('Camiseta Minimal')).toBeVisible();

  await page.getByPlaceholder('Buscar por nome...').fill('jaqueta');
  await expect(page).toHaveURL(/busca=jaqueta/);

  const categorySelect = page.getByRole('combobox').first();
  const sortSelect = page.getByRole('combobox').nth(1);

  await categorySelect.selectOption('camisetas');
  await expect(page).toHaveURL(/categoria=camisetas/);

  await sortSelect.selectOption('price-desc');
  await expect(page).toHaveURL(/ordem=price-desc/);

  await page.getByRole('button', { name: 'Próxima' }).click();
  await expect(page).toHaveURL(/page=2/);
  await expect(page.getByText('Produto Extra 13')).toBeVisible();
});


