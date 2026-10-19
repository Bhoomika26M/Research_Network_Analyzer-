import { create } from 'zustand';

interface ThemeState {
  darkMode: boolean;
  toggleDarkMode: () => void;
}

export const useThemeStore = create<ThemeState>((set) => {
  const initialDark = localStorage.getItem('scientific_app_dark') === 'true';

  if (initialDark) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }

  return {
    darkMode: initialDark,
    toggleDarkMode: () =>
      set((state) => {
        const nextDark = !state.darkMode;
        localStorage.setItem('scientific_app_dark', String(nextDark));
        if (nextDark) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
        return { darkMode: nextDark };
      }),
  };
});
