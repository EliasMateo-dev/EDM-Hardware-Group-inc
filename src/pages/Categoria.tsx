import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useTiendaProductos } from '../stores/tiendaProductos';
import TarjetaProducto from '../components/TarjetaProducto';

export default function Categoria() {
  const { alias } = useParams<{ alias: string }>();
  const cargarProductos = useTiendaProductos((estado) => estado.cargarProductos);
  const categorias = useTiendaProductos((estado) => estado.categorias);
  const cargando = useTiendaProductos((estado) => estado.cargando);
  const obtenerProductosFiltrados = useTiendaProductos((estado) => estado.obtenerProductosFiltrados);
  const productos = obtenerProductosFiltrados();

  useEffect(() => {
    cargarProductos(alias ?? null);
  }, [cargarProductos, alias]);

  const categoriaActual = categorias.find((categoria) => categoria.alias === alias);

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <header className="mb-10 space-y-3">
        <p className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Categoria</p>
        <h1 className="text-4xl font-semibold text-slate-900 dark:text-slate-100">
          {categoriaActual?.nombre ?? 'Componentes'}
        </h1>
        {categoriaActual?.descripcion && (
          <p className="max-w-2xl text-sm text-slate-500 dark:text-slate-400">{categoriaActual.descripcion}</p>
        )}
      </header>

      {cargando ? (
        <div className="flex min-h-[240px] items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-white transition-colors dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-3 text-sm font-medium text-slate-500 dark:text-slate-400">
            <Loader2 className="h-5 w-5 animate-spin" />
            Cargando componentes...
          </div>
        </div>
      ) : productos.length === 0 ? (
        <div className="flex min-h-[240px] items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-white transition-colors dark:border-slate-800 dark:bg-slate-900">
          <p className="text-sm text-slate-500 dark:text-slate-400">No hay productos disponibles en esta categoria.</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {productos.map((producto) => (
            <TarjetaProducto key={producto.id} producto={producto} />
          ))}
        </div>
      )}
    </section>
  );
}
