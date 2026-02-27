"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type LixumTheme = "dark" | "light";

interface ThemeContextValue {
  theme:       LixumTheme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme:       "dark",
  toggleTheme: () => {},
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<LixumTheme>("dark");

  useEffect(() => {
    const saved = localStorage.getItem("lixum-theme") as LixumTheme | null;
    if (saved === "dark" || saved === "light") setTheme(saved);
  }, []);

  function toggleTheme() {
    const next: LixumTheme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("lixum-theme", next);
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
