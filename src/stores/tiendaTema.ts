import { create } from 'zustand';

type Tema = 'light' | 'dark';

interface EstadoTema {
  tema: Tema;
  inicializarTema: () => void;
  establecerTema: (tema: Tema) => void;
  alternarTema: () => void;
}

const aplicarClaseTema = (tema: Tema) => {
  if (typeof document === 'undefined') {
    return;
  }

  const raiz = document.documentElement;
  raiz.classList.toggle('dark', tema === 'dark');
  raiz.style.colorScheme = tema;
};

const resolverTemaInicial = (): Tema => {
  if (typeof window === 'undefined') {
    return 'dark';
  }

  const almacenado = window.localStorage.getItem('tema');
  if (almacenado === 'light' || almacenado === 'dark') {
    return almacenado;
  }

  return 'dark';
};

export const useTiendaTema = create<EstadoTema>((establecer) => ({
  tema: 'dark',
  inicializarTema: () => {
    const tema = resolverTemaInicial();
    aplicarClaseTema(tema);
    establecer({ tema });
  },
  establecerTema: (tema) => {
    aplicarClaseTema(tema);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('tema', tema);
    }
    establecer({ tema });
  },
  alternarTema: () =>
    establecer((estado) => {
      const siguienteTema: Tema = estado.tema === 'dark' ? 'light' : 'dark';
      aplicarClaseTema(siguienteTema);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('tema', siguienteTema);
      }
      return { tema: siguienteTema };
    }),
}));
