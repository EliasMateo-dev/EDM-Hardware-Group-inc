import React, { useState, useEffect } from "react";
import { useNotificationStore } from "../../stores/useNotificationStore";
import { supabase } from "../../utils/supabase";
import { useNavigate, useParams } from "react-router-dom";

interface ProductForm {
  name: string;
  brand: string;
  price: number;
  stock: number;
  category_id: string;
  is_active: boolean;
}

const initialState: ProductForm = {
  name: "",
  brand: "",
  price: 0,
  stock: 0,
  category_id: "",
  is_active: true,
};

const AdminProductForm: React.FC = () => {
  const [form, setForm] = useState<ProductForm>(initialState);
  const [loading, setLoading] = useState(false);
  const { showNotification } = useNotificationStore();
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    if (id) {
      setLoading(true);
      supabase.from("products").select("name, brand, price, stock, category_id, is_active").eq("id", id).single()
        .then(({ data, error }) => {
          if (error) {
            showNotification("Error al cargar producto", "error");
          } else if (data) {
            setForm(data);
          }
          setLoading(false);
        });
    }
  }, [id, showNotification]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    if (id) {
      // Update
      const { error } = await supabase.from("products").update(form).eq("id", id);
      if (error) {
        showNotification("Error al actualizar producto", "error");
      } else {
        showNotification("Producto actualizado", "success");
        navigate("/admin/products");
      }
    } else {
      // Create
      const { error } = await supabase.from("products").insert([form]);
      if (error) {
        showNotification("Error al crear producto", "error");
      } else {
        showNotification("Producto creado", "success");
        navigate("/admin/products");
      }
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-lg mx-auto bg-white dark:bg-gray-800 p-6 rounded shadow">
      <h1 className="text-2xl font-bold mb-4">{id ? "Editar Producto" : "Nuevo Producto"}</h1>
      <div className="mb-4">
        <label className="block mb-1">Nombre</label>
        <input name="name" value={form.name} onChange={handleChange} className="w-full px-3 py-2 border rounded" required />
      </div>
      <div className="mb-4">
        <label className="block mb-1">Marca</label>
        <input name="brand" value={form.brand} onChange={handleChange} className="w-full px-3 py-2 border rounded" required />
      </div>
      <div className="mb-4">
        <label className="block mb-1">Precio</label>
        <input name="price" type="number" value={form.price} onChange={handleChange} className="w-full px-3 py-2 border rounded" required min={0} />
      </div>
      <div className="mb-4">
        <label className="block mb-1">Stock</label>
        <input name="stock" type="number" value={form.stock} onChange={handleChange} className="w-full px-3 py-2 border rounded" required min={0} />
      </div>
      <div className="mb-4">
        <label className="block mb-1">Categoría (ID)</label>
        <input name="category_id" value={form.category_id} onChange={handleChange} className="w-full px-3 py-2 border rounded" required />
      </div>
      <div className="mb-4 flex items-center gap-2">
        <input name="is_active" type="checkbox" checked={form.is_active} onChange={handleChange} id="is_active" />
        <label htmlFor="is_active">Activo</label>
      </div>
      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700" disabled={loading}>
        {loading ? "Guardando..." : id ? "Actualizar" : "Crear"}
      </button>
    </form>
  );
};

export default AdminProductForm;
