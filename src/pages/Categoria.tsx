import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useTiendaProductos } from '../stores/tiendaProductos';
import TarjetaProducto from '../components/TarjetaProducto';

export default function Categoria() {
  const { slug } = useParams<{ slug: string }>();
  const cargarProductos = useTiendaProductos((estado) => estado.cargarProductos);
  const categorias = useTiendaProductos((estado) => estado.categorias);
  const cargando = useTiendaProductos((estado) => estado.cargando);
  const obtenerProductosFiltrados = useTiendaProductos((estado) => estado.obtenerProductosFiltrados);
  const productos = obtenerProductosFiltrados();

  useEffect(() => {
    cargarProductos(slug ?? null);
  }, [cargarProductos, slug]);

  const categoriaActual = categorias.find((categoria) => categoria.slug === slug);

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <header className="mb-10 space-y-3">
        <p className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 text-center">Categoria</p>
        <h1 className="text-4xl font-semibold text-slate-900 dark:text-slate-100 text-center">
          {categoriaActual?.name ?? 'Componentes'}
        </h1>
        {categoriaActual?.description && (
          <p className="max-w-2xl text-sm text-slate-500 dark:text-slate-400 text-center">{categoriaActual.description}</p>
        )}
      </header>

      {cargando ? (
        <div className="flex min-h-[240px] items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-white transition-colors dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-3 text-sm font-medium text-slate-500 dark:text-slate-400">
            <Loader2 className="h-5 w-5 animate-spin" />
            Cargando {categoriaActual?.name?.toLowerCase() ?? 'componentes'}...
          </div>
        </div>
      ) : productos.length === 0 ? (
        <div className="flex min-h-[240px] items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-white transition-colors dark:border-slate-800 dark:bg-slate-900">
          <p className="text-sm text-slate-500 dark:text-slate-400 text-center">No hay productos disponibles en esta categoria.</p>
        </div>
      ) : (
        <>
          <h2 className="mb-6 text-xl font-semibold text-slate-900 dark:text-slate-100 text-center">
            {categoriaActual?.name ?? 'Componentes'} destacados:
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 justify-items-center">
            {productos.map((producto) => (
              <TarjetaProducto key={producto.id} producto={producto} confirmOnAdd />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
