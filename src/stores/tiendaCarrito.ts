import { create } from 'zustand';
import type { Product } from '../utils/supabase';
import { useTiendaProductos } from './tiendaProductos';

const CLAVE_ALMACEN_CARRITO = 'constructorpc-carrito';

type ElementoCarrito = {
  producto: import('../utils/supabase').Product;
  cantidad: number;
};

interface ProductSnapshot {
  id: string;
  name: string;
  price: number;
  image_url?: string | null;
  brand?: string;
  model?: string;
}

interface ElementoCarritoAlmacenado {
  productoId: string;
  cantidad: number;
  // keep a small snapshot so cart can be shown even when productos store
  // hasn't loaded yet or product was removed from catalog
  snapshot?: ProductSnapshot;
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
    // Obtener productos actuales del store
    const productos = useTiendaProductos.getState().productos;
    return parseado
      .map(({ productoId, cantidad, snapshot }) => {
        // Prefer the authoritative product from the productos store when available
        const producto = productos.find((p) => p.id === productoId);
        if (producto) return { producto, cantidad };

        // Fallback: if we have a snapshot, create a lightweight Product-shaped object
        if (snapshot) {
          const productoFallback: Product = {
            id: snapshot.id,
            category_id: '',
            name: snapshot.name,
            brand: snapshot.brand || '',
            model: snapshot.model || '',
            description: '',
            price: snapshot.price,
            stock: 0,
            image_url: snapshot.image_url || undefined,
            specifications: {},
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
          return { producto: productoFallback, cantidad };
        }

        // No product and no snapshot -> drop the item
        return null;
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
    snapshot: {
      id: elemento.producto.id,
      name: elemento.producto.name,
      price: elemento.producto.price,
      image_url: elemento.producto.image_url ?? null,
      brand: elemento.producto.brand ?? undefined,
      model: elemento.producto.model ?? undefined,
    },
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
}

export const useTiendaCarrito = create<EstadoCarrito>((establecer, obtener) => ({
  elementos: [],
  cargando: false,

  cargarCarrito: async () => {
    // If productos haven't loaded yet, wait a short while (poll) so we can
    // hydrate against the authoritative productos list when possible.
    const productosState = useTiendaProductos.getState();
    const maxWaitMs = 3000;
    const intervalMs = 250;
    let waited = 0;

    while (productosState.productos.length === 0 && waited < maxWaitMs) {
      // If the productos store reports it's loading, wait; otherwise break early
      if (!productosState.cargando) break;
      await new Promise((res) => setTimeout(res, intervalMs));
      waited += intervalMs;
    }

    const elementosHidratados = leerCarrito();
    establecer({ elementos: elementosHidratados });

    // If productos load later, reconcile snapshot entries to authoritative products
    const reconcileWithProducts = () => {
      const productos = useTiendaProductos.getState().productos;
      if (!productos || productos.length === 0) return;
      establecer((estado) => {
        let changed = false;
        const siguientes = estado.elementos.map((el) => {
          const auth = productos.find((p) => p.id === el.producto.id);
          if (auth) {
            // If the current producto is a snapshot (stock 0 or missing fields), replace
            if (el.producto !== auth) {
              changed = true;
              return { producto: auth, cantidad: el.cantidad };
            }
          }
          return el;
        });
        if (changed) {
          persistirCarrito(siguientes);
          return { elementos: siguientes };
        }
        return {} as any;
      });
    };

    // Attach a short-lived listener: poll for products becoming available for up to 5s
    const pollInterval = 300;
    let polled = 0;
    const maxPoll = 5000;
    const poller = setInterval(() => {
      const productos = useTiendaProductos.getState().productos;
      if ((productos && productos.length > 0) || polled >= maxPoll) {
        try { reconcileWithProducts(); } catch (e) { console.error('reconcileWithProducts error', e); }
        clearInterval(poller);
        return;
      }
      polled += pollInterval;
    }, pollInterval);
  },

  agregarAlCarrito: (productoId, cantidad = 1) => {
    const producto = useTiendaProductos.getState().productos.find((p) => p.id === productoId);
    if (!producto) {
      console.warn('Producto no encontrado para el carrito:', productoId);
      return;
    }
    // Validar que el producto tenga nombre y precio válidos
    if (!producto.name || typeof producto.price !== 'number' || isNaN(producto.price)) {
      console.warn('Producto inválido para el carrito:', producto);
      alert('Este producto no tiene información válida y no puede ser agregado al carrito.');
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
  (total, elemento) => total + elemento.producto.price * elemento.cantidad,
      0
    );
  },

  obtenerTotalArticulos: () => {
    return obtener().elementos.reduce((total, elemento) => total + elemento.cantidad, 0);
  },
}));
