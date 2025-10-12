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
  specifications?: { [key: string]: string }; // Cambiado a un objeto
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
  specifications: {}, // Cambiado a un objeto vacío
  image_url: "",
  is_active: true,
};

// Especificaciones por defecto por alias de categoría
const defaultSpecsByCategory: Record<string, { key: string; value: string }[]> = {
  cpu: [
    { key: 'tdp', value: '' },
    { key: 'cores', value: '' },
    { key: 'socket', value: '' },
    { key: 'threads', value: '' },
    { key: 'base_clock', value: '' },
    { key: 'boost_clock', value: '' },
    { key: 'architecture', value: '' },
  ],
  gpu: [
    { key: 'memory', value: '' },
    { key: 'base_clock', value: '' },
    { key: 'cuda_cores', value: '' },
    { key: 'boost_clock', value: '' },
    { key: 'memory_speed', value: '' },
    { key: 'power_consumption', value: '' },
  ],
  motherboard: [
    { key: 'socket', value: '' },
    { key: 'chipset', value: '' },
    { key: 'max_memory', value: '' },
    { key: 'form_factor', value: '' },
    { key: 'memory_type', value: '' },
    { key: 'memory_slots', value: '' },
  ],
  ssd: [
    { key: 'capacity', value: '' },
    { key: 'interface', value: '' },
    { key: 'read_speed', value: '' },
    { key: 'form_factor', value: '' },
    { key: 'write_speed', value: '' },
  ],
  ram: [
    { key: 'kit', value: '' },
    { key: 'type', value: '' },
    { key: 'speed', value: '' },
    { key: 'voltage', value: '' },
    { key: 'capacity', value: '' },
    { key: 'cas_latency', value: '' },
  ],
  case: [
    { key: 'drive_bays', value: '' },
    { key: 'form_factor', value: '' },
    { key: 'fans_included', value: '' },
    { key: 'max_cpu_cooler', value: '' },
    { key: 'max_gpu_length', value: '' },
  ],
  psu: [
    { key: 'modular', value: '' },
    { key: 'wattage', value: '' },
    { key: 'efficiency', value: '' },
    { key: 'pcie_connectors', value: '' },
    { key: 'sata_connectors', value: '' },
  ],
};

const AdminProductForm: React.FC = () => {
  const [form, setForm] = useState<ProductForm>(initialState);
  const [specs, setSpecs] = useState<{ key: string; value: string }[]>([]);
  const [specsKey, setSpecsKey] = useState(0); // Para forzar rerender

  // Manejo de especificaciones dinámicas
  const handleSpecChange = (idx: number, field: 'key' | 'value', value: string) => {
    setSpecs((prev) => prev.map((spec, i) => i === idx ? { ...spec, [field]: value } : spec));
  };

  const handleAddSpec = () => {
    setSpecs((prev) => [...prev, { key: '', value: '' }]);
  };

  const handleRemoveSpec = (idx: number) => {
    setSpecs((prev) => prev.filter((_, i) => i !== idx));
  };
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<{id: string, name: string, slug: string}[]>([]);
  const { showNotification } = useNotificationStore();
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    // Cargar categorías para el select
    supabase.from("categories").select("id, name, slug").then(({ data }) => {
      setCategories(data || []);
    });
  }, []);


  // Solo para edición: cargar producto existente
  useEffect(() => {
    if (id) {
      setLoading(true);
      supabase.from("products").select("name, brand, model, description, price, stock, category_id, specifications, image_url, is_active").eq("id", id).single()
        .then(({ data, error }) => {
          if (error) {
            showNotification("Error al cargar producto", "error");
          } else if (data) {
            const { specifications, ...rest } = data;
            setForm(rest);
            if (specifications && typeof specifications === "object") {
              setSpecs(Object.entries(specifications).map(([key, value]) => ({ key, value: String(value) })));
            } else {
              setSpecs([]);
            }
          }
          setLoading(false);
        });
    }
  }, [id, showNotification]);

  // (Eliminado: ahora el seteo se hace solo en handleChange)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  // Efecto dedicado: cuando cambia la categoría y es nuevo, setear specs por defecto SOLO si specs está vacío
  useEffect(() => {
    if (!id && form.category_id && categories.length > 0 && specs.length === 0) {
      const cat = categories.find(c => c.id === form.category_id);
      if (cat && cat.slug && defaultSpecsByCategory[cat.slug]) {
        setSpecs(defaultSpecsByCategory[cat.slug].map(s => ({ key: s.key, value: '' })));
        setSpecsKey(k => k + 1);
      }
    }
    if (!id && !form.category_id && specs.length > 0) {
      setSpecs([]);
      setSpecsKey(k => k + 1);
    }
  }, [form.category_id, categories, id]);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    let imageUrl = form.image_url;
    // Construir especificaciones desde specs
    let specifications: Record<string, string> = {};
    specs.forEach(({ key, value }) => {
      if (key.trim()) specifications[key.trim()] = value.trim();
    });
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
            <option key={cat.id} value={cat.id} data-slug={cat.slug}>{cat.name}</option>
          ))}
        </select>
      </div>
      <div className="mb-4">
        <label className="block mb-1">Especificaciones</label>
        {specs && specs.length > 0 ? (
          specs.map((spec, idx) => (
            <div key={specsKey + '-' + idx} className="flex gap-2 mb-2">
              <input
                type="text"
                placeholder="Clave"
                value={spec.key}
                onChange={e => handleSpecChange(idx, 'key', e.target.value)}
                className="px-2 py-1 border rounded w-1/2"
                autoComplete="off"
                spellCheck={false}
              />
              <input
                type="text"
                placeholder="Valor "
                value={spec.value}
                onChange={e => handleSpecChange(idx, 'value', e.target.value)}
                className="px-2 py-1 border rounded w-1/2"
                autoComplete="off"
                spellCheck={false}
              />
              <button type="button" onClick={() => handleRemoveSpec(idx)} className="text-red-600">✕</button>
            </div>
          ))
        ) : (
          <div className="text-gray-400 italic mb-2">No hay especificaciones. Agrega una.</div>
        )}
        <button type="button" onClick={handleAddSpec} className="bg-gray-200 px-2 py-1 rounded mt-1">Agregar especificación</button>
      </div>
      <div className="mb-4">
        <label className="block mb-1">Imagen (URL)</label>
        <input name="image_url" value={form.image_url} onChange={handleChange} className="w-full px-3 py-2 border rounded" placeholder="https://..." />
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
