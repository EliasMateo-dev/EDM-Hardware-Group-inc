import { create } from 'zustand';
import { supabase } from '../utils/supabase';
import type { User, Session } from '@supabase/supabase-js';

interface EstadoAuth {
  usuario: User | null;
  sesion: Session | null;
  perfil: {
    id: string;
    email: string;
    full_name?: string;
    avatar_url?: string;
    is_admin?: boolean;
  } | null;
  cargando: boolean;
  inicializarAuth: () => Promise<void>;
  iniciarSesionConGoogle: () => Promise<void>;
  cerrarSesion: () => Promise<void>;
}

export const useTiendaAuth = create<EstadoAuth>((establecer, obtener) => ({
  usuario: null,
  sesion: null,
  perfil: null,
  cargando: true,

  inicializarAuth: async () => {
    // watchdog: limpiar cargando después de 15s si algo queda colgado
    let watchdog: any = setTimeout(() => {
      console.warn('inicializarAuth watchdog triggered — clearing cargando flag');
      establecer({ cargando: false });
    }, 15000);

    try {
      // Obtener sesión actual
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        console.error('Error al obtener sesión:', error);
        establecer({ cargando: false });
        return;
      }

      let perfil = null;
      if (session?.user) {
        // Buscar perfil en la tabla profiles
        const { data: perfiles, error: errorPerfil } = await supabase
          .from('profiles')
          .select('id, email, full_name, avatar_url, is_admin')
          .eq('id', session.user.id)
          .single();
        if (errorPerfil) {
          console.error('Error al obtener perfil:', errorPerfil);
        } else {
          perfil = perfiles;
        }
      }

      clearTimeout(watchdog);
      establecer({
        usuario: session?.user ?? null,
        sesion: session,
        perfil,
        cargando: false
      });

      // Escuchar cambios de autenticación
      supabase.auth.onAuthStateChange(async (evento, sesion) => {
        console.log('Cambio de auth:', evento, sesion?.user?.email);
        let perfil = null;
        if (sesion?.user) {
          try {
            const { data: perfiles, error: errorPerfil } = await supabase
              .from('profiles')
              .select('id, email, full_name, avatar_url, is_admin')
              .eq('id', sesion.user.id)
              .single();
            if (errorPerfil) {
              console.error('Error al obtener perfil:', errorPerfil);
            } else {
              perfil = perfiles;
            }
          } catch (err) {
            console.error('Error fetching profile on auth change', err);
          }
        }
        clearTimeout(watchdog);
        establecer({
          usuario: sesion?.user ?? null,
          sesion: sesion,
          perfil,
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