import React from 'react';
import { ShoppingCart } from 'lucide-react';
import type { Product } from '../data/catalog';
import { useCartStore } from '../stores/cartStore';

interface ProductCardProps {
  product: Product;
}

const formatPrice = (price: number) =>
  new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
  }).format(price);

export default function ProductCard({ product }: ProductCardProps) {
  const addToCart = useCartStore((state) => state.addToCart);

  const highlights = Object.entries(product.specs).slice(0, 3);

  const handleAddToCart = () => {
    addToCart(product.id, 1);
  };

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
        <img
          src={product.image}
          alt={product.name}
          className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
          loading="lazy"
        />
        <span className="absolute left-4 top-4 inline-flex items-center rounded-full bg-white/80 px-3 py-1 text-xs font-medium text-slate-600 backdrop-blur">
          {product.brand}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-4 p-5">
        <header>
          <h3 className="text-lg font-semibold text-slate-900 leading-tight">
            {product.name}
          </h3>
          <p className="mt-1 text-sm text-slate-500 line-clamp-2">{product.description}</p>
        </header>

        {highlights.length > 0 && (
          <dl className="grid grid-cols-1 gap-2 text-xs text-slate-500">
            {highlights.map(([label, value]) => (
              <div key={label} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
                <dt className="font-medium text-slate-600 capitalize">{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
        )}

        <div className="mt-auto flex items-end justify-between">
          <div>
            <p className="text-sm text-slate-500">Stock: {product.stock}</p>
            <p className="text-2xl font-semibold text-slate-900">{formatPrice(product.price)}</p>
          </div>
          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-5 py-2 text-sm font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            <ShoppingCart className="h-4 w-4" />
            Agregar
          </button>
        </div>
      </div>
    </article>
  );
}