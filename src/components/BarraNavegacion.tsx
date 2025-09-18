import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Cpu, Menu, Moon, Search, ShoppingCart, Sun, X } from 'lucide-react';
import { useTiendaCarrito } from '../stores/tiendaCarrito';
import { useTiendaProductos } from '../stores/tiendaProductos';
import { useTiendaTema } from '../stores/tiendaTema';

export default function BarraNavegacion() {
  const navegar = useNavigate();
  const [menuAbierto, establecerMenuAbierto] = useState(false);
  const totalArticulos = useTiendaCarrito((estado) => estado.obtenerTotalArticulos());
  const categorias = useTiendaProductos((estado) => estado.categorias);
  const terminoBusqueda = useTiendaProductos((estado) => estado.terminoBusqueda);
  const establecerTerminoBusqueda = useTiendaProductos((estado) => estado.establecerTerminoBusqueda);
  const establecerCategoriaSeleccionada = useTiendaProductos((estado) => estado.establecerCategoriaSeleccionada);
  const cargarProductos = useTiendaProductos((estado) => estado.cargarProductos);
  const tema = useTiendaTema((estado) => estado.tema);
  const alternarTema = useTiendaTema((estado) => estado.alternarTema);

  const manejarCambioCategoria = (alias: string | null) => {
    establecerCategoriaSeleccionada(alias);
    cargarProductos(alias);
    establecerMenuAbierto(false);
    if (alias) {
      navegar(`/categoria/${alias}`);
    } else {
      navegar('/');
    }
  };

  const manejarCambioBusqueda = (evento: React.ChangeEvent<HTMLInputElement>) => {
    establecerTerminoBusqueda(evento.target.value);
  };

  const iconoTema = tema === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />;
  const etiquetaTema = tema === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro';

  return (
    <nav className="sticky top-0 z-40 border-b border-slate-200/60 bg-white/80 backdrop-blur transition-colors duration-300 dark:border-slate-800/60 dark:bg-slate-950/75">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-3 text-slate-900 transition-colors dark:text-slate-100">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-white dark:bg-white dark:text-slate-900">
              <Cpu className="h-5 w-5" />
            </span>
            <span className="text-lg font-semibold tracking-wide">Hardware</span>
          </Link>

          <div className="hidden w-full max-w-md items-center rounded-full border border-slate-200 bg-white px-4 py-2 shadow-sm transition-colors dark:border-slate-800 dark:bg-slate-900 md:flex">
            <Search className="mr-3 h-4 w-4 text-slate-400" />
            <input
              type="search"
              placeholder="Buscar CPU, GPU, RAM..."
              value={terminoBusqueda}
              onChange={manejarCambioBusqueda}
              className="w-full border-none bg-transparent text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none dark:text-slate-200 dark:placeholder:text-slate-500"
            />
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={alternarTema}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 transition hover:border-slate-300 hover:text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-slate-700 dark:hover:text-white"
              aria-label={etiquetaTema}
              type="button"
            >
              {iconoTema}
            </button>

            <Link
              to="/carrito"
              className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 transition hover:border-slate-300 hover:text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-slate-700 dark:hover:text-white"
            >
              <ShoppingCart className="h-5 w-5" />
              {totalArticulos > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-white dark:bg-white dark:text-slate-900">
                  {totalArticulos}
                </span>
              )}
            </Link>

            <button
              onClick={() => establecerMenuAbierto(true)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 transition hover:border-slate-300 hover:text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-slate-700 dark:hover:text-white md:hidden"
              aria-label="Abrir menu"
              type="button"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="hidden items-center justify-between py-4 md:flex">
          <div className="flex items-center gap-2 overflow-x-auto">
            <button
              onClick={() => manejarCambioCategoria(null)}
              className="rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
              type="button"
            >
              Todos
            </button>
            {categorias.map((categoria) => (
              <button
                key={categoria.id}
                onClick={() => manejarCambioCategoria(categoria.alias)}
                className="rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-900 hover:text-white dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-white dark:hover:text-slate-900"
                type="button"
              >
                {categoria.nombre}
              </button>
            ))}
          </div>

          <Link
            to="/constructor-pc"
            className="inline-flex items-center rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-900 hover:text-slate-900 dark:border-slate-800 dark:text-slate-200 dark:hover:border-slate-600 dark:hover:text-white"
          >
            Constructor PC
          </Link>
        </div>
      </div>

      {menuAbierto && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 px-6 py-8 backdrop-blur md:hidden">
          <div className="mx-auto w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl dark:bg-slate-900">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-base font-semibold text-slate-900 dark:text-slate-100">Navegacion</span>
              <button
                onClick={() => establecerMenuAbierto(false)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition hover:border-slate-900 hover:text-slate-900 dark:border-slate-800 dark:text-slate-300 dark:hover:border-slate-600 dark:hover:text-white"
                aria-label="Cerrar menu"
                type="button"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mb-4 flex items-center rounded-full border border-slate-200 bg-white px-4 py-2 transition-colors dark:border-slate-800 dark:bg-slate-900">
              <Search className="mr-3 h-4 w-4 text-slate-400" />
              <input
                type="search"
                placeholder="Buscar producto"
                value={terminoBusqueda}
                onChange={manejarCambioBusqueda}
                className="w-full border-none bg-transparent text-sm text-slate-700 focus:outline-none dark:text-slate-200"
              />
            </div>

            <div className="space-y-2">
              <button
                onClick={() => manejarCambioCategoria(null)}
                className="w-full rounded-xl bg-slate-900 px-4 py-3 text-left text-sm font-medium text-white transition hover:bg-slate-700 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
                type="button"
              >
                Todos los productos
              </button>
              {categorias.map((categoria) => (
                <button
                  key={categoria.id}
                  onClick={() => manejarCambioCategoria(categoria.alias)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-800 dark:text-slate-200 dark:hover:bg-slate-800"
                  type="button"
                >
                  {categoria.nombre}
                </button>
              ))}
              <Link
                to="/constructor-pc"
                onClick={() => establecerMenuAbierto(false)}
                className="block rounded-xl border border-slate-200 px-4 py-3 text-center text-sm font-medium text-slate-700 transition hover:border-slate-900 hover:text-slate-900 dark:border-slate-800 dark:text-slate-200 dark:hover:border-slate-600 dark:hover:text-white"
              >
                Constructor PC
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
