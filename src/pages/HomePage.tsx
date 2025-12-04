import { useEffect, useState } from 'react';
import Carousel, { type Slide } from '../components/Carousel/Carousel';
import CategoryPill from '../components/CategoryPill';
import ProductCard from '../components/ProductCard';
import productPlaceholder from '../assets/product-placeholder.svg';
import { getCategories, getFeaturedProducts } from '../services/api';
import type { Category, Product } from '../services/types';

const heroSlides: Slide[] = [
  {
    id: 'slide-1',
    subtitle: 'Minimalista & Elegante',
    title: 'Prático, rápido e feito para você.',
    description: 'Coleções selecionadas com o estilo universitário perfeito para qualquer ocasião.',
    ctaLabel: 'Cadastre-se',
    image:
      'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'slide-2',
    subtitle: 'Coleções Exclusivas',
    title: 'Looks completos em poucos cliques.',
    description: 'Combine camisetas, calças e jaquetas com curadoria especial para o campus.',
    ctaLabel: 'Ver novidades',
    image:
      'https://images.unsplash.com/photo-1503341455253-b2e723bb3dbb?auto=format&fit=crop&w=400&q=80',
  },
];

const HomePage = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [isFeaturedLoading, setIsFeaturedLoading] = useState(true);
  const [featuredError, setFeaturedError] = useState(false);

  useEffect(() => {
    let isMounted = true;
    getCategories()
      .then((data) => {
        if (!isMounted) return;
        setCategories(data);
      })
      .catch(() => {
        if (!isMounted) return;
        setHasError(true);
      })
      .finally(() => {
        if (!isMounted) return;
        setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;
    getFeaturedProducts()
      .then((data) => {
        if (!isMounted) return;
        setFeaturedProducts(data);
      })
      .catch(() => {
        if (!isMounted) return;
        setFeaturedError(true);
      })
      .finally(() => {
        if (!isMounted) return;
        setIsFeaturedLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const heroCategories = categories.slice(0, 3);

  const highlightCards = [
    {
      slug: 'vitrine',
      title: 'Vitrine',
      image: productPlaceholder,
      to: '/produtos?vitrine=1',
    },
    ...heroCategories.map((category) => ({
      slug: category.slug,
      title: category.title,
      image: category.image,
      to: `/categoria/${category.slug}`,
    })),
  ];

  return (
    <div className="flex flex-col gap-12 pb-10">
      <section className="-mx-4 w-screen max-w-none self-center md:-mx-8">
        <Carousel slides={heroSlides} autoPlay={7000} />
      </section>

      <section className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 py-10 text-center">
        {isLoading ? (
          <p className="text-offwhite/70">Carregando categorias...</p>
        ) : hasError ? (
          <p className="text-offwhite/70">Não foi possível carregar as categorias.</p>
        ) : (
          <div className="grid grid-cols-1 gap-10 md:block">
            {highlightCards.map((card, index) => (
              <CategoryPill
                key={card.slug}
                title={card.title}
                image={card.image}
                to={card.to}
                className={
                  index === 0
                    ? 'md:inline-flex md:-mr-12 md:z-30'
                    : index === 1
                    ? 'md:inline-flex md:-ml-12 md:-mr-12 md:z-20'
                    : index === 2
                    ? 'md:inline-flex md:-ml-12 md:z-10'
                    : 'md:inline-flex md:-ml-12 md:z-0'
                }
              />
            ))}
          </div>
        )}
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 py-10">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-offwhite/60">Vitrine</p>
            <h2 className="text-2xl font-bold">Seleção destacada</h2>
          </div>
          <p className="text-offwhite/70 text-sm">
            {isFeaturedLoading
              ? 'Carregando...'
              : featuredError
              ? 'Não foi possível carregar os destaques.'
              : `${featuredProducts.length} produto${featuredProducts.length === 1 ? '' : 's'} selecionados`}
          </p>
        </div>
        <div className="mt-6">
          {featuredError ? (
            <div className="rounded-3xl bg-[#1f1c25] p-8 text-center text-offwhite/70">
              Não foi possível carregar os produtos em destaque. Tente novamente mais tarde.
            </div>
          ) : isFeaturedLoading ? (
            <div className="rounded-3xl bg-[#1f1c25] p-8 text-center text-offwhite/70">Carregando produtos...</div>
          ) : featuredProducts.length === 0 ? (
            <div className="rounded-3xl bg-[#1f1c25] p-8 text-center text-offwhite/70">
              Nenhum produto em destaque no momento.
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-4">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default HomePage;
