import { create } from 'zustand';
import { supabase } from '../utils/supabase';
import type { Product, Category } from '../utils/supabase';

// Mapear tipos de Supabase a tipos locales
export interface Categoria {
  id: string;
  nombre: string;
  alias: string;
  descripcion?: string;
  icono?: string;
}

export interface Producto {
  id: string;
  nombre: string;
  alias: string;
  categoriaId: string;
  marca: string;
  modelo: string;
  descripcion: string;
  precio: number;
  existencias: number;
  imagen: string;
  especificaciones: Record<string, string>;
}

// Función para mapear categoría de Supabase a formato local
const mapearCategoria = (categoria: Category): Categoria => ({
  id: categoria.id,
  nombre: categoria.name,
  alias: categoria.slug,
  descripcion: categoria.description || undefined,
  icono: categoria.icon || undefined,
});

// Función para mapear producto de Supabase a formato local
const mapearProducto = (producto: Product): Producto => ({
  id: producto.id,
  nombre: producto.name,
  alias: producto.name.toLowerCase().replace(/\s+/g, '-'),
  categoriaId: producto.category_id,
  marca: producto.brand,
  modelo: producto.model,
  descripcion: producto.description || '',
  precio: producto.price,
  existencias: producto.stock,
  imagen: producto.image_url || 'https://images.pexels.com/photos/163100/circuit-circuit-board-resistor-computer-163100.jpeg',
  especificaciones: producto.specifications || {},
});

interface EstadoProductos {
  productos: Producto[];
  categorias: Categoria[];
  cargando: boolean;
  error: string | null;
  categoriaSeleccionada: string | null;
  terminoBusqueda: string;
  cargarProductos: (aliasCategoria?: string | null) => Promise<void>;
  cargarCategorias: () => Promise<void>;
  establecerCategoriaSeleccionada: (aliasCategoria: string | null) => void;
  establecerTerminoBusqueda: (termino: string) => void;
  obtenerProductosFiltrados: () => Producto[];
  obtenerProductoPorId: (id: string) => Producto | undefined;
}

export const useTiendaProductos = create<EstadoProductos>((establecer, obtener) => ({
  productos: [],
  categorias: [],
  cargando: false,
  error: null,
  categoriaSeleccionada: null,
  terminoBusqueda: '',

  cargarProductos: async (aliasCategoria) => {
    establecer({ cargando: true, error: null });

    try {
      let query = supabase
        .from('products')
        .select(`
          *,
          categories (
            id,
            name,
            slug,
            description,
            icon
          )
        `)
        .eq('is_active', true)
        .order('name');

      // Filtrar por categoría si se especifica
      if (aliasCategoria) {
        const { data: categoria } = await supabase
          .from('categories')
          .select('id')
          .eq('slug', aliasCategoria)
          .single();

        if (categoria) {
          query = query.eq('category_id', categoria.id);
        }
      }

      const { data: productos, error } = await query;

      if (error) {
        throw error;
      }

      const productosFormateados = (productos || []).map(mapearProducto);

      establecer({
        productos: productosFormateados,
        categoriaSeleccionada: aliasCategoria,
        cargando: false,
        error: null,
      });
    } catch (error) {
      console.error('Error cargando productos:', error);
      establecer({
        productos: [],
        cargando: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
      });
    }
  },

  cargarCategorias: async () => {
    try {
      const { data: categorias, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (error) {
        throw error;
      }

      const categoriasFormateadas = (categorias || []).map(mapearCategoria);
      establecer({ categorias: categoriasFormateadas });
    } catch (error) {
      console.error('Error cargando categorías:', error);
      establecer({ error: error instanceof Error ? error.message : 'Error cargando categorías' });
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
    return productos.filter((producto) =>
      producto.nombre.toLowerCase().includes(termino) ||
      producto.marca.toLowerCase().includes(termino) ||
      producto.modelo.toLowerCase().includes(termino) ||
      producto.descripcion.toLowerCase().includes(termino)
    );
  },

  obtenerProductoPorId: (id: string) => {
    return obtener().productos.find(producto => producto.id === id);
  },
}));