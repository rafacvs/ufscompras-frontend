import type { Accessory, Category, Product } from '../services/types';

let globalCounter = 0;
const nextId = (prefix: string) => `${prefix}-${++globalCounter}`;
const placeholderImage = () => `https://placehold.co/600x800?text=${nextId('img')}`;

export type BackendCategory = {
  _id: string;
  nome: string;
  slug: string;
  descricao?: string;
  image?: string;
  subcategorias?: string[];
};

export type BackendProduct = {
  _id: string;
  nome: string;
  preco: number;
  descricao?: string;
  tamanhos?: string[];
  cores?: string[];
  images?: string[];
  estoque?: number;
  isFeatured?: boolean;
  id_categoria?: {
    _id: string;
    nome: string;
    slug?: string;
  };
};

export type BackendAccessory = {
  _id: string;
  nome: string;
  descricao?: string;
  preco: number;
  images?: string[];
  ativo?: boolean;
};

export const makeBackendCategory = (overrides: Partial<BackendCategory> = {}): BackendCategory => ({
  _id: overrides._id ?? nextId('category'),
  nome: overrides.nome ?? 'Categoria destaque',
  slug: overrides.slug ?? `categoria-${globalCounter}`,
  descricao: overrides.descricao ?? 'Coleção disponível na loja.',
  image: overrides.image ?? placeholderImage(),
  subcategorias: overrides.subcategorias ?? [],
});

export const makeBackendProduct = (overrides: Partial<BackendProduct> = {}): BackendProduct => {
  const category =
    overrides.id_categoria ??
    ({
      _id: nextId('cat'),
      nome: 'Camisetas',
      slug: 'camisetas',
    } as BackendProduct['id_categoria']);

  return {
    _id: overrides._id ?? nextId('product'),
    nome: overrides.nome ?? 'Produto destaque',
    preco: overrides.preco ?? 199.9,
    descricao: overrides.descricao ?? 'Descrição completa do produto.',
    tamanhos: overrides.tamanhos ?? ['P', 'M', 'G'],
    cores: overrides.cores ?? ['preto', 'branco'],
    images: overrides.images ?? [placeholderImage()],
    estoque: overrides.estoque ?? 12,
    isFeatured: overrides.isFeatured ?? false,
    id_categoria: category,
  };
};

export const makeBackendAccessory = (overrides: Partial<BackendAccessory> = {}): BackendAccessory => ({
  _id: overrides._id ?? nextId('accessory'),
  nome: overrides.nome ?? 'Cinto minimalista',
  descricao: overrides.descricao ?? 'Ideal para complementar o look.',
  preco: overrides.preco ?? 59.9,
  images: overrides.images ?? [placeholderImage()],
  ativo: overrides.ativo ?? true,
});

export const makeCategory = (overrides: Partial<Category> = {}): Category => ({
  id: overrides.id ?? nextId('category'),
  slug: overrides.slug ?? `categoria-${globalCounter}`,
  title: overrides.title ?? 'Categoria destaque',
  description: overrides.description ?? 'Coleção disponível na loja.',
  image: overrides.image ?? placeholderImage(),
  subcategories: overrides.subcategories ?? [],
});

export const makeProduct = (overrides: Partial<Product> = {}): Product => ({
  id: overrides.id ?? nextId('product'),
  name: overrides.name ?? 'Produto destaque',
  price: overrides.price ?? 199.9,
  category: overrides.category ?? 'camisetas',
  categoryId: overrides.categoryId ?? nextId('category'),
  subcategory: overrides.subcategory ?? '',
  colors: overrides.colors ?? ['preto', 'branco'],
  sizes: overrides.sizes ?? ['P', 'M'],
  description: overrides.description ?? 'Descrição completa do produto.',
  images:
    overrides.images ??
    [
      {
        id: nextId('img'),
        alt: overrides.name ?? 'Produto destaque',
        src: placeholderImage(),
      },
    ],
});

export const makeAccessory = (overrides: Partial<Accessory> = {}): Accessory => ({
  id: overrides.id ?? nextId('accessory'),
  name: overrides.name ?? 'Cinto minimalista',
  description: overrides.description ?? 'Ideal para complementar o look.',
  price: overrides.price ?? 59.9,
  image: overrides.image ?? placeholderImage(),
});


