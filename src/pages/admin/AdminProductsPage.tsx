import { useCallback, useEffect, useState } from 'react';
import ChipInput from '../../components/admin/ChipInput';
import Modal from '../../components/admin/Modal';
import Table from '../../components/admin/Table';
import CategorySelect from '../../components/admin/CategorySelect';
import { useAuth } from '../../context/AuthContext';
import { adminApi } from '../../services/api';
import type { CategoryDocument, ProductDocument } from '../../services/types';

const DEFAULT_LIMIT = 10;

type ProductFormState = {
  id?: string;
  nome: string;
  descricao: string;
  preco: number;
  estoque: number;
  tamanhos: string[];
  cores: string[];
  images: string[];
  isFeatured: boolean;
  categoriaId?: string;
};

const emptyForm: ProductFormState = {
  nome: '',
  descricao: '',
  preco: 0,
  estoque: 0,
  tamanhos: [],
  cores: [],
  images: [],
  isFeatured: false,
  categoriaId: undefined,
};

const AdminProductsPage = () => {
  const { token } = useAuth();
  const [products, setProducts] = useState<ProductDocument[]>([]);
  const [categories, setCategories] = useState<CategoryDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<'createdAt' | 'price-asc' | 'price-desc' | 'name-asc' | 'name-desc'>('createdAt');
  const [totalPages, setTotalPages] = useState(1);
  const [formState, setFormState] = useState<ProductFormState>(emptyForm);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [notification, setNotification] = useState('');

  const loadProducts = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    setError('');
    try {
      const response = await adminApi.listProducts(token, {
        page,
        limit: DEFAULT_LIMIT,
        sort,
        search,
      });
      setProducts(response.data);
      setTotalPages(response.pagination.totalPages);
    } catch (err) {
      setError((err as Error).message ?? 'Erro ao carregar produtos');
    } finally {
      setIsLoading(false);
    }
  }, [token, page, sort, search]);

  useEffect(() => {
    void loadProducts();
  }, [loadProducts]);

  useEffect(() => {
    if (!token) return;
    adminApi
      .listCategories(token)
      .then((data) => setCategories(data))
      .catch(() => setCategories([]));
  }, [token]);

  const openModal = (product?: ProductDocument) => {
    if (product) {
      setFormState({
        id: product._id,
        nome: product.nome,
        descricao: product.descricao ?? '',
        preco: product.preco,
        estoque: product.estoque,
        tamanhos: product.tamanhos ?? [],
        cores: product.cores ?? [],
        images: product.images ?? [],
        isFeatured: product.isFeatured,
        categoriaId: product.id_categoria?._id,
      });
    } else {
      setFormState(emptyForm);
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async () => {
    if (!token) return;
    if (!formState.categoriaId) {
      setNotification('Selecione uma categoria');
      return;
    }
    setSubmitting(true);
    setNotification('');
    try {
      const payload = {
        nome: formState.nome,
        descricao: formState.descricao,
        preco: Number(formState.preco),
        estoque: Number(formState.estoque),
        tamanhos: formState.tamanhos,
        cores: formState.cores,
        images: formState.images,
        isFeatured: formState.isFeatured,
        id_categoria: formState.categoriaId,
      };
      if (formState.id) {
        await adminApi.updateProduct(token, formState.id, payload);
        setNotification('Produto atualizado com sucesso');
      } else {
        await adminApi.createProduct(token, payload);
        setNotification('Produto criado com sucesso');
      }
      setIsModalOpen(false);
      setFormState(emptyForm);
      void loadProducts();
    } catch (err) {
      setNotification((err as Error).message ?? 'Erro ao salvar produto');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!token) return;
    if (!confirm('Deseja realmente remover este produto?')) return;
    try {
      await adminApi.deleteProduct(token, id);
      setNotification('Produto removido');
      void loadProducts();
    } catch (err) {
      setNotification((err as Error).message ?? 'Erro ao remover produto');
    }
  };

  const columns = [
    { header: 'Nome', key: 'nome' },
    { header: 'Categoria', render: (product: ProductDocument) => product.id_categoria?.nome ?? '-' },
    {
      header: 'Preço',
      render: (product: ProductDocument) =>
        product.preco.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
    },
    { header: 'Estoque', key: 'estoque' },
    { header: 'Destaque', render: (product: ProductDocument) => (product.isFeatured ? 'Sim' : 'Não') },
    { header: 'Atualizado', render: (product: ProductDocument) => new Date(product.updatedAt).toLocaleDateString('pt-BR') },
    {
      header: 'Ações',
      render: (product: ProductDocument) => (
        <div className="flex gap-2">
          <button className="text-xs text-purple" onClick={() => openModal(product)}>
            Editar
          </button>
          <button
            className="text-xs text-orange"
            onClick={() => {
              void handleDelete(product._id);
            }}
          >
            Remover
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Produtos</h2>
          <p className="text-sm text-offwhite/70">Gerencie o catálogo completo da loja.</p>
        </div>
        <button
          type="button"
          onClick={() => openModal()}
          className="rounded-full bg-purple px-5 py-2 text-sm font-semibold text-offwhite shadow"
        >
          Novo produto
        </button>
      </header>

      <div className="rounded-2xl bg-[#1f1c25] p-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <input
            type="search"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            placeholder="Buscar por nome..."
            className="flex-1 rounded-full border border-offwhite/20 bg-dark px-4 py-2 text-sm text-offwhite"
          />
          <select
            value={sort}
            onChange={(event) => setSort(event.target.value as typeof sort)}
            className="rounded-full border border-offwhite/20 bg-dark px-4 py-2 text-sm text-offwhite"
          >
            <option value="createdAt">Mais recentes</option>
            <option value="price-asc">Preço: menor ao maior</option>
            <option value="price-desc">Preço: maior ao menor</option>
            <option value="name-asc">Nome: A-Z</option>
            <option value="name-desc">Nome: Z-A</option>
          </select>
        </div>

        {error && <p className="mt-4 text-sm text-orange">{error}</p>}

        {isLoading ? (
          <div className="mt-4 rounded-2xl bg-[#14121a] p-6 text-center text-sm text-offwhite/70">Carregando...</div>
        ) : (
          <Table columns={columns} data={products} className="mt-4" />
        )}

        <div className="mt-4 flex items-center justify-center gap-3 text-sm text-offwhite/70">
          <button
            type="button"
            className="rounded-full border border-offwhite/20 px-3 py-1 disabled:opacity-40"
            disabled={page === 1}
            onClick={() => setPage((prev) => Math.max(1, prev - 1))}
          >
            Anterior
          </button>
          <span>
            Página {page} de {totalPages}
          </span>
          <button
            type="button"
            className="rounded-full border border-offwhite/20 px-3 py-1 disabled:opacity-40"
            disabled={page === totalPages}
            onClick={() => setPage((prev) => prev + 1)}
          >
            Próxima
          </button>
        </div>
      </div>

      <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)} title={formState.id ? 'Editar produto' : 'Novo produto'}>
        <div className="flex flex-col gap-4 text-sm">
          <label className="block">
            <span className="text-offwhite/70">Nome</span>
            <input
              type="text"
              value={formState.nome}
              onChange={(event) => setFormState((prev) => ({ ...prev, nome: event.target.value }))}
              className="mt-2 w-full rounded-2xl border border-offwhite/20 bg-[#14121a] px-4 py-2 text-offwhite"
            />
          </label>
          <label className="block">
            <span className="text-offwhite/70">Descrição</span>
            <textarea
              value={formState.descricao}
              onChange={(event) => setFormState((prev) => ({ ...prev, descricao: event.target.value }))}
              className="mt-2 w-full rounded-2xl border border-offwhite/20 bg-[#14121a] px-4 py-2 text-offwhite"
            />
          </label>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="text-offwhite/70">Preço</span>
              <input
                type="number"
                value={formState.preco}
                onChange={(event) => setFormState((prev) => ({ ...prev, preco: Number(event.target.value) }))}
                className="mt-2 w-full rounded-2xl border border-offwhite/20 bg-[#14121a] px-4 py-2 text-offwhite"
              />
            </label>
            <label className="block">
              <span className="text-offwhite/70">Estoque</span>
              <input
                type="number"
                value={formState.estoque}
                onChange={(event) => setFormState((prev) => ({ ...prev, estoque: Number(event.target.value) }))}
                className="mt-2 w-full rounded-2xl border border-offwhite/20 bg-[#14121a] px-4 py-2 text-offwhite"
              />
            </label>
          </div>
          <CategorySelect
            label="Categoria"
            value={formState.categoriaId}
            onChange={(value) => setFormState((prev) => ({ ...prev, categoriaId: value }))}
            options={categories.map((category) => ({ value: category._id, label: category.nome }))}
            disabled={!categories.length}
          />
          <div className="grid gap-4 md:grid-cols-2">
            <ChipInput
              label="Tamanhos"
              values={formState.tamanhos}
              onChange={(values) => setFormState((prev) => ({ ...prev, tamanhos: values }))}
              helperText="Ex: P, M, G, GG"
            />
            <ChipInput
              label="Cores"
              values={formState.cores}
              onChange={(values) => setFormState((prev) => ({ ...prev, cores: values }))}
              helperText="Ex: preto, branco"
            />
          </div>
          <ChipInput
            label="Imagens (URLs)"
            values={formState.images}
            onChange={(values) => setFormState((prev) => ({ ...prev, images: values }))}
          />
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={formState.isFeatured}
              onChange={(event) => setFormState((prev) => ({ ...prev, isFeatured: event.target.checked }))}
            />
            Destacar na vitrine
          </label>
          {notification && <p className="text-sm text-orange">{notification}</p>}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="rounded-full border border-offwhite/20 px-4 py-2 text-sm text-offwhite/70"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={() => {
                void handleSubmit();
              }}
              disabled={submitting}
              className="rounded-full bg-purple px-5 py-2 text-sm font-semibold text-offwhite disabled:opacity-50"
            >
              {submitting ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AdminProductsPage;

