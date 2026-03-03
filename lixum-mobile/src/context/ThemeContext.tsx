import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DARK, LIGHT } from '@/theme/tokens';
import type { LixumTokens } from '@/theme/tokens';
import { darkTheme, lightTheme, type Theme, type ThemeMode } from '@/theme';

interface ThemeContextType {
  theme: Theme;
  mode: ThemeMode;
  tokens: LixumTokens;
  transitioning: boolean;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: darkTheme,
  mode: 'dark',
  tokens: DARK,
  transitioning: false,
  toggleTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>('dark');
  const [transitioning, setTransitioning] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem('lixum-theme').then((saved) => {
      if (saved === 'light' || saved === 'dark') {
        setMode(saved);
      }
    });
  }, []);

  const toggleTheme = () => {
    if (transitioning) return;
    setTransitioning(true);
    // Switch at ECG mid-point (450ms)
    setTimeout(() => {
      const next: ThemeMode = mode === 'dark' ? 'light' : 'dark';
      setMode(next);
      AsyncStorage.setItem('lixum-theme', next);
    }, 450);
    // Remove overlay (980ms)
    setTimeout(() => setTransitioning(false), 980);
  };

  const theme = (mode === 'dark' ? darkTheme : lightTheme) as Theme;
  const tokens: LixumTokens = mode === 'dark' ? (DARK as LixumTokens) : (LIGHT as LixumTokens);

  return (
    <ThemeContext.Provider value={{ theme, mode, tokens, transitioning, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
export const useTokens = () => {
  const { tokens } = useTheme();
  return tokens;
};
