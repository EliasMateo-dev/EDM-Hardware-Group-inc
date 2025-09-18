import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Cpu, Menu, Moon, Search, ShoppingCart, Sun, X } from 'lucide-react';
import { useCartStore } from '../stores/cartStore';
import { useProductsStore } from '../stores/productsStore';
import { useThemeStore } from '../stores/themeStore';

export default function Navbar() {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const totalItems = useCartStore((state) => state.getTotalItems());
  const categories = useProductsStore((state) => state.categories);
  const searchTerm = useProductsStore((state) => state.searchTerm);
  const setSearchTerm = useProductsStore((state) => state.setSearchTerm);
  const setSelectedCategory = useProductsStore((state) => state.setSelectedCategory);
  const fetchProducts = useProductsStore((state) => state.fetchProducts);
  const theme = useThemeStore((state) => state.theme);
  const toggleTheme = useThemeStore((state) => state.toggleTheme);

  const handleCategoryChange = (slug: string | null) => {
    setSelectedCategory(slug);
    fetchProducts(slug);
    setIsMenuOpen(false);
    if (slug) {
      navigate(`/category/${slug}`);
    } else {
      navigate('/');
    }
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const themeIcon = theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />;
  const themeLabel = theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro';

  return (
    <nav className="sticky top-0 z-40 border-b border-slate-200/60 bg-white/80 backdrop-blur transition-colors duration-300 dark:border-slate-800/60 dark:bg-slate-950/75">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-3 text-slate-900 transition-colors dark:text-slate-100">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-white dark:bg-white dark:text-slate-900">
              <Cpu className="h-5 w-5" />
            </span>
            <span className="text-lg font-semibold tracking-wide">Hardware Kit</span>
          </Link>

          <div className="hidden w-full max-w-md items-center rounded-full border border-slate-200 bg-white px-4 py-2 shadow-sm transition-colors dark:border-slate-800 dark:bg-slate-900 md:flex">
            <Search className="mr-3 h-4 w-4 text-slate-400" />
            <input
              type="search"
              placeholder="Buscar CPU, GPU, RAM..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full border-none bg-transparent text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none dark:text-slate-200 dark:placeholder:text-slate-500"
            />
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 transition hover:border-slate-300 hover:text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-slate-700 dark:hover:text-white"
              aria-label={themeLabel}
              type="button"
            >
              {themeIcon}
            </button>

            <Link
              to="/cart"
              className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 transition hover:border-slate-300 hover:text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-slate-700 dark:hover:text-white"
            >
              <ShoppingCart className="h-5 w-5" />
              {totalItems > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-white dark:bg-white dark:text-slate-900">
                  {totalItems}
                </span>
              )}
            </Link>

            <button
              onClick={() => setIsMenuOpen(true)}
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
              onClick={() => handleCategoryChange(null)}
              className="rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
              type="button"
            >
              Todos
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => handleCategoryChange(category.slug)}
                className="rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-900 hover:text-white dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-white dark:hover:text-slate-900"
                type="button"
              >
                {category.name}
              </button>
            ))}
          </div>

          <Link
            to="/pc-builder"
            className="inline-flex items-center rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-900 hover:text-slate-900 dark:border-slate-800 dark:text-slate-200 dark:hover:border-slate-600 dark:hover:text-white"
          >
            PC Builder
          </Link>
        </div>
      </div>

      {isMenuOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 px-6 py-8 backdrop-blur md:hidden">
          <div className="mx-auto w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl dark:bg-slate-900">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-base font-semibold text-slate-900 dark:text-slate-100">Navegacion</span>
              <button
                onClick={() => setIsMenuOpen(false)}
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
                value={searchTerm}
                onChange={handleSearchChange}
                className="w-full border-none bg-transparent text-sm text-slate-700 focus:outline-none dark:text-slate-200"
              />
            </div>

            <div className="space-y-2">
              <button
                onClick={() => handleCategoryChange(null)}
                className="w-full rounded-xl bg-slate-900 px-4 py-3 text-left text-sm font-medium text-white transition hover:bg-slate-700 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
                type="button"
              >
                Todos los productos
              </button>
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => handleCategoryChange(category.slug)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-800 dark:text-slate-200 dark:hover:bg-slate-800"
                  type="button"
                >
                  {category.name}
                </button>
              ))}
              <Link
                to="/pc-builder"
                onClick={() => setIsMenuOpen(false)}
                className="block rounded-xl border border-slate-200 px-4 py-3 text-center text-sm font-medium text-slate-700 transition hover:border-slate-900 hover:text-slate-900 dark:border-slate-800 dark:text-slate-200 dark:hover:border-slate-600 dark:hover:text-white"
              >
                PC Builder
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
