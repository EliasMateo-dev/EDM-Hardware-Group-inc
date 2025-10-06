import { create } from 'zustand';
import type { Producto } from '../data/catalogo';
import { obtenerProductoPorId } from '../data/catalogo';

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
    return parseado
      .map(({ productoId, cantidad }) => {
        const producto = obtenerProductoPorId(productoId);
        if (!producto) {
          return null;
        }

        return {
          producto,
          cantidad,
        };
      })
      .filter((elemento): elemento is ElementoCarrito => elemento !== null);
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
  cargarCarrito: () => void;
  agregarAlCarrito: (productoId: string, cantidad?: number) => void;
  eliminarDelCarrito: (productoId: string) => void;
  actualizarCantidad: (productoId: string, cantidad: number) => void;
  vaciarCarrito: () => void;
  obtenerTotalPrecio: () => number;
  obtenerTotalArticulos: () => number;
}

export const useTiendaCarrito = create<EstadoCarrito>((establecer, obtener) => ({
  elementos: [],
  cargando: false,

  cargarCarrito: () => {
    const elementosHidratados = leerCarrito();
    establecer({ elementos: elementosHidratados });
  },

  agregarAlCarrito: (productoId, cantidad = 1) => {
    const producto = obtenerProductoPorId(productoId);
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
