import React, { useState, useEffect } from "react";
import { useNotificationStore } from "../../stores/useNotificationStore";
import { supabase } from "../../utils/supabase";
import { useNavigate, useParams } from "react-router-dom";

interface UserForm {
  email: string;
  full_name?: string;
  is_admin: boolean;
}

const initialState: UserForm = {
  email: "",
  full_name: "",
  is_admin: false,
};

const AdminUserForm: React.FC = () => {
  const [form, setForm] = useState<UserForm>(initialState);
  const [loading, setLoading] = useState(false);
  const { showNotification } = useNotificationStore();
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    if (id) {
      const load = async () => {
        setLoading(true);
        try {
          const { data, error } = await supabase.from("profiles").select("email, full_name, is_admin").eq("id", id).single();
          if (error) {
            showNotification("Error al cargar usuario", "error");
          } else if (data) {
            setForm(data);
          }
        } catch (err) {
          console.error('AdminUserForm load error', err);
          try { showNotification('Error al cargar usuario', 'error'); } catch {}
        } finally {
          setLoading(false);
        }
      };
      load();
    }
  }, [id, showNotification]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (id) {
        const { error } = await supabase.from("profiles").update(form).eq("id", id);
        if (error) {
          showNotification("Error al actualizar usuario", "error");
        } else {
          showNotification("Usuario actualizado", "success");
          navigate("/admin/users");
        }
      } else {
        const { error } = await supabase.from("profiles").insert([form]);
        if (error) {
          showNotification("Error al crear usuario", "error");
        } else {
          showNotification("Usuario creado", "success");
          navigate("/admin/users");
        }
      }
    } catch (err) {
      console.error('AdminUserForm submit error', err);
      try { showNotification('Error al guardar usuario', 'error'); } catch {}
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-lg mx-auto bg-white dark:bg-gray-800 p-6 rounded shadow">
      <h1 className="text-2xl font-bold mb-4">{id ? "Editar Usuario" : "Nuevo Usuario"}</h1>
      <div className="mb-4">
        <label className="block mb-1">Email</label>
        <input name="email" value={form.email} onChange={handleChange} className="w-full px-3 py-2 border rounded" required type="email" />
      </div>
      <div className="mb-4">
        <label className="block mb-1">Nombre completo</label>
        <input name="full_name" value={form.full_name} onChange={handleChange} className="w-full px-3 py-2 border rounded" />
      </div>
      <div className="mb-4 flex items-center gap-2">
        <input name="is_admin" type="checkbox" checked={form.is_admin} onChange={handleChange} id="is_admin" />
        <label htmlFor="is_admin">Administrador</label>
      </div>
      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700" disabled={loading}>
        {loading ? "Guardando..." : id ? "Actualizar" : "Crear"}
      </button>
    </form>
  );
};

export default AdminUserForm;
