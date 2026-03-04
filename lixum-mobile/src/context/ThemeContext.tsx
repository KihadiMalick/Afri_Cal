import React, { createContext, useContext } from 'react';
import { DARK } from '@/theme/tokens';
import type { LixumTokens } from '@/theme/tokens';
import { darkTheme, type Theme } from '@/theme';

interface ThemeContextType {
  theme: Theme;
  mode: 'dark';
  tokens: LixumTokens;
  transitioning: false;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: darkTheme,
  mode: 'dark',
  tokens: DARK as LixumTokens,
  transitioning: false,
  toggleTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <ThemeContext.Provider
      value={{
        theme: darkTheme,
        mode: 'dark',
        tokens: DARK as LixumTokens,
        transitioning: false,
        toggleTheme: () => {},
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
export const useTokens = () => {
  const { tokens } = useTheme();
  return tokens;
};
