import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

interface DarkModeContextValue {
  dark: boolean;
  toggle: () => void;
}

export const DarkModeContext = createContext<DarkModeContextValue>({ dark: false, toggle: () => {} });

export const useDark = () => useContext(DarkModeContext);

export function DarkModeProvider({ children }: { children: ReactNode }) {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    if (dark) {
      root.setAttribute('data-theme', 'dark');
    } else {
      root.removeAttribute('data-theme');
    }
  }, [dark]);

  return (
    <DarkModeContext.Provider value={{ dark, toggle: () => setDark(d => !d) }}>
      {children}
    </DarkModeContext.Provider>
  );
}
