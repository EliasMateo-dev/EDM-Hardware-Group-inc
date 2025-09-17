import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Loader2 } from 'lucide-react';
import { useProductsStore } from '../stores/productsStore';
import ProductCard from '../components/ProductCard';

export default function Home() {
  const fetchProducts = useProductsStore((state) => state.fetchProducts);
  const setSelectedCategory = useProductsStore((state) => state.setSelectedCategory);
  const categories = useProductsStore((state) => state.categories);
  const loading = useProductsStore((state) => state.loading);
  const getFilteredProducts = useProductsStore((state) => state.getFilteredProducts);
  const products = getFilteredProducts();

  useEffect(() => {
    setSelectedCategory(null);
    fetchProducts(null);
  }, [fetchProducts, setSelectedCategory]);

  return (
    <div className="space-y-12 pb-16">
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-slate-900 p-10 text-white shadow-lg sm:p-16">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl space-y-4">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">PRÓXIMA ENTREGA!</p>
              <h1 className="text-4xl font-semibold leading-tight sm:text-5xl">
                Contruí la PC de tus sueños en EDM
              </h1>
              <p className="text-sm text-slate-300">
                Componentes seleccionados: CPU, motherboards, memoria RAM, graficas, fuentes, gabinetes y SSD. 
              </p>
            </div>
            <Link
              to="/pc-builder"
              className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-medium text-slate-900 transition hover:bg-slate-200"
            >
              Ver PC Builder
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-10 flex flex-wrap gap-2">
            {categories.map((category) => (
              <Link
                key={category.id}
                to={`/category/${category.slug}`}
                className="rounded-full border border-white/20 px-4 py-2 text-xs font-medium text-slate-200 transition hover:bg-white hover:text-slate-900"
              >
                {category.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <header className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">Componentes destacados:</h2>
            <p className="text-sm text-slate-500"></p>
          </div>
          <p className="text-sm text-slate-400">{products.length} productos disponibles</p>
        </header>

        {loading ? (
          <div className="flex min-h-[280px] items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-white">
            <div className="flex items-center gap-3 text-sm font-medium text-slate-500">
              <Loader2 className="h-5 w-5 animate-spin" />
              Cargando catalogo...
            </div>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}