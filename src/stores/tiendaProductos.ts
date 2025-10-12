import { create } from 'zustand';
import type { Product, Category } from '../utils/supabase';
import { supabase } from '../utils/supabase';
import { useNotificationStore } from './useNotificationStore';

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
    try {
      let categoriaId: string | null = null;
      if (aliasCategoria) {
        // Buscar el id de la categoría por alias
        const { data: cats, error: catsErr } = await supabase.from('categories').select('id, slug');
        if (catsErr) throw catsErr;
        categoriaId = cats?.find((c) => c.slug === aliasCategoria)?.id ?? null;
      }
      let query = supabase.from('products').select('*').eq('is_active', true);
      if (categoriaId) query = query.eq('category_id', categoriaId);
      const { data, error } = await query;
      if (error) throw error;
      establecer({
        productos: data || [],
        categoriaSeleccionada: aliasCategoria ?? null,
        cargando: false,
      });
    } catch (err: any) {
      console.error('cargarProductos error', err);
      try { showNotification && showNotification('Error al cargar productos', 'error'); } catch {}
      // ensure state updated
      establecer({ cargando: false });
    }
  },

  cargarCategorias: async () => {
    const { showNotification } = useNotificationStore.getState();
    try {
      const { data, error } = await supabase.from('categories').select('*');
      if (error) throw error;
      establecer({ categorias: data || [] });
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
