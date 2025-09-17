import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Cpu, Menu, Search, ShoppingCart, X } from 'lucide-react';
import { useCartStore } from '../stores/cartStore';
import { useProductsStore } from '../stores/productsStore';

export default function Navbar() {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const totalItems = useCartStore((state) => state.getTotalItems());
  const categories = useProductsStore((state) => state.categories);
  const searchTerm = useProductsStore((state) => state.searchTerm);
  const setSearchTerm = useProductsStore((state) => state.setSearchTerm);
  const setSelectedCategory = useProductsStore((state) => state.setSelectedCategory);
  const fetchProducts = useProductsStore((state) => state.fetchProducts);

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

  return (
    <nav className="sticky top-0 z-40 border-b border-slate-200 bg-white/80 backdrop-blur">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-3 text-slate-900">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-white">
              <Cpu className="h-5 w-5" />
            </span>
            <span className="text-lg font-semibold tracking-wide">Hardware Kit</span>
          </Link>

          <div className="hidden md:flex w-full max-w-md items-center rounded-full border border-slate-200 bg-white px-4 py-2 shadow-sm">
            <Search className="mr-3 h-4 w-4 text-slate-400" />
            <input
              type="search"
              placeholder="Buscar CPU, GPU, RAM..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full border-none bg-transparent text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/cart"
              className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 transition hover:border-slate-300 hover:text-slate-900"
            >
              <ShoppingCart className="h-5 w-5" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-white">
                  {totalItems}
                </span>
              )}
            </Link>

            <button
              onClick={() => setIsMenuOpen(true)}
              className="md:hidden inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700"
              aria-label="Abrir menu"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="hidden md:flex items-center justify-between py-4">
          <div className="flex items-center gap-2 overflow-x-auto">
            <button
              onClick={() => handleCategoryChange(null)}
              className="rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
            >
              Todos
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => handleCategoryChange(category.slug)}
                className="rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-900 hover:text-white"
              >
                {category.name}
              </button>
            ))}
          </div>

          <Link
            to="/pc-builder"
            className="inline-flex items-center rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-900 hover:text-slate-900"
          >
            PC Builder
          </Link>
        </div>
      </div>

      {isMenuOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 px-6 py-8 md:hidden">
          <div className="mx-auto w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-base font-semibold text-slate-900">Navegacion</span>
              <button
                onClick={() => setIsMenuOpen(false)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200"
                aria-label="Cerrar menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mb-4 flex items-center rounded-full border border-slate-200 bg-white px-4 py-2">
              <Search className="mr-3 h-4 w-4 text-slate-400" />
              <input
                type="search"
                placeholder="Buscar producto"
                value={searchTerm}
                onChange={handleSearchChange}
                className="w-full border-none bg-transparent text-sm text-slate-700 focus:outline-none"
              />
            </div>

            <div className="space-y-2">
              <button
                onClick={() => handleCategoryChange(null)}
                className="w-full rounded-xl bg-slate-900 px-4 py-3 text-left text-sm font-medium text-white"
              >
                Todos los productos
              </button>
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => handleCategoryChange(category.slug)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-left text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  {category.name}
                </button>
              ))}
              <Link
                to="/pc-builder"
                onClick={() => setIsMenuOpen(false)}
                className="block rounded-xl border border-slate-200 px-4 py-3 text-center text-sm font-medium text-slate-700"
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