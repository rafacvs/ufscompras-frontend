import categoryJackets from '../assets/category-jackets.svg';
import categoryPants from '../assets/category-pants.svg';
import categoryShirts from '../assets/category-shirts.svg';
import productPlaceholder from '../assets/product-placeholder.svg';
import type {
  Accessory,
  AccessoryDocument,
  Category,
  CategoryDocument,
  Color,
  MovementDocument,
  Product,
  ProductDocument,
  ProductFilters,
  ProductListResponse,
  SalesReport,
  Size,
  StockMovementReport,
  TopProductReport,
} from './types';

type BackendCategory = {
  _id: string;
  nome: string;
  slug: string;
  descricao?: string;
  image?: string;
  subcategorias?: string[];
};

type BackendProductSummary = {
  _id: string;
  nome: string;
  preco: number;
  descricao?: string;
  tamanhos?: string[];
  cores?: string[];
  images?: string[];
  isFeatured?: boolean;
  estoque?: number;
  id_categoria?: {
    _id: string;
    nome: string;
    slug?: string;
  };
};

type BackendProductDetail = BackendProductSummary;

type BackendProductListResponse = {
  data: BackendProductSummary[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

type BackendAccessory = {
  _id: string;
  nome: string;
  descricao?: string;
  preco: number;
  images?: string[];
  ativo?: boolean;
};

type GetAccessoriesOptions = {
  categoryId?: string;
};

type CategoryCache = {
  list?: Category[];
  slugToId: Map<string, string>;
};

const { VITE_API_URL } = import.meta.env as { VITE_API_URL?: string };
export const API_BASE_URL = (VITE_API_URL ?? 'http://localhost:5000/api').replace(/\/$/, '');
const allowedSizes: Size[] = ['XS', 'P', 'M', 'G', 'GG'];

const categoryCache: CategoryCache = {
  slugToId: new Map(),
};

let categoriesPromise: Promise<Category[]> | undefined;

const categoryImageFallback = (slug: string) => {
  if (slug === 'camisetas') return categoryShirts;
  if (slug === 'calcas') return categoryPants;
  if (slug === 'blusas') return categoryJackets;
  return productPlaceholder;
};

const request = async <T>(path: string, init?: RequestInit): Promise<T> => {
  const url = `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
  const response = await fetch(url, init);

  if (!response.ok) {
    throw new Error(`Erro ao buscar ${url}: ${response.status} ${response.statusText}`);
  }

  return response.json() as Promise<T>;
};

const normalizeColor = (value?: string): Color | undefined => {
  if (!value) return undefined;
  return value.trim().toLowerCase();
};

const normalizeSize = (value?: string): Size | undefined => {
  if (!value) return undefined;
  const normalized = value.trim().toUpperCase();
  return allowedSizes.includes(normalized as Size) ? (normalized as Size) : undefined;
};

const sortByPrice = (list: Product[], sort?: ProductFilters['sort']) => {
  if (!sort) return list;
  return [...list].sort((a, b) => (sort === 'price-asc' ? a.price - b.price : b.price - a.price));
};

const buildImages = (backendProduct: BackendProductSummary) => {
  if (backendProduct.images?.length) {
    return backendProduct.images.map((src, index) => ({
      id: `${backendProduct._id}-${index}`,
      src,
      alt: backendProduct.nome,
    }));
  }
  return [{ id: 'placeholder', src: productPlaceholder, alt: backendProduct.nome }];
};

const toProduct = (backendProduct: BackendProductSummary, slug: string): Product => {
  const colors = (backendProduct.cores ?? [])
    .map((color) => normalizeColor(color))
    .filter((color): color is Color => Boolean(color));
  const sizes = (backendProduct.tamanhos ?? [])
    .map((size) => normalizeSize(size))
    .filter((size): size is Size => Boolean(size));

  return {
    id: backendProduct._id,
    name: backendProduct.nome,
    price: backendProduct.preco,
    category: slug,
    categoryId: backendProduct.id_categoria?._id,
    subcategory: '',
    description: backendProduct.descricao ?? '',
    colors,
    sizes,
    images: buildImages(backendProduct),
  };
};

const applyFilters = (list: Product[], filters: ProductFilters): Product[] => {
  const { subcategory, colors, sizes, priceMin, priceMax } = filters;

  return list.filter((product) => {
    if (subcategory && product.subcategory !== subcategory) return false;
    if (colors?.length && !colors.some((color) => product.colors.includes(color))) return false;
    if (sizes?.length && !sizes.some((size) => product.sizes.includes(size))) return false;
    if (typeof priceMin === 'number' && product.price < priceMin) return false;
    if (typeof priceMax === 'number' && product.price > priceMax) return false;
    return true;
  });
};

const loadCategories = async (): Promise<Category[]> => {
  if (!categoriesPromise) {
    categoriesPromise = request<BackendCategory[]>('/categories').then((backendCategories) => {
      const mapped = backendCategories.map((category) => {
        const normalized: Category = {
          id: category._id,
          slug: category.slug,
          title: category.nome,
          description: category.descricao ?? 'Coleção disponível na loja.',
          image: category.image || categoryImageFallback(category.slug),
          subcategories: category.subcategorias ?? [],
        };
        categoryCache.slugToId.set(category.slug, category._id);
        return normalized;
      });
      categoryCache.list = mapped;
      return mapped;
    });
  }

  return categoriesPromise;
};

const getCategoryIdBySlug = async (slug: string): Promise<string | undefined> => {
  await loadCategories();
  return categoryCache.slugToId.get(slug);
};

export const getCategories = async (): Promise<Category[]> => loadCategories();

export const getCategoryBySlug = async (slug: string): Promise<Category | undefined> => {
  const categories = await loadCategories();
  return categories.find((category) => category.slug === slug);
};

const toAccessory = (accessory: BackendAccessory): Accessory => ({
  id: accessory._id,
  name: accessory.nome,
  description: accessory.descricao ?? '',
  price: accessory.preco,
  image: accessory.images?.[0] ?? productPlaceholder,
});

const buildProductsQuery = async (filters: ProductFilters) => {
  const params = new URLSearchParams();
  let resolvedCategorySlug: string | undefined;

  if (filters.category) {
    resolvedCategorySlug = filters.category;
    const categoryId = await getCategoryIdBySlug(filters.category);
    if (categoryId) {
      params.set('category', categoryId);
    }
  }

  if (filters.colors?.length) params.set('colors', filters.colors.join(','));
  if (filters.sizes?.length) params.set('sizes', filters.sizes.join(','));
  if (typeof filters.priceMin === 'number') params.set('priceMin', String(filters.priceMin));
  if (typeof filters.priceMax === 'number') params.set('priceMax', String(filters.priceMax));
  if (filters.page) params.set('page', String(filters.page));
  if (filters.limit) params.set('limit', String(filters.limit));
  if (filters.sort) params.set('sort', filters.sort);
  if (filters.search) params.set('search', filters.search);
  if (filters.onlyFeatured) params.set('featured', 'true');

  return { params, resolvedCategorySlug };
};

export const getProducts = async (filters: ProductFilters = {}): Promise<ProductListResponse> => {
  const { params, resolvedCategorySlug } = await buildProductsQuery(filters);
  const queryString = params.toString();
  const response = await request<BackendProductListResponse>(`/products${queryString ? `?${queryString}` : ''}`);

  const items = response.data.map((backendProduct) => {
    const slug =
      resolvedCategorySlug ??
      backendProduct.id_categoria?.slug ??
      backendProduct.id_categoria?.nome ??
      'sem-categoria';
    if (backendProduct.id_categoria?.slug) {
      categoryCache.slugToId.set(backendProduct.id_categoria.slug, backendProduct.id_categoria._id);
    }
    return toProduct(backendProduct, slug);
  });

  const filtered = applyFilters(items, filters);
  return {
    items: sortByPrice(filtered, filters.sort),
    pagination: response.pagination,
  };
};

export const getProductById = async (id: string): Promise<Product | undefined> => {
  if (!id) return undefined;

  const backendProduct = await request<BackendProductDetail>(`/products/${id}`);
  const slugFromBackend = backendProduct.id_categoria?.slug ?? backendProduct.id_categoria?.nome;

  if (backendProduct.id_categoria?.slug) {
    categoryCache.slugToId.set(backendProduct.id_categoria.slug, backendProduct.id_categoria._id);
  }

  return toProduct(backendProduct, slugFromBackend ?? 'sem-categoria');
};

export const getFeaturedProducts = async (limit = 8): Promise<Product[]> => {
  const backendProducts = await request<BackendProductDetail[]>(`/products/featured?limit=${limit}`);
  return backendProducts.map((product) => {
    const slug = product.id_categoria?.slug ?? product.id_categoria?.nome ?? 'sem-categoria';
    if (product.id_categoria?.slug) {
      categoryCache.slugToId.set(product.id_categoria.slug, product.id_categoria._id);
    }
    return toProduct(product, slug);
  });
};

export const getAccessories = async (options: GetAccessoriesOptions = {}): Promise<Accessory[]> => {
  const params = new URLSearchParams();
  if (options.categoryId) {
    params.set('category', options.categoryId);
  }
  const queryString = params.toString();
  const accessories = await request<BackendAccessory[]>(`/accessories${queryString ? `?${queryString}` : ''}`);
  return accessories.map(toAccessory);
};

// Admin helpers ---------------------------------------------------------------

const authRequest = async <T>(token: string, path: string, init?: RequestInit): Promise<T> => {
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
    ...(init?.headers ?? {}),
  };
  return request<T>(path, { ...init, headers });
};

export const adminApi = {
  // categorias
  listCategories: (token: string) => authRequest<CategoryDocument[]>(token, '/categories'),
  createCategory: (token: string, data: { nome: string; slug?: string }) =>
    authRequest<CategoryDocument>(token, '/categories', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateCategory: (token: string, id: string, data: { nome?: string; slug?: string }) =>
    authRequest<CategoryDocument>(token, `/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteCategory: (token: string, id: string) =>
    authRequest<void>(token, `/categories/${id}`, { method: 'DELETE' }),

  // produtos
  listProducts: (token: string, params: Record<string, string | number | undefined> = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value === undefined || value === null) return;
      query.set(key, String(value));
    });
    const suffix = query.toString() ? `?${query.toString()}` : '';
    return authRequest<{ data: ProductDocument[]; pagination: ProductListResponse['pagination'] }>(
      token,
      `/products${suffix}`,
    );
  },
  createProduct: (token: string, data: Record<string, unknown>) =>
    authRequest<ProductDocument>(token, '/products', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateProduct: (token: string, id: string, data: Record<string, unknown>) =>
    authRequest<ProductDocument>(token, `/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteProduct: (token: string, id: string) =>
    authRequest<void>(token, `/products/${id}`, { method: 'DELETE' }),

  // acessórios
  listAccessories: (token: string) => authRequest<AccessoryDocument[]>(token, '/accessories?ativo=all'),
  createAccessory: (token: string, data: Record<string, unknown>) =>
    authRequest<AccessoryDocument>(token, '/accessories', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateAccessory: (token: string, id: string, data: Record<string, unknown>) =>
    authRequest<AccessoryDocument>(token, `/accessories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteAccessory: (token: string, id: string) =>
    authRequest<void>(token, `/accessories/${id}`, { method: 'DELETE' }),

  // movimentos
  listMovements: (token: string, params: { from?: string; to?: string; tipo?: string; produto?: string }) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value) query.set(key, value);
    });
    const suffix = query.toString() ? `?${query.toString()}` : '';
    return authRequest<MovementDocument[]>(token, `/movements${suffix}`);
  },
  createMovement: (
    token: string,
    data: { tipo: 'Entrada' | 'Saida'; quantidade: number; valor_unitario: number; observacao?: string; id_produto: string },
  ) =>
    authRequest<MovementDocument>(token, '/movements', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // relatórios
  getSalesReport: (token: string, params: { from?: string; to?: string } = {}) => {
    const query = new URLSearchParams();
    if (params.from) query.set('from', params.from);
    if (params.to) query.set('to', params.to);
    const suffix = query.toString() ? `?${query.toString()}` : '';
    return authRequest<SalesReport>(token, `/reports/sales${suffix}`);
  },
  getStockReport: (token: string, params: { from?: string; to?: string } = {}) => {
    const query = new URLSearchParams();
    if (params.from) query.set('from', params.from);
    if (params.to) query.set('to', params.to);
    const suffix = query.toString() ? `?${query.toString()}` : '';
    return authRequest<StockMovementReport>(token, `/reports/stock-movements${suffix}`);
  },
  getTopProducts: (token: string, params: { from?: string; to?: string; limit?: number } = {}) => {
    const query = new URLSearchParams();
    if (params.from) query.set('from', params.from);
    if (params.to) query.set('to', params.to);
    if (typeof params.limit === 'number') query.set('limit', String(params.limit));
    const suffix = query.toString() ? `?${query.toString()}` : '';
    return authRequest<TopProductReport[]>(token, `/reports/top-products${suffix}`);
  },
};
