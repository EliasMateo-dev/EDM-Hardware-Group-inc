import React, { useState, useEffect } from "react";
import { useNotificationStore } from "../../stores/useNotificationStore";
import { supabase } from "../../utils/supabase";
import { useNavigate, useParams } from "react-router-dom";

interface ProductForm {
  name: string;
  brand: string;
  model: string;
  description: string;
  price: number;
  stock: number;
  category_id: string;
  specifications: string;
  image_url: string;
  is_active: boolean;
}

const initialState: ProductForm = {
  name: "",
  brand: "",
  model: "",
  description: "",
  price: 0,
  stock: 0,
  category_id: "",
  specifications: "",
  image_url: "",
  is_active: true,
};

const AdminProductForm: React.FC = () => {
  const [form, setForm] = useState<ProductForm>(initialState);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<{id: string, name: string}[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const { showNotification } = useNotificationStore();
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    // Cargar categorías para el select
    supabase.from("categories").select("id, name").then(({ data }) => {
      setCategories(data || []);
    });
    if (id) {
      setLoading(true);
      supabase.from("products").select("name, brand, model, description, price, stock, category_id, specifications, image_url, is_active").eq("id", id).single()
        .then(({ data, error }) => {
          if (error) {
            showNotification("Error al cargar producto", "error");
          } else if (data) {
            setForm({
              ...data,
              specifications: typeof data.specifications === "object" ? JSON.stringify(data.specifications, null, 2) : (data.specifications || ""),
            });
          }
          setLoading(false);
        });
    }
  }, [id, showNotification]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    let imageUrl = form.image_url;
    // Subir imagen si hay archivo nuevo
    if (imageFile) {
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
      const { data: uploadData, error: uploadError } = await supabase.storage.from("product-images").upload(fileName, imageFile);
      if (uploadError) {
        showNotification("Error al subir imagen", "error");
        setLoading(false);
        return;
      }
      imageUrl = `${supabase.storageUrl}/object/public/product-images/${fileName}`;
    }
    // Parsear especificaciones si es JSON válido
    let specifications: any = form.specifications;
    try {
      specifications = form.specifications ? JSON.parse(form.specifications) : {};
    } catch {
      showNotification("Especificaciones debe ser JSON válido", "error");
      setLoading(false);
      return;
    }
    const payload = { ...form, image_url: imageUrl, specifications };
    if (id) {
      // Update
      const { error } = await supabase.from("products").update(payload).eq("id", id);
      if (error) {
        showNotification("Error al actualizar producto", "error");
      } else {
        showNotification("Producto actualizado", "success");
        navigate("/admin/products");
      }
    } else {
      // Create
      const { error } = await supabase.from("products").insert([payload]);
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
        <label className="block mb-1">Modelo</label>
        <input name="model" value={form.model} onChange={handleChange} className="w-full px-3 py-2 border rounded" />
      </div>
      <div className="mb-4">
        <label className="block mb-1">Descripción</label>
        <textarea name="description" value={form.description} onChange={handleChange} className="w-full px-3 py-2 border rounded" />
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
        <label className="block mb-1">Categoría</label>
        <select name="category_id" value={form.category_id} onChange={handleChange} className="w-full px-3 py-2 border rounded" required>
          <option value="">Seleccionar...</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
      </div>
      <div className="mb-4">
        <label className="block mb-1">Especificaciones (JSON)</label>
        <textarea name="specifications" value={form.specifications} onChange={handleChange} className="w-full px-3 py-2 border rounded" placeholder='{"color":"negro","peso":"1kg"}' />
      </div>
      <div className="mb-4">
        <label className="block mb-1">Imagen</label>
        <input type="file" accept="image/*" onChange={handleImageChange} className="w-full" />
        {form.image_url && (
          <img src={form.image_url} alt="Imagen actual" className="mt-2 max-h-32" />
        )}
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
