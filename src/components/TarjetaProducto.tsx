import React from 'react';
import { ShoppingCart } from 'lucide-react';
import type { Producto } from '../data/catalogo';
import { useTiendaCarrito } from '../stores/tiendaCarrito';

interface PropiedadesTarjetaProducto {
  producto: Producto;
}

const formatearPrecio = (precio: number) =>
  new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(precio);


export default function TarjetaProducto({ producto }: PropiedadesTarjetaProducto) {
  const agregarAlCarrito = useTiendaCarrito((estado) => estado.agregarAlCarrito);

  const puntosDestacados = Object.entries(producto.especificaciones).slice(0, 3);

  const elementos = useTiendaCarrito((estado) => estado.elementos);
  const cantidadEnCarrito = elementos.find((elemento) => elemento.producto.id === producto.id)?.cantidad || 0;
  const stockDisponible = producto.existencias - cantidadEnCarrito;

  const manejarAgregarAlCarrito = () => {
    if (stockDisponible > 0) {
      agregarAlCarrito(producto.id, 1);
    }
  };

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900">
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-100 dark:bg-slate-800">
        <img
          src={producto.imagen}
          alt={producto.nombre}
          className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
          loading="lazy"
        />
        <span className="absolute left-4 top-4 inline-flex items-center rounded-full bg-white/80 px-3 py-1 text-xs font-medium text-slate-600 backdrop-blur dark:bg-slate-900/80 dark:text-slate-200">
          {producto.marca}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-4 p-5">
        <header>
          <h3 className="text-lg font-semibold leading-tight text-slate-900 dark:text-slate-100">
            {producto.nombre}
          </h3>
          <p className="mt-1 line-clamp-2 text-sm text-slate-500 dark:text-slate-400">{producto.descripcion}</p>
        </header>

        {puntosDestacados.length > 0 && (
          <dl className="grid grid-cols-1 gap-2 text-xs text-slate-500 dark:text-slate-400">
            {puntosDestacados.map(([etiqueta, valor]) => (
              <div key={etiqueta} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 dark:bg-slate-800/70">
                <dt className="font-medium capitalize text-slate-600 dark:text-slate-300">{etiqueta}</dt>
                <dd>{valor}</dd>
              </div>
            ))}
          </dl>
        )}

        <div className="mt-auto flex items-end justify-between">
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">Existencias: {stockDisponible}</p>
            <p className="text-2xl font-semibold text-slate-900 dark:text-slate-100">{formatearPrecio(producto.precio)}</p>
          </div>
          <button
            onClick={manejarAgregarAlCarrito}
            disabled={stockDisponible === 0}
            className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-5 py-2 text-sm font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-300 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200 dark:disabled:bg-slate-700/40 dark:disabled:text-slate-500"
            type="button"
          >
            <ShoppingCart className="h-4 w-4" />
            {stockDisponible === 0 ? 'Sin stock' : 'Agregar'}
          </button>
        </div>
      </div>
    </article>
  );
}
