import { create } from 'zustand';
import type { Product } from '../utils/supabase';
import { useTiendaProductos } from './tiendaProductos';
import { supabase } from '../utils/supabase';

const CLAVE_ALMACEN_CARRITO = 'constructorpc-carrito';

type ElementoCarrito = {
  producto: import('../utils/supabase').Product;
  cantidad: number;
};

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
    // Obtener productos actuales del store
    const productos = useTiendaProductos.getState().productos;
    return parseado
      .map(({ productoId, cantidad }) => {
        const producto = productos.find((p) => p.id === productoId);
        if (!producto) return null;
        return { producto, cantidad };
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

// Persistir carrito al servidor (tabla cart_items). Reemplaza el carrito del usuario en servidor con el contenido dado.
const persistirCarritoServidor = async (userId: string, elementos: ElementoCarrito[]) => {
  if (!userId) return;
  try {
    const rows = elementos.map(e => ({ user_id: userId, product_id: e.producto.id, quantity: e.cantidad }));
    // Borrar existentes para evitar duplicados y luego insertar nuevos
    await supabase.from('cart_items').delete().eq('user_id', userId);
    if (rows.length > 0) {
      await supabase.from('cart_items').insert(rows);
    }
  } catch (err) {
    console.error('Error al persistir carrito en servidor:', err);
  }
};

// Leer carrito del servidor para un usuario
const leerCarritoServidor = async (userId: string): Promise<ElementoCarritoAlmacenado[]> => {
  if (!userId) return [];
  try {
    const { data, error } = await supabase.from('cart_items').select('product_id, quantity').eq('user_id', userId);
    if (error) throw error;
    return (data || []).map((r: any) => ({ productoId: r.product_id, cantidad: r.quantity }));
  } catch (err) {
    console.error('Error al leer carrito desde servidor:', err);
    return [];
  }
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
    (async () => {
      const elementosLocal = leerCarrito();
      // intentar obtener usuario actual
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // leer servidor y mergear (server wins for quantity)
        const serverRaw = await leerCarritoServidor(user.id);
        const productos = useTiendaProductos.getState().productos;
        const serverItems: ElementoCarrito[] = serverRaw.map(({ productoId, cantidad }) => {
          const producto = productos.find(p => p.id === productoId);
          return producto ? { producto, cantidad } : null;
        }).filter((i): i is ElementoCarrito => i !== null);

        // merge local + server: si existe en server, usar cantidad server, sino usar local
        const mapa = new Map<string, ElementoCarrito>();
        elementosLocal.forEach(e => mapa.set(e.producto.id, e));
        serverItems.forEach(e => mapa.set(e.producto.id, e));
        const merged = Array.from(mapa.values());
        establecer({ elementos: merged });
        // persistir local tambien para mantener sincronía en localStorage
        persistirCarrito(merged);
      } else {
        establecer({ elementos: elementosLocal });
      }
    })();
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
      // persistir al servidor si hay usuario
      (async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) await persistirCarritoServidor(user.id, siguientesElementos);
      })();
      return { elementos: siguientesElementos };
    });
  },

  eliminarDelCarrito: (productoId) => {
    establecer((estado) => {
      const siguientesElementos = estado.elementos.filter((elemento) => elemento.producto.id !== productoId);
      persistirCarrito(siguientesElementos);
      (async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) await persistirCarritoServidor(user.id, siguientesElementos);
      })();
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
      (async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) await persistirCarritoServidor(user.id, siguientesElementos);
      })();
      return { elementos: siguientesElementos };
    });
  },

  vaciarCarrito: () => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await persistirCarritoServidor(user.id, []);
      }
      persistirCarrito([]);
      establecer({ elementos: [] });
    })();
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

// Listener: recargar carrito cuando cambia el estado de autenticación
if (typeof window !== 'undefined' && supabase && supabase.auth) {
  supabase.auth.onAuthStateChange((_event) => {
    // cuando hay sesión, recargar para mergear local+servidor; si no, cargar local
    useTiendaCarrito.getState().cargarCarrito();
  });
}
