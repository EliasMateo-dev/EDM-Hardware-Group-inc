import { create } from 'zustand';
import type { Categoria, Producto } from '../data/catalogo';
import { categorias as catalogoCategorias, productos as catalogoProductos } from '../data/catalogo';

const esperar = (ms: number) => new Promise((resolver) => setTimeout(resolver, ms));

interface EstadoProductos {
  productos: Producto[];
  categorias: Categoria[];
  cargando: boolean;
  categoriaSeleccionada: string | null;
  terminoBusqueda: string;
  cargarProductos: (aliasCategoria?: string | null) => Promise<void>;
  cargarCategorias: () => Promise<void>;
  establecerCategoriaSeleccionada: (aliasCategoria: string | null) => void;
  establecerTerminoBusqueda: (termino: string) => void;
  obtenerProductosFiltrados: () => Producto[];
}

export const useTiendaProductos = create<EstadoProductos>((establecer, obtener) => ({
  productos: catalogoProductos,
  categorias: catalogoCategorias,
  cargando: false,
  categoriaSeleccionada: null,
  terminoBusqueda: '',

  cargarProductos: async (aliasCategoria) => {
    establecer({ cargando: true });
    await esperar(120);

    establecer((estado) => {
      const proximaCategoria = aliasCategoria ?? estado.categoriaSeleccionada;
      const categoriaId = proximaCategoria
        ? catalogoCategorias.find((categoria) => categoria.alias === proximaCategoria)?.id ?? null
        : null;

      const productosVisibles = categoriaId
        ? catalogoProductos.filter((producto) => producto.categoriaId === categoriaId)
        : catalogoProductos;

      return {
        productos: productosVisibles,
        categoriaSeleccionada: proximaCategoria,
        cargando: false,
      };
    });
  },

  cargarCategorias: async () => {
    establecer({ categorias: catalogoCategorias });
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
      producto.nombre.toLowerCase().includes(termino)
    );
  },
}));
