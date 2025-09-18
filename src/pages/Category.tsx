import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useProductsStore } from '../stores/productsStore';
import ProductCard from '../components/ProductCard';

export default function Category() {
  const { slug } = useParams<{ slug: string }>();
  const fetchProducts = useProductsStore((state) => state.fetchProducts);
  const categories = useProductsStore((state) => state.categories);
  const loading = useProductsStore((state) => state.loading);
  const getFilteredProducts = useProductsStore((state) => state.getFilteredProducts);
  const products = getFilteredProducts();

  useEffect(() => {
    fetchProducts(slug ?? null);
  }, [fetchProducts, slug]);

  const currentCategory = categories.find((category) => category.slug === slug);

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <header className="mb-10 space-y-3">
        <p className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Categoria</p>
        <h1 className="text-4xl font-semibold text-slate-900 dark:text-slate-100">
          {currentCategory?.name ?? 'Componentes'}
        </h1>
        {currentCategory?.description && (
          <p className="max-w-2xl text-sm text-slate-500 dark:text-slate-400">{currentCategory.description}</p>
        )}
      </header>

      {loading ? (
        <div className="flex min-h-[240px] items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-white transition-colors dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-3 text-sm font-medium text-slate-500 dark:text-slate-400">
            <Loader2 className="h-5 w-5 animate-spin" />
            Cargando componentes...
          </div>
        </div>
      ) : products.length === 0 ? (
        <div className="flex min-h-[240px] items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-white transition-colors dark:border-slate-800 dark:bg-slate-900">
          <p className="text-sm text-slate-500 dark:text-slate-400">No hay productos disponibles en esta categoria.</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </section>
  );
}
