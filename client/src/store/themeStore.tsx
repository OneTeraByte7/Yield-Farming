import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Theme = 'light' | 'dark';

interface ThemeStore {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

// Initialize theme on page load
const initializeTheme = () => {
  const stored = localStorage.getItem('theme-storage');
  if (stored) {
    try {
      const { state } = JSON.parse(stored);
      const theme = state?.theme || 'light';
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } catch (e) {
      // If parsing fails, default to light
      document.documentElement.classList.remove('dark');
    }
  }
};

// Run on import
if (typeof window !== 'undefined') {
  initializeTheme();
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      theme: 'light',
      toggleTheme: () =>
        set((state) => {
          const newTheme = state.theme === 'light' ? 'dark' : 'light';
          // DOM manipulation is now handled only in App.tsx useEffect
          return { theme: newTheme };
        }),
      setTheme: (theme) =>
        set(() => {
          // DOM manipulation is now handled only in App.tsx useEffect
          return { theme };
        }),
    }),
    {
      name: 'theme-storage',
    }
  )
);
