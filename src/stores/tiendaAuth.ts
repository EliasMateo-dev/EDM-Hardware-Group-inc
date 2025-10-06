import { create } from 'zustand';
import { supabase } from '../utils/supabase';
import type { User, Session } from '@supabase/supabase-js';

interface EstadoAuth {
  usuario: User | null;
  sesion: Session | null;
  cargando: boolean;
  inicializarAuth: () => Promise<void>;
  iniciarSesionConGoogle: () => Promise<void>;
  cerrarSesion: () => Promise<void>;
  obtenerCarritoStore: () => any;
  establecerCarritoStore: (store: any) => void;
}

let carritoStoreRef: any = null;

export const useTiendaAuth = create<EstadoAuth>((establecer, obtener) => ({
  usuario: null,
  sesion: null,
  cargando: true,

  inicializarAuth: async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error) {
        console.error('Error al obtener sesión:', error);
        establecer({ cargando: false });
        return;
      }

      establecer({
        usuario: session?.user ?? null,
        sesion: session,
        cargando: false
      });

      if (session?.user) {
        await supabase
          .from('profiles')
          .upsert({
            id: session.user.id,
            email: session.user.email!,
            full_name: session.user.user_metadata?.full_name || session.user.user_metadata?.name,
            avatar_url: session.user.user_metadata?.avatar_url,
            updated_at: new Date().toISOString()
          });
      }

      supabase.auth.onAuthStateChange((evento, sesion) => {
        (async () => {
          console.log('Cambio de auth:', evento, sesion?.user?.email);

          establecer({
            usuario: sesion?.user ?? null,
            sesion: sesion,
            cargando: false
          });

          if (evento === 'SIGNED_IN' && sesion?.user) {
            const { error: perfilError } = await supabase
              .from('profiles')
              .upsert({
                id: sesion.user.id,
                email: sesion.user.email!,
                full_name: sesion.user.user_metadata?.full_name || sesion.user.user_metadata?.name,
                avatar_url: sesion.user.user_metadata?.avatar_url,
                updated_at: new Date().toISOString()
              });

            if (perfilError) {
              console.error('Error al crear/actualizar perfil:', perfilError);
            }

            if (carritoStoreRef?.sincronizarCarrito) {
              await carritoStoreRef.sincronizarCarrito(sesion.user.id);
            }
          }
        })();
      });
    } catch (error) {
      console.error('Error al inicializar auth:', error);
      establecer({ cargando: false });
    }
  },

  iniciarSesionConGoogle: async () => {
    try {
      establecer({ cargando: true });

      const siteUrl = import.meta.env.VITE_SITE_URL || window.location.origin;
      const redirectUrl = `${siteUrl}${window.location.pathname}${window.location.search}`;

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          skipBrowserRedirect: false
        }
      });

      if (error) {
        console.error('Error al iniciar sesión con Google:', error);
        establecer({ cargando: false });
        throw error;
      }
    } catch (error) {
      console.error('Error en iniciarSesionConGoogle:', error);
      establecer({ cargando: false });
      throw error;
    }
  },

  cerrarSesion: async () => {
    try {
      establecer({ cargando: true });

      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error('Error al cerrar sesión:', error);
        throw error;
      }

      establecer({
        usuario: null,
        sesion: null,
        cargando: false
      });

      if (carritoStoreRef?.cargarCarrito) {
        await carritoStoreRef.cargarCarrito();
      }
    } catch (error) {
      console.error('Error en cerrarSesion:', error);
      establecer({ cargando: false });
      throw error;
    }
  },

  obtenerCarritoStore: () => carritoStoreRef,

  establecerCarritoStore: (store: any) => {
    carritoStoreRef = store;
  }
}));