import React, { useEffect, useState } from "react";
import { useNotificationStore } from "../../stores/useNotificationStore";
import { supabase } from "../../utils/supabase";
import { useTiendaAuth } from "../../stores/tiendaAuth";
import { useNavigate } from "react-router-dom";

interface CategoryMap {
  [id: string]: string;
}

interface Product {
  id: string;
  name: string;
  brand: string;
  price: number;
  stock: number;
  category_id: string;
  is_active: boolean;
}

const AdminProducts: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<CategoryMap>({});
  const [loading, setLoading] = useState(true);
  const { showNotification } = useNotificationStore();
  const { perfil, cargando } = useTiendaAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!cargando && (!perfil || !perfil.is_admin)) {
      navigate("/", { replace: true });
    }
  }, [perfil, cargando, navigate]);

  useEffect(() => {
    if (!perfil || !perfil.is_admin) return;

    const fetchAll = async () => {
      setLoading(true);

      const withTimeout = async <T,>(p: Promise<T>, ms = 15000): Promise<T> => {
        let timer: any;
        const timeout = new Promise<never>((_, rej) => {
          timer = setTimeout(() => rej(new Error("timeout")), ms);
        });
        try {
          return await Promise.race([p, timeout]);
        } finally {
          clearTimeout(timer);
        }
      };

      try {
        const prodPromise = supabase.from("products").select("id, name, brand, price, stock, category_id, is_active");
        const catPromise = supabase.from("categories").select("id, name");

        const [prodRes, catRes]: any = await withTimeout(
          Promise.all([prodPromise.then((r: any) => r), catPromise.then((r: any) => r)])
        );

        const { data: prodData, error: prodError } = prodRes || {};
        const { data: catData, error: catError } = catRes || {};

        if (prodError) {
          showNotification("Error al cargar productos", "error");
        } else {
          setProducts(prodData || []);
        }

        if (catError) {
          showNotification("Error al cargar categorías", "error");
        } else {
          const map: CategoryMap = {};
          (catData || []).forEach((c: any) => {
            map[c.id] = c.name;
          });
          setCategories(map);
        }
      } catch (err) {
        console.error("AdminProducts fetchAll error", err);
        try {
          showNotification("Error al cargar datos del administrador", "error");
        } catch {}
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [showNotification, perfil]);

  const handleDelete = async (id: string) => {
    if (!window.confirm("¿Seguro que deseas eliminar este producto?")) return;
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) {
      showNotification("Error al eliminar producto", "error");
    } else {
      setProducts((prev) => prev.filter((p) => p.id !== id));
      showNotification("Producto eliminado", "success");
    }
  };

  // Agrupar productos por categoría
  const grouped = products.reduce((acc: { [cat: string]: Product[] }, prod) => {
    (acc[prod.category_id] = acc[prod.category_id] || []).push(prod);
    return acc;
  }, {});

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Productos</h1>
        <a
          href="/admin/products/new"
          className="inline-flex items-center gap-2 bg-indigo-600 text-white px-3 py-2 rounded hover:bg-indigo-700 transition"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Nuevo Producto
        </a>
      </div>

      {loading ? (
        <div className="text-center py-8 bg-white dark:bg-gray-800 rounded shadow">Cargando...</div>
      ) : products.length === 0 ? (
        <div className="text-center py-8 bg-white dark:bg-gray-800 rounded shadow">No hay productos</div>
      ) : (
        Object.entries(grouped).map(([catId, prods]) => (
          <section key={catId} className="mb-8 bg-white dark:bg-gray-800 rounded shadow-sm overflow-hidden">
            <div className="px-6 py-3 border-b dark:border-gray-700 flex items-center justify-between">
              <h2 className="text-lg font-semibold">{categories[catId] || catId}</h2>
              <div className="text-sm text-gray-500">{prods.length} items</div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-900">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Marca</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Precio</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Stock</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Activo</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Acciones</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-100 dark:divide-gray-700">
                  {prods.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-gray-900 transition">
                      <td className="px-4 py-3 align-middle">{p.name}</td>
                      <td className="px-4 py-3 align-middle text-sm text-gray-600 dark:text-gray-300">{p.brand}</td>
                      <td className="px-4 py-3 align-middle text-right font-mono">${p.price}</td>
                      <td className="px-4 py-3 align-middle text-right">{p.stock}</td>
                      <td className="px-4 py-3 align-middle text-center">
                        {p.is_active ? <span className="text-green-600 font-semibold">Sí</span> : <span className="text-red-500">No</span>}
                      </td>
                      <td className="px-4 py-3 align-middle text-center">
                        <div className="inline-flex items-center gap-2">
                          <a
                            href={`/admin/products/edit/${p.id}`}
                            className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition"
                          >
                            Editar
                          </a>
                          <button
                            onClick={() => handleDelete(p.id)}
                            className="inline-flex items-center gap-2 px-3 py-1.5 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition"
                          >
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ))
      )}
    </div>
  );
};

export default AdminProducts;
