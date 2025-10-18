import { useState, useEffect } from 'react';
import { supabase, type Product, type Category } from '../utils/supabase';
import { Loader2, Database, AlertCircle } from 'lucide-react';

export default function SupabaseTest() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);

  // Obtener categorías
        const { data: categoriesData, error: categoriesError } = await supabase
          .from('categories')
          .select('*')
          .order('name');

        if (categoriesError) {
          throw categoriesError;
        }

  // Obtener productos
        const { data: productsData, error: productsError } = await supabase
          .from('products')
          .select(`
            *,
            categories (
              name,
              slug
            )
          `)
          .eq('is_active', true)
          .order('name');

        if (productsError) {
          throw productsError;
        }

        setCategories(categoriesData || []);
        setProducts(productsData || []);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);

  if (loading) {
    return (
      <div className="flex min-h-[200px] items-center justify-center rounded-lg border border-slate-200 bg-white p-8 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Cargando datos de Supabase...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 dark:border-red-800 dark:bg-red-900/20">
        <div className="flex items-center gap-2 text-red-800 dark:text-red-300">
          <AlertCircle className="h-5 w-5" />
          <h3 className="font-medium">Error de conexión con Supabase</h3>
        </div>
        <p className="mt-2 text-sm text-red-700 dark:text-red-400">{error}</p>
        <p className="mt-2 text-xs text-red-600 dark:text-red-500">
          Asegúrate de que las variables de entorno VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY estén configuradas correctamente.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-900/20">
        <div className="flex items-center gap-2 text-green-800 dark:text-green-300">
          <Database className="h-5 w-5" />
          <h3 className="font-medium">Conexión con Supabase exitosa</h3>
        </div>
        <p className="mt-1 text-sm text-green-700 dark:text-green-400">
          Se encontraron {categories.length} categorías y {products.length} productos.
        </p>
      </div>

      {categories.length > 0 && (
        <div>
          <h3 className="mb-3 text-lg font-semibold text-slate-900 dark:text-slate-100">
            Categorías desde Supabase
          </h3>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => (
              <div
                key={category.id}
                className="rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900"
              >
                <h4 className="font-medium text-slate-900 dark:text-slate-100">
                  {category.name}
                </h4>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {category.description || 'Sin descripción'}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {products.length > 0 && (
        <div>
          <h3 className="mb-3 text-lg font-semibold text-slate-900 dark:text-slate-100">
            Productos desde Supabase
          </h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {products.slice(0, 6).map((product) => (
              <div
                key={product.id}
                className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="mb-2 flex items-start justify-between">
                  <h4 className="font-medium text-slate-900 dark:text-slate-100">
                    {product.name}
                  </h4>
                  <span className="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                    {product.brand}
                  </span>
                </div>
                <p className="mb-2 text-sm text-slate-600 dark:text-slate-400">
                  {product.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-900 dark:text-slate-100">
                    {formatPrice(product.price)}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    Stock: {product.stock}
                  </span>
                </div>
              </div>
            ))}
          </div>
          {products.length > 6 && (
            <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
              Y {products.length - 6} productos más...
            </p>
          )}
        </div>
      )}
    </div>
  );
}