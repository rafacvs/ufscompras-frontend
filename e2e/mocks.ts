import type { Page } from '@playwright/test';
import {
  makeBackendAccessory,
  makeBackendCategory,
  makeBackendProduct,
  type BackendProduct,
} from '../src/test/factories';

export const API_BASE_URL = 'http://localhost:5000/api';

export const categories = [
  makeBackendCategory({ _id: 'cat-camisetas', nome: 'Camisetas', slug: 'camisetas' }),
  makeBackendCategory({ _id: 'cat-calcas', nome: 'Calças', slug: 'calcas' }),
];

export const productList = [
  makeBackendProduct({
    _id: 'prod-shirt',
    nome: 'Camiseta Minimal',
    preco: 149.9,
    tamanhos: ['P', 'M', 'G'],
    cores: ['preto', 'branco'],
    isFeatured: true,
    id_categoria: { _id: categories[0]._id, nome: categories[0].nome, slug: categories[0].slug },
  }),
  makeBackendProduct({
    _id: 'prod-jeans',
    nome: 'Calça Jeans Relax',
    preco: 229.9,
    tamanhos: ['P', 'M', 'G'],
    cores: ['azul', 'preto'],
    isFeatured: true,
    id_categoria: { _id: categories[1]._id, nome: categories[1].nome, slug: categories[1].slug },
  }),
  makeBackendProduct({
    _id: 'prod-jacket',
    nome: 'Jaqueta Tech',
    preco: 319.9,
    tamanhos: ['M', 'G'],
    cores: ['preto'],
    id_categoria: { _id: categories[0]._id, nome: categories[0].nome, slug: categories[0].slug },
  }),
];

export const accessories = [
  makeBackendAccessory({ _id: 'acc-bucket', nome: 'Bucket Hat', preco: 89.9 }),
  makeBackendAccessory({ _id: 'acc-cinto', nome: 'Cinto Minimal', preco: 59.9 }),
];

export const userLoginResponse = {
  token: 'token-user',
  user: { id: 'user-1', nome: 'Cliente', email: 'cliente@ufscompras.com', isAdmin: false },
};

export const adminLoginResponse = {
  token: 'token-admin',
  user: { id: 'admin-1', nome: 'Admin', email: 'admin@ufscompras.com', isAdmin: true },
};

const jsonResponse = (data: unknown, status = 200) => ({
  status,
  contentType: 'application/json',
  body: JSON.stringify(data),
});

const buildListResponse = (data: BackendProduct[], overrides: Partial<{ page: number; totalPages: number }> = {}) => ({
  data,
  pagination: {
    page: overrides.page ?? 1,
    limit: data.length,
    total: data.length,
    totalPages: overrides.totalPages ?? 1,
  },
});

export const mockCategories = (page: Page) =>
  page.route('**/api/categories', (route) => route.fulfill(jsonResponse(categories)));

const productsListRegex = /\/api\/products(\?.*)?$/;
const productDetailRegex = /\/api\/products\/[^/?]+$/;

export const mockProducts = (page: Page, data: BackendProduct[] = productList, paginationOverrides?: { totalPages?: number }) =>
  page.route(productsListRegex, (route) =>
    route.fulfill(jsonResponse(buildListResponse(data, { totalPages: paginationOverrides?.totalPages }))),
  );

export const mockFeaturedProducts = (page: Page, data: BackendProduct[] = productList.filter((item) => item.isFeatured)) =>
  page.route('**/api/products/featured*', (route) => route.fulfill(jsonResponse(data)));

export const mockProductById = (page: Page, data: BackendProduct[] = productList) =>
  page.route(productDetailRegex, (route) => {
    const id = route.request().url().split('/').pop() ?? '';
    const product = data.find((item) => item._id === id);
    if (!product) {
      return route.fulfill(jsonResponse({ message: 'Produto não encontrado' }, 404));
    }
    return route.fulfill(jsonResponse(product));
  });

export const mockAccessories = (page: Page) =>
  page.route('**/api/accessories*', (route) => route.fulfill(jsonResponse(accessories)));

export const mockLogin = (page: Page, response?: typeof userLoginResponse, status = 200) =>
  page.route('**/api/auth/login', (route) => {
    if (status >= 400) {
      return route.fulfill(jsonResponse({ message: 'Credenciais inválidas' }, status));
    }
    return route.fulfill(jsonResponse(response ?? userLoginResponse));
  });

export const mockPurchase = (page: Page, status = 200) =>
  page.route('**/api/purchase', (route) => {
    if (status >= 400) {
      return route.fulfill(jsonResponse({ message: 'Falha ao confirmar compra' }, status));
    }
    return route.fulfill(jsonResponse({ message: 'Compra confirmada', estoque: 8 }));
  });

export const seedAuthState = (page: Page, state: typeof userLoginResponse) =>
  page.addInitScript((storedState) => {
    window.localStorage.setItem('ufscompras:auth', JSON.stringify(storedState));
  }, state);


