import { Link } from 'react-router-dom';
import type { Product } from '../services/types';

type ProductCardProps = {
  product: Product;
};

const formatPrice = (price: number) =>
  price.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
  });

const ProductCard = ({ product }: ProductCardProps) => {
  const cover = product.images[0];

  return (
    <article className="flex h-full flex-col rounded-3xl bg-[#1f1c25] p-4 text-left shadow-xl shadow-black/20">
      <div className="relative mb-4 aspect-[3/4] overflow-hidden rounded-2xl bg-offwhite/10">
        {cover ? (
          <img src={cover.src} alt={cover.alt} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-offwhite/50">
            Sem imagem
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2">
        <p className="text-xs uppercase tracking-wide text-offwhite/50">{product.subcategory}</p>
        <h3 className="text-lg font-semibold leading-tight">{product.name}</h3>
        <p className="text-xl font-bold text-orange">{formatPrice(product.price)}</p>
        <Link
          to={`/produto/${product.id}`}
          className="mt-auto inline-flex items-center justify-center rounded-full border border-offwhite/30 px-4 py-2 text-sm font-semibold text-offwhite transition hover:border-offwhite"
        >
          Ver produto
        </Link>
      </div>
    </article>
  );
};

export default ProductCard;
