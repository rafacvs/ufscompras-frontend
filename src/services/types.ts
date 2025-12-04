export type ColorToken = {
  value: string;
  label: string;
  hex: string;
};

export type Size = 'XS' | 'P' | 'M' | 'G' | 'GG';
export type Color = string;

export type Category = {
  id: string;
  slug: string;
  title: string;
  description: string;
  image: string;
  subcategories: string[];
};

export type ProductImage = {
  id: string;
  src: string;
  alt: string;
};

export type Product = {
  id: string;
  name: string;
  price: number;
  category: string;
  categoryId?: string;
  subcategory: string;
  colors: Color[];
  sizes: Size[];
  description: string;
  images: ProductImage[];
};

export type ProductFilters = {
  category?: string;
  subcategory?: string;
  colors?: Color[];
  sizes?: Size[];
  priceMin?: number;
  priceMax?: number;
  page?: number;
  limit?: number;
  sort?: 'price-asc' | 'price-desc';
  search?: string;
  onlyFeatured?: boolean;
};

export type ProductListResponse = {
  items: Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export type Accessory = {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
};

export type CategoryDocument = {
  _id: string;
  nome: string;
  slug: string;
  descricao?: string;
  image?: string;
  subcategorias?: string[];
  updatedAt: string;
};

export type ProductDocument = {
  _id: string;
  nome: string;
  descricao?: string;
  preco: number;
  estoque: number;
  tamanhos: string[];
  cores: string[];
  images: string[];
  isFeatured: boolean;
  id_categoria: CategoryDocument;
  updatedAt: string;
};

export type AccessoryDocument = {
  _id: string;
  nome: string;
  descricao?: string;
  preco: number;
  images: string[];
  ativo: boolean;
  categorias: CategoryDocument[];
  updatedAt: string;
};

export type MovementDocument = {
  _id: string;
  tipo: 'Entrada' | 'Saida';
  quantidade: number;
  valor_unitario: number;
  observacao?: string;
  data_mov: string;
  id_produto: ProductDocument;
  id_user: {
    _id: string;
    nome: string;
    email: string;
  };
  acessorios?: Array<{
    _id: string;
    nome: string;
    preco: number;
  }>;
};

export type SalesReport = {
  totalUnits: number;
  totalRevenue: number;
  period: { from: string | null; to: string | null };
};

export type StockMovementReport = {
  Entrada: { totalUnits: number; totalValue: number };
  Saida: { totalUnits: number; totalValue: number };
};

export type TopProductReport = {
  produto: { id: string; nome: string };
  totalUnits: number;
  totalRevenue: number;
};

export const SIZE_ORDER: Size[] = ['XS', 'P', 'M', 'G', 'GG'];

export const COLOR_TOKENS: ColorToken[] = [
  { value: 'preto', label: 'Preto', hex: '#1F1B24' },
  { value: 'branco', label: 'Branco', hex: '#F4EEFF' },
  { value: 'vinho', label: 'Vinho', hex: '#5B2333' },
  { value: 'roxo', label: 'Roxo', hex: '#7250C7' },
];
