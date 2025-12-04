import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { getCategories, getProducts } from '../services/api';
import type { Category, Product } from '../services/types';

const DEFAULT_LIMIT = 12;

const ProductCatalogPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: DEFAULT_LIMIT,
    total: 0,
    totalPages: 1,
  });

  const page = useMemo(() => {
    const parsed = Number(searchParams.get('page'));
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
  }, [searchParams]);

  const sort = (searchParams.get('ordem') as 'price-asc' | 'price-desc') ?? 'price-asc';
  const search = searchParams.get('busca') ?? '';
  const categorySlug = searchParams.get('categoria') ?? undefined;

  useEffect(() => {
    let mounted = true;
    getCategories()
      .then((data) => {
        if (!mounted) return;
        setCategories(data);
      })
      .catch(() => {
        /* ignore */
      });
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;
    setIsLoading(true);
    setHasError(false);

    getProducts({
      category: categorySlug,
      search: search || undefined,
      sort,
      page,
      limit: DEFAULT_LIMIT,
    })
      .then((result) => {
        if (!mounted) return;
        setProducts(result.items);
        setPagination(result.pagination);
      })
      .catch(() => {
        if (!mounted) return;
        setProducts([]);
        setPagination((prev) => ({ ...prev, total: 0, totalPages: 1 }));
        setHasError(true);
      })
      .finally(() => {
        if (!mounted) return;
        setIsLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [categorySlug, search, sort, page]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const params = new URLSearchParams(searchParams);
    params.set('busca', event.target.value);
    params.set('page', '1');
    setSearchParams(params, { replace: true });
  };

  const handleSortChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const params = new URLSearchParams(searchParams);
    params.set('ordem', event.target.value);
    setSearchParams(params, { replace: true });
  };

  const handleCategoryChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const params = new URLSearchParams(searchParams);
    const value = event.target.value;
    if (value) {
      params.set('categoria', value);
    } else {
      params.delete('categoria');
    }
    params.set('page', '1');
    setSearchParams(params, { replace: true });
  };

  const handlePageChange = (nextPage: number) => {
    if (nextPage < 1 || nextPage > pagination.totalPages) return;
    const params = new URLSearchParams(searchParams);
    params.set('page', String(nextPage));
    setSearchParams(params, { replace: true });
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <header className="space-y-4">
        <p className="text-sm uppercase tracking-[0.3em] text-offwhite/60">Catálogo completo</p>
        <h1 className="text-3xl font-bold">Todas as peças</h1>
        <p className="text-offwhite/70">
          Explore camisetas, calças, blusas e acessórios em um só lugar. Use os filtros para encontrar o que precisa.
        </p>

        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <input
            type="search"
            value={search}
            onChange={handleSearchChange}
            placeholder="Buscar por nome..."
            className="flex-1 rounded-full border border-offwhite/20 bg-dark px-4 py-2 text-sm text-offwhite focus:border-purple focus:outline-none"
          />

          <select
            value={categorySlug ?? ''}
            onChange={handleCategoryChange}
            className="rounded-full border border-offwhite/20 bg-dark px-4 py-2 text-sm text-offwhite focus:border-purple focus:outline-none"
          >
            <option value="">Todas as categorias</option>
            {categories.map((category) => (
              <option key={category.slug} value={category.slug}>
                {category.title}
              </option>
            ))}
          </select>

          <select
            value={sort}
            onChange={handleSortChange}
            className="rounded-full border border-offwhite/20 bg-dark px-4 py-2 text-sm text-offwhite focus:border-purple focus:outline-none"
          >
            <option value="price-asc">Preço: menor ao maior</option>
            <option value="price-desc">Preço: maior ao menor</option>
            <option value="name-asc">Nome: A-Z</option>
            <option value="name-desc">Nome: Z-A</option>
          </select>
        </div>
      </header>

      <section className="mt-10">
        {hasError ? (
          <div className="rounded-3xl bg-[#1f1c25] p-10 text-center text-offwhite/70">
            Não foi possível carregar os produtos. Tente novamente.
          </div>
        ) : isLoading ? (
          <div className="rounded-3xl bg-[#1f1c25] p-10 text-center text-offwhite/70">Carregando produtos...</div>
        ) : products.length === 0 ? (
          <div className="rounded-3xl bg-[#1f1c25] p-10 text-center text-offwhite/70">Nenhum produto encontrado.</div>
        ) : (
          <>
            <div className="mb-4 text-sm text-offwhite/70">
              Exibindo {(pagination.page - 1) * pagination.limit + 1}-
              {Math.min(pagination.page * pagination.limit, pagination.total)} de {pagination.total} itens
            </div>
            <div className="grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
            {pagination.totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-4">
                <button
                  type="button"
                  onClick={() => handlePageChange(pagination.page - 1)}
                  className="rounded-full border border-offwhite/20 px-4 py-2 text-sm text-offwhite disabled:opacity-40"
                  disabled={pagination.page === 1}
                >
                  Anterior
                </button>
                <span className="text-sm text-offwhite/70">
                  Página {pagination.page} de {pagination.totalPages}
                </span>
                <button
                  type="button"
                  onClick={() => handlePageChange(pagination.page + 1)}
                  className="rounded-full border border-offwhite/20 px-4 py-2 text-sm text-offwhite disabled:opacity-40"
                  disabled={pagination.page === pagination.totalPages}
                >
                  Próxima
                </button>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
};

export default ProductCatalogPage;

