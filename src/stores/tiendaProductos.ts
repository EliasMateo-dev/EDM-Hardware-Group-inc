import { create } from 'zustand';
import type { Product, Category } from '../utils/supabase';
import { supabase } from '../utils/supabase';
import { useNotificationStore } from './useNotificationStore';

// Helper to apply a timeout to an async operation so callers don't await forever
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
    // request-versioning to avoid races when user navigates quickly between categories
    // We store the latest request id in a module-scoped variable outside the store closure.
    // Create (or reuse) a counter on the function object.
    // @ts-ignore
    if (typeof useTiendaProductos._productosReqId === 'undefined') useTiendaProductos._productosReqId = 0;
    // increment and capture this request id
    // @ts-ignore
    const reqId = ++useTiendaProductos._productosReqId;
    console.debug('[tiendaProductos] cargarProductos start', { aliasCategoria, reqId });
    // mark loading for the latest request
    establecer({ cargando: true });
    const watchdog = setTimeout(() => {
      console.warn('cargarProductos watchdog triggered — clearing cargando flag', { reqId });
      // only clear loading if this is still the latest request
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
      // Only update state if this response belongs to the latest request
      // @ts-ignore
      if (useTiendaProductos._productosReqId === reqId) {
        establecer({
          productos: data || [],
          categoriaSeleccionada: aliasCategoria ?? null,
          cargando: false,
          lastError: null,
        });
        console.debug('[tiendaProductos] cargarProductos success', { reqId, count: (data || []).length });
      } else {
        console.debug('[tiendaProductos] cargarProductos response ignored (stale)', { reqId });
      }
    } catch (err: any) {
      console.error('cargarProductos error', err, { reqId });
      try { showNotification && showNotification('Error al cargar productos', 'error'); } catch {}
      clearTimeout(watchdog);
      // Only set error state if this is still the latest request
      // @ts-ignore
      if (useTiendaProductos._productosReqId === reqId) {
        const msg = err?.message || String(err);
        // If it was a timeout, keep existing productos (don't wipe) but expose the error
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
