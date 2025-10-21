import React, { useEffect, useState } from "react";
import { useNotificationStore } from "../../stores/useNotificationStore";
import Button from '../../components/Button';
import { Plus } from 'lucide-react';
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
      <h1 className="text-2xl font-bold mb-4 text-center">Categorías</h1>
      <div className="overflow-x-auto card-lift slide-up">
        <table className="min-w-full bg-white dark:bg-gray-800 border rounded">
          <thead>
            <tr>
              <th className="px-4 py-2 text-center">Nombre</th>
              <th className="px-4 py-2 text-center">Slug</th>
              <th className="px-4 py-2 text-center">Descripción</th>
              <th className="px-4 py-2 text-center">Icono</th>
              <th className="px-4 py-2 text-center">Acciones</th>
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
                  <td className="px-4 py-2 text-center">{c.name}</td>
                  <td className="px-4 py-2 text-center">{c.slug}</td>
                  <td className="px-4 py-2 text-center">{c.description}</td>
                  <td className="px-4 py-2 text-center">{c.icon || "-"}</td>
                  <td className="px-4 py-2 text-center align-middle">
                    <div className="flex justify-center gap-2">
                      <Button href={`/admin/categories/edit/${c.id}`} variant="secondary" size="sm">Editar</Button>
                      <Button type="button" variant="danger" size="sm" onClick={() => handleDelete(c.id)}>Eliminar</Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <div className="mt-4">
        <Button href="/admin/categories/new" variant="brand" size="lg" className="inline-flex items-center gap-3" aria-label="Crear nueva categoría">
          <Plus className="-ml-1 w-5 h-5 text-white" aria-hidden />
          <span className="text-sm font-semibold">Nueva Categoría</span>
        </Button>
      </div>
    </div>
  );
};

export default AdminCategories;
