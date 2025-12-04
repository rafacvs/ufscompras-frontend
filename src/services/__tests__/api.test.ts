import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { backendCategories } from '../../test/msw/handlers';

const importApiModule = async () => import('../api');

describe('api service', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('maps categories with fallback data and caches the request', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    const { getCategories } = await importApiModule();

    const firstCall = await getCategories();
    const secondCall = await getCategories();

    expect(firstCall[0]).toMatchObject({
      slug: 'camisetas',
      title: 'Camisetas',
      description: expect.stringContaining('Coleção'),
    });
    expect(secondCall).toBe(firstCall);
    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });

  it('passes category id when filtering products by slug', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    const { getProducts } = await importApiModule();

    await getProducts({ category: 'camisetas', limit: 2 });

    const productsCall = fetchSpy.mock.calls.find(([url]) => url.toString().includes('/products?'));
    expect(productsCall?.[0]).toContain(`category=${backendCategories[0]._id}`);
  });

  it('applies price sorting and client-side filters', async () => {
    const { getProducts } = await importApiModule();

    const result = await getProducts({
      colors: ['preto'],
      sizes: ['M'],
      sort: 'price-desc',
    });

    expect(result.items.length).toBeGreaterThan(0);
    expect(result.items[0].price).toBeGreaterThanOrEqual(result.items[result.items.length - 1].price);
  });

  it('returns a normalized product when searching by id', async () => {
    const { getProductById } = await importApiModule();

    const product = await getProductById('prod-jeans');

    expect(product).toMatchObject({
      id: 'prod-jeans',
      name: 'Calça Jeans Relax',
      category: 'calcas',
      images: expect.any(Array),
    });
  });

  it('returns undefined when product id is empty', async () => {
    const { getProductById } = await importApiModule();
    await expect(getProductById('')).resolves.toBeUndefined();
  });

  it('maps accessories to the UI format', async () => {
    const { getAccessories } = await importApiModule();

    const accessories = await getAccessories();

    expect(accessories[0]).toMatchObject({
      id: expect.any(String),
      name: expect.any(String),
      price: expect.any(Number),
      image: expect.any(String),
    });
  });
});


