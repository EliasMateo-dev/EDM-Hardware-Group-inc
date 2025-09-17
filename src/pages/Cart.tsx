import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { useCartStore } from '../stores/cartStore';

const formatPrice = (price: number) =>
  new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
  }).format(price);

export default function Cart() {
  const items = useCartStore((state) => state.items);
  const fetchCart = useCartStore((state) => state.fetchCart);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeFromCart = useCartStore((state) => state.removeFromCart);
  const clearCart = useCartStore((state) => state.clearCart);
  const getTotalPrice = useCartStore((state) => state.getTotalPrice);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  if (items.length === 0) {
    return (
      <section className="mx-auto flex max-w-3xl flex-col items-center gap-6 px-4 py-24 text-center">
        <ShoppingBag className="h-16 w-16 text-slate-300" />
        <div>
          <h1 className="text-3xl font-semibold text-slate-900">Tu carrito esta vacio</h1>
          <p className="mt-2 text-sm text-slate-500">
            Elegi al menos un componente para empezar esta configuracion basica.
          </p>
        </div>
        <Link
          to="/"
          className="inline-flex items-center rounded-full bg-slate-900 px-6 py-3 text-sm font-medium text-white transition hover:bg-slate-700"
        >
          Ver catalogo
        </Link>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-6xl px-4 py-12">
      <header className="mb-10 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">Carrito</p>
          <h1 className="text-4xl font-semibold text-slate-900">Componentes seleccionados</h1>
        </div>
        <button
          onClick={clearCart}
          className="self-start rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-slate-900 hover:text-slate-900"
        >
          Vaciar carrito
        </button>
      </header>

      <div className="grid gap-8 lg:grid-cols-[2fr,1fr]">
        <div className="space-y-4">
          {items.map((item) => (
            <article
              key={item.product.id}
              className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md md:flex-row md:items-center"
            >
              <img
                src={item.product.image}
                alt={item.product.name}
                className="h-28 w-28 rounded-2xl object-cover"
              />
              <div className="flex-1 space-y-2">
                <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900">{item.product.name}</h2>
                    <p className="text-sm text-slate-500">{item.product.brand} · {item.product.model}</p>
                  </div>
                  <p className="text-lg font-semibold text-slate-900">{formatPrice(item.product.price)}</p>
                </div>
                <p className="text-xs text-slate-400">Stock disponible: {item.product.stock}</p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-700 transition hover:border-slate-900 hover:text-slate-900"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="text-sm font-semibold text-slate-900">{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-700 transition hover:border-slate-900 hover:text-slate-900"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              <button
                onClick={() => removeFromCart(item.product.id)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition hover:border-red-500 hover:text-red-500"
                aria-label="Quitar del carrito"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </article>
          ))}
        </div>

        <aside className="h-fit rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">Resumen</h2>
          <p className="mt-2 text-sm text-slate-500">
            Este carrito se guarda automaticamente en este navegador.
          </p>

          <div className="mt-6 space-y-3">
            {items.map((item) => (
              <div key={item.product.id} className="flex justify-between text-sm text-slate-600">
                <span>
                  {item.product.name}
                  <span className="text-slate-400"> × {item.quantity}</span>
                </span>
                <span className="font-medium text-slate-900">
                  {formatPrice(item.product.price * item.quantity)}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-6 flex items-center justify-between border-t border-slate-200 pt-6">
            <span className="text-sm font-medium text-slate-500">Total</span>
            <span className="text-2xl font-semibold text-slate-900">{formatPrice(getTotalPrice())}</span>
          </div>

          <button
            className="mt-6 w-full rounded-full bg-slate-900 py-3 text-sm font-medium text-white transition hover:bg-slate-700"
          >
            Continuar pedido
          </button>
        </aside>
      </div>
    </section>
  );
}