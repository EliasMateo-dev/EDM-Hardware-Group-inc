import { create } from 'zustand';
import type { Producto } from '../data/catalogo';
import { obtenerProductoPorId } from '../data/catalogo';
import { supabase } from '../utils/supabase';

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
  cargarCarrito: () => Promise<void>;
  agregarAlCarrito: (productoId: string, cantidad?: number) => Promise<void>;
  eliminarDelCarrito: (productoId: string) => Promise<void>;
  actualizarCantidad: (productoId: string, cantidad: number) => Promise<void>;
  vaciarCarrito: () => Promise<void>;
  obtenerTotalPrecio: () => number;
  obtenerTotalArticulos: () => number;
  sincronizarCarrito: (userId: string) => Promise<void>;
}

export const useTiendaCarrito = create<EstadoCarrito>((establecer, obtener) => ({
  elementos: [],
  cargando: false,

  cargarCarrito: async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        const { data: cartItems, error } = await supabase
          .from('cart_items')
          .select('product_id, quantity')
          .eq('user_id', user.id);

        if (error) {
          console.error('Error al cargar carrito desde Supabase:', error);
          const elementosHidratados = leerCarrito();
          establecer({ elementos: elementosHidratados });
          return;
        }

        const elementos: ElementoCarrito[] = cartItems
          .map(item => {
            const producto = obtenerProductoPorId(item.product_id);
            if (!producto) return null;
            return { producto, cantidad: item.quantity };
          })
          .filter((item): item is ElementoCarrito => item !== null);

        establecer({ elementos });
      } else {
        const elementosHidratados = leerCarrito();
        establecer({ elementos: elementosHidratados });
      }
    } catch (error) {
      console.error('Error en cargarCarrito:', error);
      const elementosHidratados = leerCarrito();
      establecer({ elementos: elementosHidratados });
    }
  },

  sincronizarCarrito: async (userId: string) => {
    try {
      const elementosLocales = leerCarrito();

      if (elementosLocales.length > 0) {
        await supabase
          .from('cart_items')
          .delete()
          .eq('user_id', userId);

        const itemsParaInsertar = elementosLocales.map(item => ({
          user_id: userId,
          product_id: item.producto.id,
          quantity: item.cantidad
        }));

        const { error } = await supabase
          .from('cart_items')
          .insert(itemsParaInsertar);

        if (error) {
          console.error('Error al sincronizar carrito:', error);
          return;
        }

        window.localStorage.removeItem(CLAVE_ALMACEN_CARRITO);
      }

      await obtener().cargarCarrito();
    } catch (error) {
      console.error('Error en sincronizarCarrito:', error);
    }
  },

  agregarAlCarrito: async (productoId, cantidad = 1) => {
    const producto = obtenerProductoPorId(productoId);
    if (!producto) {
      console.warn('Producto no encontrado para el carrito:', productoId);
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      const { data: existente } = await supabase
        .from('cart_items')
        .select('*')
        .eq('user_id', user.id)
        .eq('product_id', productoId)
        .maybeSingle();

      if (existente) {
        const { error } = await supabase
          .from('cart_items')
          .update({ quantity: existente.quantity + cantidad, updated_at: new Date().toISOString() })
          .eq('id', existente.id);

        if (error) {
          console.error('Error al actualizar carrito en Supabase:', error);
          return;
        }
      } else {
        const { error } = await supabase
          .from('cart_items')
          .insert({
            user_id: user.id,
            product_id: productoId,
            quantity: cantidad
          });

        if (error) {
          console.error('Error al agregar al carrito en Supabase:', error);
          return;
        }
      }

      await obtener().cargarCarrito();
    } else {
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
    }
  },

  eliminarDelCarrito: async (productoId) => {
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', user.id)
        .eq('product_id', productoId);

      if (error) {
        console.error('Error al eliminar del carrito en Supabase:', error);
        return;
      }

      await obtener().cargarCarrito();
    } else {
      establecer((estado) => {
        const siguientesElementos = estado.elementos.filter((elemento) => elemento.producto.id !== productoId);
        persistirCarrito(siguientesElementos);
        return { elementos: siguientesElementos };
      });
    }
  },

  actualizarCantidad: async (productoId, cantidad) => {
    if (cantidad <= 0) {
      await obtener().eliminarDelCarrito(productoId);
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      const { data: existente } = await supabase
        .from('cart_items')
        .select('*')
        .eq('user_id', user.id)
        .eq('product_id', productoId)
        .maybeSingle();

      if (existente) {
        const { error } = await supabase
          .from('cart_items')
          .update({ quantity: cantidad, updated_at: new Date().toISOString() })
          .eq('id', existente.id);

        if (error) {
          console.error('Error al actualizar cantidad en Supabase:', error);
          return;
        }

        await obtener().cargarCarrito();
      }
    } else {
      establecer((estado) => {
        const siguientesElementos = estado.elementos.map((elemento) =>
          elemento.producto.id === productoId ? { ...elemento, cantidad } : elemento
        );
        persistirCarrito(siguientesElementos);
        return { elementos: siguientesElementos };
      });
    }
  },

  vaciarCarrito: async () => {
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', user.id);

      if (error) {
        console.error('Error al vaciar carrito en Supabase:', error);
        return;
      }

      establecer({ elementos: [] });
    } else {
      persistirCarrito([]);
      establecer({ elementos: [] });
    }
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
