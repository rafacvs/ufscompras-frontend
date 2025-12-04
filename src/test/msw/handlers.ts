import { rest } from 'msw';
import { makeBackendAccessory, makeBackendCategory, makeBackendProduct } from '../factories';

export const API_BASE_URL = 'http://localhost:5000/api';

export const backendCategories = [
  makeBackendCategory({ _id: 'cat-camisetas', nome: 'Camisetas', slug: 'camisetas' }),
  makeBackendCategory({ _id: 'cat-calcas', nome: 'Calças', slug: 'calcas' }),
  makeBackendCategory({ _id: 'cat-blusas', nome: 'Blusas', slug: 'blusas' }),
];

export const backendProducts = [
  makeBackendProduct({
    _id: 'prod-shirt',
    nome: 'Camiseta Minimal',
    preco: 149.9,
    cores: ['preto', 'branco'],
    tamanhos: ['P', 'M', 'G'],
    images: ['https://placehold.co/600x800?text=Camisa'],
    isFeatured: true,
    id_categoria: {
      _id: backendCategories[0]._id,
      nome: backendCategories[0].nome,
      slug: backendCategories[0].slug,
    },
  }),
  makeBackendProduct({
    _id: 'prod-jeans',
    nome: 'Calça Jeans Relax',
    preco: 229.9,
    cores: ['azul', 'preto'],
    tamanhos: ['P', 'M', 'G'],
    images: ['https://placehold.co/600x800?text=Calca'],
    isFeatured: true,
    id_categoria: {
      _id: backendCategories[1]._id,
      nome: backendCategories[1].nome,
      slug: backendCategories[1].slug,
    },
  }),
  makeBackendProduct({
    _id: 'prod-jacket',
    nome: 'Jaqueta Tech',
    preco: 319.9,
    cores: ['preto'],
    tamanhos: ['M', 'G'],
    images: ['https://placehold.co/600x800?text=Jaqueta'],
    id_categoria: {
      _id: backendCategories[2]._id,
      nome: backendCategories[2].nome,
      slug: backendCategories[2].slug,
    },
  }),
];

export const backendAccessories = [
  makeBackendAccessory({ _id: 'acc-bucket', nome: 'Bucket Hat', preco: 89.9 }),
  makeBackendAccessory({ _id: 'acc-cinto', nome: 'Cinto Minimal', preco: 59.9 }),
];

const paginateProducts = (page: number, limit: number) => {
  const start = (page - 1) * limit;
  const items = backendProducts.slice(start, start + limit);
  const total = backendProducts.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  return { items, total, totalPages };
};

export const handlers = [
  rest.get(`${API_BASE_URL}/categories`, (_req, res, ctx) => res(ctx.json(backendCategories))),

  rest.get(`${API_BASE_URL}/products`, (req, res, ctx) => {
    const page = Number(req.url.searchParams.get('page')) || 1;
    const limit = Number(req.url.searchParams.get('limit')) || backendProducts.length;
    const { items, total, totalPages } = paginateProducts(page, limit);

    return res(
      ctx.json({
        data: items,
        pagination: {
          page,
          limit,
          total,
          totalPages,
        },
      }),
    );
  }),

  rest.get(`${API_BASE_URL}/products/featured`, (_req, res, ctx) =>
    res(ctx.json(backendProducts.filter((product) => product.isFeatured))),
  ),

  rest.get(`${API_BASE_URL}/products/:id`, (req, res, ctx) => {
    const { id } = req.params as { id: string };
    const product = backendProducts.find((item) => item._id === id);
    if (!product) {
      return res(ctx.status(404), ctx.json({ message: 'Produto não encontrado' }));
    }
    return res(ctx.json(product));
  }),

  rest.get(`${API_BASE_URL}/accessories`, (_req, res, ctx) => res(ctx.json(backendAccessories))),

  rest.post(`${API_BASE_URL}/auth/login`, async (req, res, ctx) => {
    const body = (await req.json()) as { email?: string; senha?: string };

    if (body.email === 'admin@ufscompras.com' && body.senha === 'admin123') {
      return res(
        ctx.json({
          token: 'token-admin',
          user: {
            id: 'admin-1',
            nome: 'Admin',
            email: body.email,
            isAdmin: true,
          },
        }),
      );
    }

    if (body.email === 'cliente@ufscompras.com' && body.senha === 'cliente123') {
      return res(
        ctx.json({
          token: 'token-user',
          user: {
            id: 'user-1',
            nome: 'Cliente',
            email: body.email,
            isAdmin: false,
          },
        }),
      );
    }

    return res(ctx.status(401), ctx.json({ message: 'Credenciais inválidas' }));
  }),

  rest.post(`${API_BASE_URL}/purchase`, async (req, res, ctx) => {
    const body = (await req.json()) as { productId?: string; quantity?: number };
    if (!body.productId) {
      return res(ctx.status(400), ctx.json({ message: 'Produto é obrigatório' }));
    }
    if (!body.quantity || body.quantity < 1) {
      return res(ctx.status(400), ctx.json({ message: 'Quantidade inválida' }));
    }

    return res(
      ctx.json({
        message: 'Compra confirmada',
        estoque: Math.max(0, 10 - body.quantity),
      }),
    );
  }),
];


