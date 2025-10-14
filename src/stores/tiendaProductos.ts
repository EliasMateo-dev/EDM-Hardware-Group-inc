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
  cargarProductos: (aliasCategoria?: string | null) => Promise<void>;
  cargarCategorias: () => Promise<void>;
  establecerCategoriaSeleccionada: (aliasCategoria: string | null) => void;
  establecerTerminoBusqueda: (termino: string) => void;
  obtenerProductosFiltrados: () => Product[];

}

export const useTiendaProductos = create<EstadoProductos>((establecer, obtener) => ({
  productos: [],
  categorias: [],
  cargando: false,
  categoriaSeleccionada: null,
  terminoBusqueda: '',

  cargarProductos: async (aliasCategoria) => {
    const { showNotification } = useNotificationStore.getState();
    establecer({ cargando: true });
    // watchdog: si por alguna razón el proceso queda colgado, limpiar el flag
    const watchdog = setTimeout(() => {
      console.warn('cargarProductos watchdog triggered — clearing cargando flag');
      establecer({ cargando: false });
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
      establecer({
        productos: data || [],
        categoriaSeleccionada: aliasCategoria ?? null,
        cargando: false,
      });
    } catch (err: any) {
      console.error('cargarProductos error', err);
      try { showNotification && showNotification('Error al cargar productos', 'error'); } catch {}
      // ensure state updated and return safe defaults
      clearTimeout(watchdog);
      establecer({ productos: [], categoriaSeleccionada: null, cargando: false });
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
