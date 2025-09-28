import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Loader2, Database } from 'lucide-react';
import { useTiendaProductos } from '../stores/tiendaProductos';
import TarjetaProducto from '../components/TarjetaProducto';

export default function Inicio() {
  const cargarProductos = useTiendaProductos((estado) => estado.cargarProductos);
  const establecerCategoriaSeleccionada = useTiendaProductos((estado) => estado.establecerCategoriaSeleccionada);
  const categorias = useTiendaProductos((estado) => estado.categorias);
  const cargando = useTiendaProductos((estado) => estado.cargando);
  const obtenerProductosFiltrados = useTiendaProductos((estado) => estado.obtenerProductosFiltrados);
  const productos = obtenerProductosFiltrados();

  useEffect(() => {
    establecerCategoriaSeleccionada(null);
    cargarProductos(null);
  }, [cargarProductos, establecerCategoriaSeleccionada]);

  return (
    <div className="space-y-12 pb-16">
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-slate-900 p-10 text-white shadow-lg transition-colors sm:p-16 dark:bg-slate-800">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl space-y-4">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">PROXIMA ENTREGA!</p>
              <h1 className="text-4xl font-semibold leading-tight sm:text-5xl">
                Contruí la PC de tus suenos en EDM!
              </h1>
              <p className="text-sm text-slate-300">
                Componentes seleccionados: CPU, Motherboards, memoria RAM, graficas, fuentes, gabinetes y SSD.
              </p>
            </div>
            <Link
              to="/constructor-pc"
              className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-medium text-slate-900 transition hover:bg-slate-200"
            >
              Ver Constructor PC
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-10 flex flex-wrap gap-2">
            {categorias.map((categoria) => (
              <Link
                key={categoria.id}
                to={`/categoria/${categoria.alias}`}
                className="rounded-full border border-white/20 px-4 py-2 text-xs font-medium text-slate-200 transition hover:bg-white hover:text-slate-900"
              >
                {categoria.nombre}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-3 mb-4">
            <Database className="h-6 w-6 text-slate-600 dark:text-slate-400" />
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
              Integración con Supabase
            </h2>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
            Prueba la conexión con la base de datos y visualiza los productos almacenados.
          </p>
          <Link
            to="/supabase-test"
            className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
          >
            Ver datos de Supabase
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <header className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Componentes destacados:</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400"></p>
          </div>
          <p className="text-sm text-slate-400 dark:text-slate-500">{productos.length} productos disponibles</p>
        </header>

        {cargando ? (
          <div className="flex min-h-[280px] items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-white transition-colors dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-3 text-sm font-medium text-slate-500 dark:text-slate-400">
              <Loader2 className="h-5 w-5 animate-spin" />
              Cargando catalogo...
            </div>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {productos.map((producto) => (
              <TarjetaProducto key={producto.id} producto={producto} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
