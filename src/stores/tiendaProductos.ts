import { create } from 'zustand';
import type { Product, Category } from '../utils/supabase';
import { supabase } from '../utils/supabase';
import { useNotificationStore } from './useNotificationStore';

  // Helper para aplicar timeout a una operación async y evitar esperas infinitas
const withTimeout = async <T,>(p: Promise<T>, ms = 15000): Promise<T> => {
  let timer: any;
  const timeout = new Promise<never>((_, rej) => {
    timer = setTimeout(() => rej(new Error('timeout')), ms);
  });
  try {
    return await Promise.race([p, timeout]);
  } finally {
    clearTimeout(timer);
  }
};

interface EstadoProductos {
  productos: Product[];
  categorias: Category[];
  cargando: boolean;
  categoriaSeleccionada: string | null;
  terminoBusqueda: string;
  lastError?: string | null;
  cargarProductos: (aliasCategoria?: string | null) => Promise<void>;
  cargarCategorias: () => Promise<void>;
  clearLastError: () => void;
  establecerCategoriaSeleccionada: (aliasCategoria: string | null) => void;
  establecerTerminoBusqueda: (termino: string) => void;
  obtenerProductosFiltrados: () => Product[];

}

export const useTiendaProductos = create<EstadoProductos>((establecer, obtener) => ({
  productos: [],
  categorias: [],
  cargando: false,
  lastError: null,
  clearLastError: () => { establecer({ lastError: null }); },
  categoriaSeleccionada: null,
  terminoBusqueda: '',

  cargarProductos: async (aliasCategoria) => {
    const { showNotification } = useNotificationStore.getState();
  // Versionado de requests para evitar condiciones de carrera cuando el usuario cambia rápido de categoría
  // Guardamos el id de la última petición en una variable a nivel de módulo fuera del cierre del store.
  // Creamos (o reutilizamos) un contador en la propiedad de la función.
    // @ts-ignore
    if (typeof useTiendaProductos._productosReqId === 'undefined') useTiendaProductos._productosReqId = 0;
    // incrementar y capturar este id de petición
    // @ts-ignore
    const reqId = ++useTiendaProductos._productosReqId;
  console.debug('[tiendaProductos] iniciar cargarProductos', { aliasCategoria, reqId });
  // marcar carga para la petición más reciente
    establecer({ cargando: true });
    const watchdog = setTimeout(() => {
    console.warn('cargarProductos watchdog triggered — clearing cargando flag', { reqId });
  // solo limpiar el flag de carga si esta sigue siendo la petición más reciente
  // @ts-ignore
      if (useTiendaProductos._productosReqId === reqId) establecer({ cargando: false });
    }, 15000);

    try {
      let categoriaId: string | null = null;
      if (aliasCategoria) {
        // Buscar el id de la categoría por alias
        const catsRes: any = await withTimeout((async () => await supabase.from('categories').select('id, slug'))());
        if (catsRes?.error) throw catsRes.error;
        const cats = catsRes.data;
        categoriaId = cats?.find((c: any) => c.slug === aliasCategoria)?.id ?? null;
      }
      let queryBuilder = supabase.from('products').select('*').eq('is_active', true);
      if (categoriaId) queryBuilder = queryBuilder.eq('category_id', categoriaId);
      const productosRes: any = await withTimeout((async () => await queryBuilder)());
      if (productosRes?.error) throw productosRes.error;
      const data = productosRes.data;
      clearTimeout(watchdog);
  // Solo actualizar el estado si esta respuesta pertenece a la última petición
      // @ts-ignore
      if (useTiendaProductos._productosReqId === reqId) {
        establecer({
          productos: data || [],
          categoriaSeleccionada: aliasCategoria ?? null,
          cargando: false,
          lastError: null,
        });
  console.debug('[tiendaProductos] cargarProductos exitosa', { reqId, count: (data || []).length });
      } else {
  console.debug('[tiendaProductos] respuesta ignorada (obsoleta)', { reqId });
      }
    } catch (err: any) {
      console.error('cargarProductos error', err, { reqId });
      try { showNotification && showNotification('Error al cargar productos', 'error'); } catch {}
      clearTimeout(watchdog);
  // Solo establecer el estado de error si esta sigue siendo la última petición
      // @ts-ignore
      if (useTiendaProductos._productosReqId === reqId) {
        const msg = err?.message || String(err);
        // Si fue un timeout, mantener los productos existentes (no vaciar) pero exponer el error
              if (msg === 'timeout') {
                console.warn('cargarProductos timed out, preserving existing productos', { reqId });
                establecer({ cargando: false, lastError: 'timeout' });
              } else {
                establecer({ productos: [], categoriaSeleccionada: null, cargando: false, lastError: msg });
              }
      }
    }
  },

  cargarCategorias: async () => {
    const { showNotification } = useNotificationStore.getState();
    try {
      const res: any = await withTimeout((async () => await supabase.from('categories').select('*'))());
      if (res?.error) throw res.error;
      establecer({ categorias: res.data || [] });
    } catch (err) {
      console.error('cargarCategorias error', err);
      try { showNotification && showNotification('Error al cargar categorías', 'error'); } catch {}
      establecer({ categorias: [] });
    }
  },

  establecerCategoriaSeleccionada: (aliasCategoria) => {
    establecer({ categoriaSeleccionada: aliasCategoria });
  },

  establecerTerminoBusqueda: (termino) => {
    establecer({ terminoBusqueda: termino });
  },

  obtenerProductosFiltrados: () => {
    const { productos, terminoBusqueda } = obtener();
    if (!terminoBusqueda.trim()) {
      return productos;
    }
    const termino = terminoBusqueda.toLowerCase();
    return productos.filter((producto) => {
      // Buscar en campos principales
      const campos = [
        producto.name,
        producto.brand,
        producto.model,
        producto.description,
      ];
      // Buscar en especificaciones si existen
      if (producto.specifications && typeof producto.specifications === 'object') {
        for (const valor of Object.values(producto.specifications)) {
          if (typeof valor === 'string' && valor.toLowerCase().includes(termino)) {
            return true;
          }
        }
      }
      return campos.some(
        (campo) => typeof campo === 'string' && campo.toLowerCase().includes(termino)
      );
    });
  },
}));
