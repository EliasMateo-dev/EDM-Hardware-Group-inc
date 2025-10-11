import { create } from 'zustand';
import type { Product, Category } from '../utils/supabase';
import { supabase } from '../utils/supabase';

const esperar = (ms: number) => new Promise((resolver) => setTimeout(resolver, ms));

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
    establecer({ cargando: true });
    let categoriaId: string | null = null;
    if (aliasCategoria) {
      // Buscar el id de la categoría por alias
      const { data: cats } = await supabase.from('categories').select('id, slug');
      categoriaId = cats?.find((c) => c.slug === aliasCategoria)?.id ?? null;
    }
    let query = supabase.from('products').select('*').eq('is_active', true);
    if (categoriaId) query = query.eq('category_id', categoriaId);
    const { data, error } = await query;
    establecer({
      productos: data || [],
      categoriaSeleccionada: aliasCategoria ?? null,
      cargando: false,
    });
  },

  cargarCategorias: async () => {
    const { data, error } = await supabase.from('categories').select('*');
    establecer({ categorias: data || [] });
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
