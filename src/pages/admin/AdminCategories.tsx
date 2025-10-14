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
      try {
        const withTimeout = async <T,>(p: Promise<T>, ms = 15000): Promise<T> => {
          let timer: any; const timeout = new Promise<never>((_, rej) => { timer = setTimeout(() => rej(new Error('timeout')), ms); });
          try { return await Promise.race([p, timeout]); } finally { clearTimeout(timer); }
        };
  const res: any = await withTimeout(Promise.resolve(supabase.from("categories").select("id, name, slug, description, icon").then((r:any)=>r)));
        const { data, error } = res || {};
        if (error) { showNotification("Error al cargar categorías", "error"); } else { setCategories(data || []); }
      } catch (err) {
        console.error('AdminCategories fetchCategories error', err);
        try { showNotification('Error al cargar categorías', 'error'); } catch {}
      } finally {
        setLoading(false);
      }
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
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Categorías</h1>
        <a href="/admin/categories/new" className="inline-flex items-center gap-2 bg-indigo-600 text-white px-3 py-2 rounded hover:bg-indigo-700 transition">Nueva Categoría</a>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white dark:bg-gray-800 border rounded">
          <thead>
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Slug</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Descripción</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Icono</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
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
                  <td className="px-4 py-2 text-left font-medium text-slate-900">{c.name}</td>
                  <td className="px-4 py-2 text-left text-sm text-gray-600">{c.slug}</td>
                  <td className="px-4 py-2 text-left text-sm text-gray-600">{c.description}</td>
                  <td className="px-4 py-2 text-left text-sm text-gray-600">{c.icon || "-"}</td>
                  <td className="px-4 py-2 text-left align-middle">
                    <div className="flex items-center gap-2">
                      <a href={`/admin/categories/edit/${c.id}`} className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 text-slate-900 rounded text-sm hover:bg-slate-50 transition">Editar</a>
                      <button onClick={() => handleDelete(c.id)} className="inline-flex items-center gap-2 px-3 py-1.5 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition">Eliminar</button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
    </div>
  );
};

export default AdminCategories;
