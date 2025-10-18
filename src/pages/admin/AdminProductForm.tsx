import React, { useState, useEffect, useRef } from "react";
import { useNotificationStore } from "../../stores/useNotificationStore";
import { supabase } from "../../utils/supabase";
import { useNavigate, useParams } from "react-router-dom";
import Button from '../../components/Button';
import { categorias as localCategorias } from "../../data/catalogo";

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
  const [slowBannerVisible, setSlowBannerVisible] = useState(false);
  const lastPayloadRef = useRef<any>(null);
  const lastIsEditRef = useRef<boolean>(false);
  const lastIdRef = useRef<string | undefined>(undefined);
  const lastPendingPromiseRef = useRef<Promise<any> | null>(null);
  const [categories, setCategories] = useState<{id: string, name: string, slug: string}[]>([]);
  const { showNotification } = useNotificationStore();
  const navigate = useNavigate();
  const { id } = useParams();

  // helper de timeout compartido
  const withTimeout = async <T,>(p: Promise<T>, ms = 15000): Promise<T> => {
    let timer: any;
    const timeout = new Promise<never>((_, rej) => { timer = setTimeout(() => rej(new Error('timeout')), ms); });
    try {
      return await Promise.race([p, timeout]);
    } finally { clearTimeout(timer); }
  };

  // marcador para detectar peticiones lentas (2.5s)
  const markSlow = (ms = 2500) => new Promise<void>((resolve) => setTimeout(resolve, ms));

  const performRequest = async (payloadParam: any, isEditParam: boolean, idParam?: string) => {
    if (isEditParam) {
      return await withTimeout(Promise.resolve(supabase.from('products').update(payloadParam).eq('id', idParam)));
    }
    return await withTimeout(Promise.resolve(supabase.from('products').insert([payloadParam])));
  };

  // Handlers for slow-banner actions
  const handleRetry = async () => {
    const payload = lastPayloadRef.current;
    if (!payload) return;
    setSlowBannerVisible(false);
    setLoading(true);
    try {
      const res = await performRequest(payload, lastIsEditRef.current, lastIdRef.current);
      if (res?.error) {
        showNotification('Error en reintento', 'error');
      } else {
        showNotification('Operación completada', 'success');
        navigate('/admin/products');
      }
    } catch (err: any) {
      console.error('Retry request error:', err);
      showNotification(err?.message || 'Error en reintento', 'error');
    } finally {
      setLoading(false);
      lastPendingPromiseRef.current = null;
    }
  };

  const handleKeepWaiting = async () => {
    setSlowBannerVisible(false);
    setLoading(true);
    const p = lastPendingPromiseRef.current;
    if (p) {
      try {
        const r = await p;
        if (r?.error) {
          showNotification('La operación falló', 'error');
        } else {
          showNotification('La operación finalizó', 'success');
          navigate('/admin/products');
        }
      } catch (err) {
        console.error('Background wait error:', err);
        showNotification('Error al completar la operación', 'error');
      } finally {
        lastPendingPromiseRef.current = null;
        setLoading(false);
      }
    } else {
      // no pending promise, just retry
      await handleRetry();
    }
  };

  const handleCancelSlow = () => {
    setSlowBannerVisible(false);
    lastPendingPromiseRef.current = null;
    setLoading(false);
  };

  useEffect(() => {
    // Cargar categorías para el select
    const loadCats = async () => {
      try {
        const { data, error } = await supabase.from("categories").select("id, name, slug");
        if (error) {
          console.error('Error loading categories in AdminProductForm', error);
          setCategories([]);
        } else {
          setCategories(data || []);
        }
      } catch (err) {
        console.error('Unexpected error loading categories in AdminProductForm', err);
        setCategories([]);
      }
    };
    loadCats();
  }, []);


  // Solo para edición: cargar producto existente
  useEffect(() => {
    if (id) {
      const load = async () => {
        setLoading(true);
        try {
          const { data, error } = await supabase.from("products").select("name, brand, model, description, price, stock, category_id, specifications, image_url, is_active").eq("id", id).single();
          if (error) {
            showNotification("Error al cargar producto", "error");
          } else if (data) {
            const { specifications, ...rest } = data as any;
            setForm(rest);
            if (specifications && typeof specifications === "object") {
              setSpecs(Object.entries(specifications).map(([key, value]) => ({ key, value: String(value) })));
            } else {
              setSpecs([]);
            }
          }
        } catch (err) {
          console.error('AdminProductForm load error', err);
          try { showNotification('Error al cargar producto', 'error'); } catch {}
        } finally {
          setLoading(false);
        }
      };
      load();
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

  // Resolver alias/slug de categoría con múltiples candidatos y normalización.
  // Devuelve el alias que exista en defaultSpecsByCategory o null.
  const resolveCategoryAlias = (cat: { id: string; name: string; slug: string } | undefined) => {
    if (!cat) return null;
    const normalize = (s?: string | null) => s ? s.toLowerCase().trim().replace(/\s+/g, '_').replace(/[^a-z0-9_\-]/g, '') : null;
    const candidates: (string | null)[] = [];
    candidates.push(normalize(cat.slug));
    // slug sin prefijo tipo 'cat-' o 'cat_'
    if (cat.slug) {
      candidates.push(normalize(cat.slug.replace(/^cat[-_]/i, '')));
    }
    candidates.push(normalize(cat.id));
    candidates.push(normalize(cat.name));
    // buscar en catálogo local por id o nombre
    const local = localCategorias.find(lc => lc.id === cat.id || lc.nombre.toLowerCase() === (cat.name || '').toLowerCase());
    if (local && local.alias) candidates.push(normalize(local.alias));

  // debug: mostrar candidatos
  console.debug('[AdminProductForm] candidatos alias de categoría:', candidates, 'para categoría:', cat);
    // retornar el primer candidato que tenga specs por defecto
    for (const c of candidates) {
      if (c && defaultSpecsByCategory[c]) {
        console.debug('[AdminProductForm] alias de categoría coincidente:', c);
        return c;
      }
    }
    console.debug('[AdminProductForm] resolveCategoryAlias sin coincidencias');
    return null;
  };

  // Handler específico para el select de categoría: setea form y fuerza las specs por defecto inmediatamente
  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setForm((prev) => ({ ...prev, category_id: value }));
    // Solo setear specs automáticas si NO estamos en modo edición (nuevo producto)
    if (id) return;
    const selected = categories.find(c => c.id === value);
    const alias = resolveCategoryAlias(selected);
  console.debug('[AdminProductForm] handleCategoryChange seleccionado:', selected, 'alias resuelto:', alias);
    if (alias && defaultSpecsByCategory[alias]) {
      setSpecs(defaultSpecsByCategory[alias].map(s => ({ key: s.key, value: '' })));
    } else {
      setSpecs([]);
    }
    setSpecsKey(k => k + 1);
  };

  // Efecto: SIEMPRE que cambia la categoría (y NO es edición), setear specs por defecto de esa categoría
  useEffect(() => {
    if (!id) {
      if (form.category_id && categories.length > 0) {
        const cat = categories.find(c => c.id === form.category_id);
        const alias = resolveCategoryAlias(cat);
  console.debug('[AdminProductForm] efecto cambio de categoría:', { category_id: form.category_id, alias, categoriesLoaded: categories.length });
        if (alias && defaultSpecsByCategory[alias]) {
          setSpecs(defaultSpecsByCategory[alias].map(s => ({ key: s.key, value: '' })));
        } else {
          setSpecs([]);
        }
        setSpecsKey(k => k + 1);
      } else {
        setSpecs([]);
        setSpecsKey(k => k + 1);
      }
    }
  }, [form.category_id, categories, id]);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSlowBannerVisible(false);
    // Build payload
    try {
      const imageUrl = form.image_url;
      const specifications: Record<string, string> = {};
      specs.forEach(({ key, value }) => { if (key && key.trim()) specifications[key.trim()] = value.trim(); });
      const payload = { ...form, image_url: imageUrl, specifications };

    // helper de timeout compartido
      // helper de timeout compartido
      

      // perform update or insert using direct await (no extra .then wrappers)
      let res: any = null;
      // run both: request and slow marker
      const reqPromise = performRequest(payload, Boolean(id), id);
      const slowMarker = markSlow(2500);

      const winner = await Promise.race([reqPromise.then(() => 'req' as const), slowMarker.then(() => 'slow' as const)]);
      const wasSlow = winner === 'slow';
      if (wasSlow) {
        // request hasn't finished within 2.5s -> give control to user
        setSlowBannerVisible(true);
        lastPayloadRef.current = payload;
        lastIsEditRef.current = Boolean(id);
        lastIdRef.current = id;
        lastPendingPromiseRef.current = reqPromise;
        // attach background handlers to notify the user when it eventually completes
        reqPromise.then((r) => {
          if (r?.error) {
            showNotification(id ? 'Actualización fallida (resultado final).' : 'Creación fallida (resultado final).', 'error');
          } else {
            showNotification(id ? 'Actualización completada (resultado final).' : 'Creación completada (resultado final).', 'success');
          }
        }).catch((err) => {
          console.error('Background request error after slow:', err);
        }).finally(() => {
          // keep banner visible; user can still act
          lastPendingPromiseRef.current = null;
        });
        // stop here: user decides next action (retry / keep waiting / cancel)
        setLoading(false);
        return;
      } else {
        // request finished quickly
        try {
          res = await reqPromise;
        } catch (err: any) {
          console.error('AdminProductForm quick request error:', err);
          if (err?.message === 'timeout') {
            showNotification(id ? 'La actualización tardó demasiado. Intenta de nuevo.' : 'La creación tardó demasiado. Intenta de nuevo.', 'error');
          } else {
            showNotification(id ? 'Error al actualizar producto' : 'Error al crear producto', 'error');
          }
          return;
        }
      }

  // Si llegamos acá y tenemos res, procesarla. Nota: si slowBannerVisible=true NO navegamos automáticamente; el usuario puede aceptar el resultado desde el banner.
      if (res?.error) {
        console.error('Request response error:', res.error);
        showNotification(id ? 'Error al actualizar producto' : 'Error al crear producto', 'error');
      } else if (res) {
        showNotification(id ? 'Producto actualizado' : 'Producto creado', 'success');
        // Only navigate automatically if the request was NOT slow-detected
        if (!wasSlow) {
          navigate('/admin/products');
        }
      }
    } catch (err) {
      console.error('AdminProductForm unexpected submit error', err);
      const message = (err as any)?.message || 'Error al guardar producto';
      showNotification(message, 'error');
    } finally {
      // always reset loading so UI doesn't get stuck
      setLoading(false);
    }
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
        <select name="category_id" value={form.category_id} onChange={handleCategoryChange} className="w-full px-3 py-2 border rounded" required>
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
        <Button type="button" variant="ghost" onClick={handleAddSpec} className="mt-1">Agregar especificación</Button>
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
      <div className="flex items-center gap-3">
        <Button type="submit" variant="primary" className="px-4 py-2" disabled={loading}>{loading ? "Guardando..." : id ? "Actualizar" : "Crear"}</Button>
        <Button variant="secondary" href="/admin/products" className="px-4 py-2">Cancelar</Button>
      </div>
      {slowBannerVisible && (
        <div className="mt-4 p-4 bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800 rounded">
          <div className="flex items-start justify-between">
            <div>
              <strong>La petición está tardando más de lo esperado.</strong>
              <div className="text-sm">Puedes seguir esperando, reintentar o cancelar.</div>
            </div>
            <div className="flex gap-2">
              <Button variant="primary" onClick={handleRetry} className="px-3 py-1">Reintentar</Button>
              <Button variant="secondary" onClick={handleKeepWaiting} className="px-3 py-1">Seguir esperando</Button>
              <Button variant="ghost" onClick={handleCancelSlow} className="px-3 py-1">Cancelar</Button>
            </div>
          </div>
        </div>
      )}
    </form>
  );
};

export default AdminProductForm;
