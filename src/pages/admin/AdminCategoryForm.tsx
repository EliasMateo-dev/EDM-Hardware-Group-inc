import React, { useState, useEffect } from "react";
import { useNotificationStore } from "../../stores/useNotificationStore";
import { supabase } from "../../utils/supabase";
import { useNavigate, useParams } from "react-router-dom";

interface CategoryForm {
  name: string;
  slug: string;
  description: string;
  icon?: string;
}

const initialState: CategoryForm = {
  name: "",
  slug: "",
  description: "",
  icon: "",
};

const AdminCategoryForm: React.FC = () => {
  const [form, setForm] = useState<CategoryForm>(initialState);
  const [loading, setLoading] = useState(false);
  const { showNotification } = useNotificationStore();
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    if (id) {
      const load = async () => {
        setLoading(true);
        try {
          const { data, error } = await supabase.from("categories").select("name, slug, description, icon").eq("id", id).single();
          if (error) {
            showNotification("Error al cargar categoría", "error");
          } else if (data) {
            setForm(data);
          }
        } catch (err) {
          console.error('AdminCategoryForm load error', err);
          try { showNotification('Error al cargar categoría', 'error'); } catch {}
        } finally {
          setLoading(false);
        }
      };
      load();
    }
  }, [id, showNotification]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const withTimeout = async <T,>(p: Promise<T>, ms = 15000): Promise<T> => {
        let timer: any;
        const timeout = new Promise<never>((_, rej) => {
          timer = setTimeout(() => rej(new Error('timeout')), ms);
        });
        try { return await Promise.race([p, timeout]); } finally { clearTimeout(timer); }
      };

      if (id) {
        try {
          const res: any = await withTimeout(Promise.resolve(supabase.from("categories").update(form).eq("id", id).then((r:any)=>r)));
          const { error } = res || {};
          if (error) { showNotification("Error al actualizar categoría", "error"); }
          else { showNotification("Categoría actualizada", "success"); navigate("/admin/categories"); }
        } catch (err: any) {
          console.warn('AdminCategoryForm update failed or timed out', err);
          if (err?.message === 'timeout') { try { showNotification('La operación tardó demasiado. Intenta de nuevo.', 'error'); } catch {} }
          else { try { showNotification('Error al actualizar categoría', 'error'); } catch {} }
        }
      } else {
        try {
          const res: any = await withTimeout(Promise.resolve(supabase.from("categories").insert([form]).then((r:any)=>r)));
          const { error } = res || {};
          if (error) { showNotification("Error al crear categoría", "error"); }
          else { showNotification("Categoría creada", "success"); navigate("/admin/categories"); }
        } catch (err: any) {
          console.warn('AdminCategoryForm insert failed or timed out', err);
          if (err?.message === 'timeout') { try { showNotification('La operación tardó demasiado. Intenta de nuevo.', 'error'); } catch {} }
          else { try { showNotification('Error al crear categoría', 'error'); } catch {} }
        }
      }
    } catch (err) {
      console.error('AdminCategoryForm submit error', err);
      if ((err as any)?.message === 'timeout') { try { showNotification('La operación tardó demasiado. Intenta de nuevo.', 'error'); } catch {} }
      else { try { showNotification('Error al guardar categoría', 'error'); } catch {} }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-lg mx-auto bg-white dark:bg-gray-800 p-6 rounded shadow">
      <h1 className="text-2xl font-bold mb-4">{id ? "Editar Categoría" : "Nueva Categoría"}</h1>
      <div className="mb-4">
        <label className="block mb-1">Nombre</label>
        <input name="name" value={form.name} onChange={handleChange} className="w-full px-3 py-2 border rounded" required />
      </div>
      <div className="mb-4">
        <label className="block mb-1">Slug</label>
        <input name="slug" value={form.slug} onChange={handleChange} className="w-full px-3 py-2 border rounded" required />
      </div>
      <div className="mb-4">
        <label className="block mb-1">Descripción</label>
        <textarea name="description" value={form.description} onChange={handleChange} className="w-full px-3 py-2 border rounded" required />
      </div>
      <div className="mb-4">
        <label className="block mb-1">Icono (opcional)</label>
        <input name="icon" value={form.icon} onChange={handleChange} className="w-full px-3 py-2 border rounded" />
      </div>
          <div className="flex items-center gap-3">
            <button type="submit" className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition" disabled={loading}>
              {loading ? "Guardando..." : id ? "Actualizar" : "Crear"}
            </button>
            <button type="button" onClick={() => navigate('/admin/categories')} className="inline-flex items-center px-4 py-2 border border-slate-200 rounded hover:bg-slate-50 transition">
              Cancelar
            </button>
          </div>
    </form>
  );
};

export default AdminCategoryForm;
