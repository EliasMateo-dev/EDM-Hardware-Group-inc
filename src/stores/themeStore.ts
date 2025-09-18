import { create } from 'zustand';

type Theme = 'light' | 'dark';

interface ThemeState {
  theme: Theme;
  initializeTheme: () => void;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const applyThemeClass = (theme: Theme) => {
  if (typeof document === 'undefined') {
    return;
  }

  const root = document.documentElement;
  root.classList.toggle('dark', theme === 'dark');
  root.style.colorScheme = theme;
};

const resolveInitialTheme = (): Theme => {
  if (typeof window === 'undefined') {
    return 'dark';
  }

  const stored = window.localStorage.getItem('theme');
  if (stored === 'light' || stored === 'dark') {
    return stored;
  }

  return 'dark';
};

export const useThemeStore = create<ThemeState>((set) => ({
  theme: 'dark',
  initializeTheme: () => {
    const theme = resolveInitialTheme();
    applyThemeClass(theme);
    set({ theme });
  },
  setTheme: (theme) => {
    applyThemeClass(theme);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('theme', theme);
    }
    set({ theme });
  },
  toggleTheme: () =>
    set((state) => {
      const nextTheme: Theme = state.theme === 'dark' ? 'light' : 'dark';
      applyThemeClass(nextTheme);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('theme', nextTheme);
      }
      return { theme: nextTheme };
    }),
}));
