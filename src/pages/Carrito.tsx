import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import { useTiendaCarrito } from '../stores/tiendaCarrito';
import { useTiendaProductos } from '../stores/tiendaProductos';
import PaymentModal from '../components/PaymentModal';


const formatearPrecio = (precio: number | undefined) => {
  if (typeof precio !== 'number' || isNaN(precio)) return '$ 0';
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
  }).format(precio);
};


export default function Carrito() {
  const [showPaymentModal, setShowPaymentModal] = React.useState(false);
  const elementos = useTiendaCarrito((estado) => estado.elementos);
  const cargarCarrito = useTiendaCarrito((estado) => estado.cargarCarrito);
  const actualizarCantidad = useTiendaCarrito((estado) => estado.actualizarCantidad);
  const eliminarDelCarrito = useTiendaCarrito((estado) => estado.eliminarDelCarrito);
  const vaciarCarrito = useTiendaCarrito((estado) => estado.vaciarCarrito);
  const obtenerTotalPrecioFn = useTiendaCarrito((estado) => {
    return () => (estado.elementos || []).reduce((acc, el) => acc + ((el?.producto?.price || 0) * (el?.cantidad || 0)), 0);
  });
  const cargarProductos = useTiendaProductos((s) => s.cargarProductos);

  useEffect(() => {
    // Cargar todos los productos antes de hidratar el carrito
    (async () => {
      await cargarProductos();
      await cargarCarrito();
    })();
  }, [cargarCarrito, cargarProductos]);

  // defensive: filter out any malformed entries that may exist in localStorage
  const safeElementos = Array.isArray(elementos)
    ? elementos.filter((el) => el && el.producto && typeof el.producto.id === 'string')
    : [];

  if (safeElementos.length === 0) {
    return (
      <section className="mx-auto flex max-w-3xl flex-col items-center gap-6 px-4 py-24 text-center text-slate-900 dark:text-slate-100">
        <ShoppingBag className="h-16 w-16 text-slate-300 dark:text-slate-600" />
        <div>
          <h1 className="text-3xl font-semibold">Tu carrito esta vacio</h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Elige al menos un componente para empezar esta configuracion basica.
          </p>
        </div>
        <Link
          to="/"
          className="inline-flex items-center rounded-full bg-slate-900 px-6 py-3 text-sm font-medium text-white transition hover:bg-slate-700 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
        >
          Ver catalogo
        </Link>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-6xl px-4 py-12">
      <header className="mb-10 flex flex-col gap-2 text-slate-900 dark:text-slate-100 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Carrito</p>
          <h1 className="text-4xl font-semibold">Componentes seleccionados</h1>
        </div>
        <button
          onClick={vaciarCarrito}
          className="self-start rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-slate-900 hover:text-slate-900 dark:border-slate-800 dark:text-slate-300 dark:hover:border-slate-600 dark:hover:text-white"
          type="button"
        >
          Vaciar carrito
        </button>
      </header>

      <div className="grid gap-8 lg:grid-cols-[2fr,1fr]">
        <div className="space-y-4">
          {safeElementos.map((elemento) => (
            <article
              key={elemento.producto?.id ?? Math.random().toString(36).slice(2, 9)}
              className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 md:flex-row md:items-center"
            >
              <img
                src={(elemento.producto && elemento.producto.image_url) || '/placeholder.png'}
                alt={(elemento.producto && elemento.producto.name) || 'Producto'}
                className="h-28 w-28 rounded-2xl object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/placeholder.png';
                }}
              />
              <div className="flex-1 space-y-2">
                <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{elemento.producto?.name ?? 'Sin nombre'}</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {elemento.producto?.brand ?? '-'} - {elemento.producto?.model ?? '-'}
                    </p>
                  </div>
                  <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">{formatearPrecio(typeof elemento.producto?.price === 'number' ? elemento.producto.price : Number(elemento.producto?.price || 0))}</p>
                </div>
                <p className="text-xs text-slate-400 dark:text-slate-500">Existencias: {typeof elemento.producto?.stock === 'number' ? elemento.producto.stock : 0}</p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => elemento.producto && actualizarCantidad(elemento.producto.id, elemento.cantidad - 1)}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-700 transition hover:border-slate-900 hover:text-slate-900 dark:border-slate-800 dark:text-slate-300 dark:hover:border-slate-600 dark:hover:text-white"
                  type="button"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">{elemento.cantidad}</span>
                <button
                  onClick={() => elemento.producto && actualizarCantidad(elemento.producto.id, elemento.cantidad + 1)}
                  disabled={elemento.cantidad >= (typeof elemento.producto.stock === 'number' ? elemento.producto.stock : 0)}
                  className={`inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200
                    ${elemento.cantidad + 1 > (typeof elemento.producto.stock === 'number' ? elemento.producto.stock : 0)
                      ? 'text-slate-200 border-slate-200 cursor-not-allowed dark:border-slate-700 dark:text-slate-700'
                      : 'text-slate-700 hover:border-slate-900 hover:text-slate-900 dark:border-slate-800 dark:text-slate-300 dark:hover:border-slate-600 dark:hover:text-white'}`}
                  type="button"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

                <button
                onClick={() => elemento.producto && eliminarDelCarrito(elemento.producto.id)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition hover:border-red-500 hover:text-red-500 dark:border-slate-800 dark:text-slate-400 dark:hover:border-red-400 dark:hover:text-red-400"
                aria-label="Quitar del carrito"
                type="button"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </article>
          ))}
        </div>

        <aside className="h-fit rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-colors dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Resumen</h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Este carrito se guarda automaticamente en este navegador.
          </p>

          <div className="mt-6 space-y-3">
            {safeElementos.map((elemento) => {
              const prod = elemento.producto || {} as any;
              const prodId = typeof prod.id === 'string' ? prod.id : Math.random().toString(36).slice(2, 9);
              const name = prod.name || 'Sin nombre';
              const qty = typeof elemento.cantidad === 'number' ? elemento.cantidad : 0;
              const price = typeof prod.price === 'number' ? prod.price : Number(prod.price || 0);
              return (
                <div key={prodId} className="flex justify-between text-sm text-slate-600 dark:text-slate-300">
                  <span>
                    {name}
                    <span className="text-slate-400 dark:text-slate-500"> x {qty}</span>
                  </span>
                  <span className="font-medium text-slate-900 dark:text-slate-100">
                    {formatearPrecio(price * qty)}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="mt-6 flex items-center justify-between border-t border-slate-200 pt-6 text-slate-600 dark:border-slate-800 dark:text-slate-300">
            <span className="text-sm font-medium">Total</span>
            <span className="text-2xl font-semibold text-slate-900 dark:text-slate-100">{formatearPrecio(
              safeElementos.reduce((acc, el) => {
                const p = el?.producto || {} as any;
                const pr = typeof p.price === 'number' ? p.price : Number(p.price || 0);
                const q = typeof el.cantidad === 'number' ? el.cantidad : 0;
                return acc + pr * q;
              }, 0)
            )}</span>
          </div>

          <button
            onClick={() => setShowPaymentModal(true)}
            className="mt-6 w-full rounded-full bg-slate-900 py-3 text-sm font-medium text-white transition hover:bg-slate-700 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
          >
            Finalizar Compra
          </button>
        </aside>
      </div>

      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        totalAmount={obtenerTotalPrecioFn()}
      />
    </section>
  );
}
