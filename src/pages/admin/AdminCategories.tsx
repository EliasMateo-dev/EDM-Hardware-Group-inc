import React, { useEffect, useState } from "react";
import { useNotificationStore } from "../../stores/useNotificationStore";
import { supabase } from "../../utils/supabase";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon?: string;
}

const AdminCategories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const { showNotification } = useNotificationStore();

  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      const { data, error } = await supabase.from("categories").select("id, name, slug, description, icon");
      if (error) {
        showNotification("Error al cargar categorías", "error");
      } else {
        setCategories(data || []);
      }
      setLoading(false);
    };
    fetchCategories();
  }, [showNotification]);

  const handleDelete = async (id: string) => {
    if (!window.confirm("¿Seguro que deseas eliminar esta categoría?")) return;
    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (error) {
      showNotification("Error al eliminar categoría", "error");
    } else {
      setCategories((prev) => prev.filter((c) => c.id !== id));
      showNotification("Categoría eliminada", "success");
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Categorías</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white dark:bg-gray-800 border rounded">
          <thead>
            <tr>
              <th className="px-4 py-2">Nombre</th>
              <th className="px-4 py-2">Slug</th>
              <th className="px-4 py-2">Descripción</th>
              <th className="px-4 py-2">Icono</th>
              <th className="px-4 py-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="text-center py-6">Cargando...</td>
              </tr>
            ) : categories.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-6">No hay categorías</td>
              </tr>
            ) : (
              categories.map((c) => (
                <tr key={c.id} className="border-t">
                  <td className="px-4 py-2">{c.name}</td>
                  <td className="px-4 py-2">{c.slug}</td>
                  <td className="px-4 py-2">{c.description}</td>
                  <td className="px-4 py-2">{c.icon || "-"}</td>
                  <td className="px-4 py-2 flex gap-2">
                    <a href={`/admin/categories/edit/${c.id}`} className="text-blue-600 hover:underline">Editar</a>
                    <button onClick={() => handleDelete(c.id)} className="text-red-600 hover:underline">Eliminar</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <div className="mt-4">
        <a href="/admin/categories/new" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Nueva Categoría</a>
      </div>
    </div>
  );
};

export default AdminCategories;
