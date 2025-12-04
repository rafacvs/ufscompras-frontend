import clsx from 'clsx';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import QuantityInput from '../components/QuantityInput';
import { getAccessories, getProductById } from '../services/api';
import { purchaseProduct } from '../services/orders';
import { useAuth } from '../context/AuthContext';
import {
  COLOR_TOKENS,
  SIZE_ORDER,
  type Accessory,
  type Product,
  type Size,
} from '../services/types';

const formatPrice = (price: number) =>
  price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 2 });

const ProductPage = () => {
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated, token } = useAuth();
  const [product, setProduct] = useState<Product | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState<string | undefined>();
  const [selectedSize, setSelectedSize] = useState<Size | undefined>();
  const [quantity, setQuantity] = useState(1);
  const [accessories, setAccessories] = useState<Accessory[]>([]);
  const [selectedAccessories, setSelectedAccessories] = useState<string[]>([]);
  const [isAccessoriesLoading, setIsAccessoriesLoading] = useState(true);
  const [accessoriesError, setAccessoriesError] = useState(false);

  useEffect(() => {
    if (!id) {
      setProduct(undefined);
      setIsLoading(false);
      return;
    }

    let isMounted = true;
    setIsLoading(true);
    setHasError(false);

    getProductById(id)
      .then((data) => {
        if (!isMounted) return;
        setProduct(data);
      })
      .catch(() => {
        if (!isMounted) return;
        setProduct(undefined);
        setHasError(true);
      })
      .finally(() => {
        if (!isMounted) return;
        setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [id]);

  useEffect(() => {
    if (!product) return;
    setSelectedImageIndex(0);
    setSelectedColor(product.colors[0]);
    setSelectedSize(product.sizes[0]);
    setQuantity(1);
    setSelectedAccessories([]);
  }, [product]);

  useEffect(() => {
    if (!product) return;

    let isMounted = true;
    setIsAccessoriesLoading(true);
    setAccessoriesError(false);

    const accessoriesParams = product.categoryId ? { categoryId: product.categoryId } : {};

    getAccessories(accessoriesParams)
      .then((data) => {
        if (!isMounted) return;
        setAccessories(data);
      })
      .catch(() => {
        if (!isMounted) return;
        setAccessories([]);
        setAccessoriesError(true);
      })
      .finally(() => {
        if (!isMounted) return;
        setIsAccessoriesLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [product?.id, product?.categoryId]);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10 text-center">
        <p className="text-lg font-semibold text-offwhite/70">Carregando produto...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10 text-center">
        <p className="text-lg font-semibold text-offwhite/70">
          {hasError ? 'Não foi possível carregar o produto.' : 'Produto não encontrado.'}
        </p>
      </div>
    );
  }

  const images = product.images.length ? product.images : [{ id: 'placeholder', src: '', alt: product.name }];
  const activeImage = images[selectedImageIndex] ?? images[0];

  const colorTokens = product.colors.map((color) => {
    const preset = COLOR_TOKENS.find((token) => token.value === color);
    if (preset) return preset;
    const isHex = color.startsWith('#') && (color.length === 7 || color.length === 4);
    return {
      value: color,
      label: color,
      hex: isHex ? color : '#4B4B4B',
    };
  });
  const availableSizes = SIZE_ORDER.filter((size) => product.sizes.includes(size));

  const accessoriesTotal = selectedAccessories.reduce((total, accessoryId) => {
    const accessory = accessories.find((item) => item.id === accessoryId);
    return accessory ? total + accessory.price : total;
  }, 0);

  const totalPrice = product.price * quantity + accessoriesTotal;

  const handlePurchase = async () => {
    if (!product) return;
    if (!isAuthenticated || !token) {
      window.location.href = `/login?from=${encodeURIComponent(window.location.pathname)}`;
      return;
    }
    try {
      await purchaseProduct(token, product.id, quantity, selectedAccessories);
      alert('Compra confirmada! Obrigado.');
    } catch (error) {
      alert((error as Error).message ?? 'Falha ao comprar');
    }
  };

  const handleAccessoryToggle = (accessoryId: string) => {
    setSelectedAccessories((prev) =>
      prev.includes(accessoryId) ? prev.filter((id) => id !== accessoryId) : [...prev, accessoryId],
    );
  };

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-10">
      <div className="grid gap-6 lg:grid-cols-[96px,minmax(0,1fr),360px]">
        <div className="flex flex-row gap-3 overflow-x-auto lg:flex-col">
          {images.map((image, index) => (
            <button
              type="button"
              key={image.id}
              onClick={() => setSelectedImageIndex(index)}
              className={clsx(
                'aspect-[4/5] w-20 overflow-hidden rounded-xl border transition lg:w-full',
                selectedImageIndex === index ? 'border-purple' : 'border-transparent',
              )}
            >
              {image.src ? (
                <img src={image.src} alt={image.alt} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center text-xs text-offwhite/50">Imagem</div>
              )}
            </button>
          ))}
        </div>

        <div className="w-full overflow-hidden rounded-2xl bg-[#1f1c25] max-h-[72vh] md:max-h-[70vh] aspect-[4/3] md:aspect-[3/2]">
          {activeImage?.src ? (
            <img src={activeImage.src} alt={activeImage.alt} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full min-h-[300px] items-center justify-center text-offwhite/40">
              Sem imagem disponível
            </div>
          )}
        </div>

        <aside className="rounded-2xl bg-[#1f1c25] p-5 shadow-xl shadow-black/20">
          <p className="text-sm uppercase tracking-[0.4em] text-offwhite/60">{product.category}</p>
          <h1 className="mt-2 text-3xl font-bold">{product.name}</h1>
          <div className="mt-3 space-y-1 text-sm">
            <p className="text-xs uppercase tracking-widest text-offwhite/50">Preço base</p>
            <p className="text-xl font-semibold text-offwhite">{formatPrice(product.price)}</p>
            <p className="text-xs uppercase tracking-widest text-offwhite/50">Total com acessórios</p>
            <p className="text-2xl font-bold text-orange">{formatPrice(totalPrice)}</p>
          </div>

          <div className="mt-6 space-y-5 text-sm">
            <div>
              <p className="text-xs uppercase tracking-widest text-offwhite/50">Tamanho</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {availableSizes.map((size) => (
                  <button
                    type="button"
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={clsx(
                      'rounded-full border px-3 py-1 text-xs font-semibold uppercase transition',
                      selectedSize === size
                        ? 'border-purple bg-purple text-offwhite'
                        : 'border-offwhite/30 text-offwhite/70',
                    )}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs uppercase tracking-widest text-offwhite/50">Cor</p>
              <div className="mt-3 flex gap-3">
                {colorTokens.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    onClick={() => setSelectedColor(color.value)}
                    className={clsx(
                      'h-9 w-9 rounded-full border-2 border-transparent transition',
                      selectedColor === color.value ? 'ring-2 ring-offwhite' : 'border-offwhite/30',
                    )}
                    style={{ backgroundColor: color.hex }}
                    title={color.label}
                  />
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs uppercase tracking-widest text-offwhite/50">Quantidade</span>
              <QuantityInput value={quantity} onChange={setQuantity} />
            </div>

            <div>
              <p className="text-xs uppercase tracking-widest text-offwhite/50">Acessórios</p>
              {accessoriesError ? (
                <p className="mt-2 text-sm text-offwhite/60">Não foi possível carregar os acessórios.</p>
              ) : isAccessoriesLoading ? (
                <p className="mt-2 text-sm text-offwhite/60">Carregando...</p>
              ) : (
                <div className="mt-3 space-y-2">
                  {accessories.map((accessory) => (
                    <label
                      key={accessory.id}
                      className="flex items-center justify-between rounded-2xl border border-offwhite/20 px-3 py-2 text-sm"
                    >
                      <div className="flex flex-col text-left">
                        <span className="font-semibold">{accessory.name}</span>
                        <span className="text-xs text-offwhite/60">{formatPrice(accessory.price)}</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={selectedAccessories.includes(accessory.id)}
                        onChange={() => handleAccessoryToggle(accessory.id)}
                        className="h-4 w-4 rounded border-offwhite/40 bg-dark text-purple focus:ring-purple"
                      />
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              void handlePurchase();
            }}
            className="mt-8 w-full rounded-full bg-purple py-3 text-center text-sm font-semibold text-offwhite shadow-lg shadow-purple/40 transition hover:brightness-110"
          >
            Comprar
          </button>
        </aside>
      </div>

      <section className="rounded-2xl bg-[#1f1c25] p-6 shadow-inner shadow-black/30">
        <h3 className="text-lg font-semibold">Descrição</h3>
        <p className="mt-2 text-offwhite/70">{product.description}</p>
      </section>
    </div>
  );
};

export default ProductPage;
