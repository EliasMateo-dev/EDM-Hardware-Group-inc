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
}

export const useTiendaAuth = create<EstadoAuth>((establecer, obtener) => ({
  usuario: null,
  sesion: null,
  cargando: true,

  inicializarAuth: async () => {
    try {
      // Obtener sesión actual
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Error al obtener sesión:', error);
        return;
      }

      establecer({
        usuario: session?.user ?? null,
        sesion: session,
        cargando: false
      });

      // Escuchar cambios de autenticación
      supabase.auth.onAuthStateChange(async (evento, sesion) => {
        console.log('Cambio de auth:', evento, sesion?.user?.email);
        
        establecer({
          usuario: sesion?.user ?? null,
          sesion: sesion,
          cargando: false
        });

        // Crear o actualizar perfil cuando el usuario se registra
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
        }
      });
    } catch (error) {
      console.error('Error al inicializar auth:', error);
      establecer({ cargando: false });
    }
  },

  iniciarSesionConGoogle: async () => {
    try {
      establecer({ cargando: true });
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`
        }
      });

      if (error) {
        console.error('Error al iniciar sesión con Google:', error);
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
    } catch (error) {
      console.error('Error en cerrarSesion:', error);
      establecer({ cargando: false });
      throw error;
    }
  }
}));