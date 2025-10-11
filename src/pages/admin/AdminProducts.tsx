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
      const [{ data: prodData, error: prodError }, { data: catData, error: catError }] = await Promise.all([
        supabase.from("products").select("id, name, brand, price, stock, category_id, is_active"),
        supabase.from("categories").select("id, name")
      ]);
      if (prodError) {
        showNotification("Error al cargar productos", "error");
      } else {
        setProducts(prodData || []);
      }
      if (catError) {
        showNotification("Error al cargar categorías", "error");
      } else {
        const map: CategoryMap = {};
        (catData || []).forEach((c: any) => { map[c.id] = c.name; });
        setCategories(map);
      }
      setLoading(false);
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
      <h1 className="text-2xl font-bold mb-4">Productos</h1>
      {loading ? (
        <div className="text-center py-6">Cargando...</div>
      ) : products.length === 0 ? (
        <div className="text-center py-6">No hay productos</div>
      ) : (
        Object.entries(grouped).map(([catId, prods]) => (
          <div key={catId} className="mb-8">
            <h2 className="text-xl font-semibold mb-2">{categories[catId] || catId}</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white dark:bg-gray-800 border rounded">
                <thead>
                  <tr>
                    <th className="px-4 py-2">Nombre</th>
                    <th className="px-4 py-2">Marca</th>
                    <th className="px-4 py-2">Precio</th>
                    <th className="px-4 py-2">Stock</th>
                    <th className="px-4 py-2">Activo</th>
                    <th className="px-4 py-2">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {prods.map((p) => (
                    <tr key={p.id} className="border-t">
                      <td className="px-4 py-2">{p.name}</td>
                      <td className="px-4 py-2">{p.brand}</td>
                      <td className="px-4 py-2">${p.price}</td>
                      <td className="px-4 py-2">{p.stock}</td>
                      <td className="px-4 py-2">{p.is_active ? "Sí" : "No"}</td>
                      <td className="px-4 py-2 flex gap-2">
                        <a href={`/admin/products/edit/${p.id}`} className="text-blue-600 hover:underline">Editar</a>
                        <button onClick={() => handleDelete(p.id)} className="text-red-600 hover:underline">Eliminar</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))
      )}
      <div className="mt-4">
        <a href="/admin/products/new" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Nuevo Producto</a>
      </div>
    </div>
  );
};

export default AdminProducts;
