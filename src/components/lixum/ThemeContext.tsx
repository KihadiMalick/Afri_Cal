"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type LixumTheme = "dark" | "light";

interface ThemeContextValue {
  theme:         LixumTheme;
  transitioning: boolean;   /* true while ECG animation plays */
  toggleTheme:   () => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: "dark", transitioning: false, toggleTheme: () => {},
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme,         setTheme]         = useState<LixumTheme>("dark");
  const [transitioning, setTransitioning] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("lixum-theme") as LixumTheme | null;
    if (saved === "dark" || saved === "light") setTheme(saved);
  }, []);

  function toggleTheme() {
    if (transitioning) return;        // debounce: ignore click during animation
    setTransitioning(true);
    // Switch theme at the mid-point of the ECG sweep (450 ms)
    setTimeout(() => {
      const next: LixumTheme = theme === "dark" ? "light" : "dark";
      setTheme(next);
      localStorage.setItem("lixum-theme", next);
    }, 450);
    // Remove overlay after full animation (980 ms)
    setTimeout(() => setTransitioning(false), 980);
  }

  return (
    <ThemeContext.Provider value={{ theme, transitioning, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
