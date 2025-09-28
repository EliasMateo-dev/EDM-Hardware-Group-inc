import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import { useTiendaCarrito } from '../stores/tiendaCarrito';
import PaymentModal from '../components/PaymentModal';

const formatearPrecio = (precio: number) =>
  new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
  }).format(precio);

export default function Carrito() {
  const [showPaymentModal, setShowPaymentModal] = React.useState(false);
  const elementos = useTiendaCarrito((estado) => estado.elementos);
  const cargarCarrito = useTiendaCarrito((estado) => estado.cargarCarrito);
  const actualizarCantidad = useTiendaCarrito((estado) => estado.actualizarCantidad);
  const eliminarDelCarrito = useTiendaCarrito((estado) => estado.eliminarDelCarrito);
  const vaciarCarrito = useTiendaCarrito((estado) => estado.vaciarCarrito);
  const obtenerTotalPrecio = useTiendaCarrito((estado) => estado.obtenerTotalPrecio);

  useEffect(() => {
    cargarCarrito();
  }, [cargarCarrito]);

  if (elementos.length === 0) {
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
          {elementos.map((elemento) => (
            <article
              key={elemento.producto.id}
              className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 md:flex-row md:items-center"
            >
              <img
                src={elemento.producto.imagen}
                alt={elemento.producto.nombre}
                className="h-28 w-28 rounded-2xl object-cover"
              />
              <div className="flex-1 space-y-2">
                <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{elemento.producto.nombre}</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {elemento.producto.marca} - {elemento.producto.modelo}
                    </p>
                  </div>
                  <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">{formatearPrecio(elemento.producto.precio)}</p>
                </div>
                <p className="text-xs text-slate-400 dark:text-slate-500">Existencias: {elemento.producto.existencias}</p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => actualizarCantidad(elemento.producto.id, elemento.cantidad - 1)}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-700 transition hover:border-slate-900 hover:text-slate-900 dark:border-slate-800 dark:text-slate-300 dark:hover:border-slate-600 dark:hover:text-white"
                  type="button"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">{elemento.cantidad}</span>
                <button
                  onClick={() => actualizarCantidad(elemento.producto.id, elemento.cantidad + 1)}
                  disabled={elemento.cantidad >= elemento.producto.existencias}
                  className={`inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200
                    ${elemento.cantidad + 1 > elemento.producto.existencias
                      ? 'text-slate-200 border-slate-200 cursor-not-allowed dark:border-slate-700 dark:text-slate-700'
                      : 'text-slate-700 hover:border-slate-900 hover:text-slate-900 dark:border-slate-800 dark:text-slate-300 dark:hover:border-slate-600 dark:hover:text-white'}`}
                  type="button"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              <button
                onClick={() => eliminarDelCarrito(elemento.producto.id)}
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
            {elementos.map((elemento) => (
              <div key={elemento.producto.id} className="flex justify-between text-sm text-slate-600 dark:text-slate-300">
                <span>
                  {elemento.producto.nombre}
                  <span className="text-slate-400 dark:text-slate-500"> x {elemento.cantidad}</span>
                </span>
                <span className="font-medium text-slate-900 dark:text-slate-100">
                  {formatearPrecio(elemento.producto.precio * elemento.cantidad)}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-6 flex items-center justify-between border-t border-slate-200 pt-6 text-slate-600 dark:border-slate-800 dark:text-slate-300">
            <span className="text-sm font-medium">Total</span>
            <span className="text-2xl font-semibold text-slate-900 dark:text-slate-100">{formatearPrecio(obtenerTotalPrecio())}</span>
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
        totalAmount={obtenerTotalPrecio()}
      />
    </section>
  );
}
