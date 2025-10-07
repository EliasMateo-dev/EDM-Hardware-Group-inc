import { create } from 'zustand';
import type { Producto } from './tiendaProductos';
import { useTiendaProductos } from './tiendaProductos';

const CLAVE_ALMACEN_CARRITO = 'constructorpc-carrito';

interface ElementoCarrito {
  producto: Producto;
  cantidad: number;
}

interface ElementoCarritoAlmacenado {
  productoId: string;
  cantidad: number;
}

const leerCarrito = (): ElementoCarrito[] => {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const crudo = window.localStorage.getItem(CLAVE_ALMACEN_CARRITO);
    if (!crudo) {
      return [];
    }

    const parseado = JSON.parse(crudo) as ElementoCarritoAlmacenado[];
    
    // Retornar solo los IDs y cantidades, los productos se resolverán después
    return parseado.map(({ productoId, cantidad }) => ({
      producto: { id: productoId } as Producto, // Placeholder temporal
      cantidad,
    }));
  } catch (error) {
    console.error('Error al leer el carrito desde el almacenamiento:', error);
    return [];
  }
};

const persistirCarrito = (elementos: ElementoCarrito[]) => {
  if (typeof window === 'undefined') {
    return;
  }

  const carga: ElementoCarritoAlmacenado[] = elementos.map((elemento) => ({
    productoId: elemento.producto.id,
    cantidad: elemento.cantidad,
  }));

  window.localStorage.setItem(CLAVE_ALMACEN_CARRITO, JSON.stringify(carga));
};

interface EstadoCarrito {
  elementos: ElementoCarrito[];
  cargando: boolean;
  cargarCarrito: () => Promise<void>;
  agregarAlCarrito: (productoId: string, cantidad?: number) => void;
  eliminarDelCarrito: (productoId: string) => void;
  actualizarCantidad: (productoId: string, cantidad: number) => void;
  vaciarCarrito: () => void;
  obtenerTotalPrecio: () => number;
  obtenerTotalArticulos: () => number;
  resolverProductos: () => Promise<void>;
}

export const useTiendaCarrito = create<EstadoCarrito>((establecer, obtener) => ({
  elementos: [],
  cargando: false,

  cargarCarrito: async () => {
    establecer({ cargando: true });
    
    try {
      const elementosAlmacenados = leerCarrito();
      
      if (elementosAlmacenados.length === 0) {
        establecer({ elementos: [], cargando: false });
        return;
      }

      // Obtener los productos reales de la tienda
      await obtener().resolverProductos();
    } catch (error) {
      console.error('Error cargando carrito:', error);
      establecer({ elementos: [], cargando: false });
    }
  },

  resolverProductos: async () => {
    const elementosAlmacenados = leerCarrito();
    const productosStore = useTiendaProductos.getState();
    
    // Si no hay productos cargados, cargarlos primero
    if (productosStore.productos.length === 0) {
      await productosStore.cargarProductos();
    }

    const elementosResueltos: ElementoCarrito[] = [];
    
    for (const elemento of elementosAlmacenados) {
      const producto = productosStore.obtenerProductoPorId(elemento.producto.id);
      if (producto) {
        elementosResueltos.push({
          producto,
          cantidad: elemento.cantidad,
        });
      }
    }

    establecer({ elementos: elementosResueltos, cargando: false });
  },

  agregarAlCarrito: (productoId, cantidad = 1) => {
    const productosStore = useTiendaProductos.getState();
    const producto = productosStore.obtenerProductoPorId(productoId);
    
    if (!producto) {
      console.warn('Producto no encontrado para el carrito:', productoId);
      return;
    }

    establecer((estado) => {
      const existente = estado.elementos.find((elemento) => elemento.producto.id === productoId);
      const siguientesElementos = existente
        ? estado.elementos.map((elemento) =>
            elemento.producto.id === productoId
              ? { ...elemento, cantidad: elemento.cantidad + cantidad }
              : elemento
          )
        : [...estado.elementos, { producto, cantidad }];

      persistirCarrito(siguientesElementos);
      return { elementos: siguientesElementos };
    });
  },

  eliminarDelCarrito: (productoId) => {
    establecer((estado) => {
      const siguientesElementos = estado.elementos.filter((elemento) => elemento.producto.id !== productoId);
      persistirCarrito(siguientesElementos);
      return { elementos: siguientesElementos };
    });
  },

  actualizarCantidad: (productoId, cantidad) => {
    if (cantidad <= 0) {
      obtener().eliminarDelCarrito(productoId);
      return;
    }

    establecer((estado) => {
      const siguientesElementos = estado.elementos.map((elemento) =>
        elemento.producto.id === productoId ? { ...elemento, cantidad } : elemento
      );
      persistirCarrito(siguientesElementos);
      return { elementos: siguientesElementos };
    });
  },

  vaciarCarrito: () => {
    persistirCarrito([]);
    establecer({ elementos: [] });
  },

  obtenerTotalPrecio: () => {
    return obtener().elementos.reduce(
      (total, elemento) => total + elemento.producto.precio * elemento.cantidad,
      0
    );
  },

  obtenerTotalArticulos: () => {
    return obtener().elementos.reduce((total, elemento) => total + elemento.cantidad, 0);
  },
}));
