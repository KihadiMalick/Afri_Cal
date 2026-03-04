import React, { createContext, useContext } from 'react';
import { DARK } from '@/theme/tokens';
import type { LixumTokens } from '@/theme/tokens';
import { darkTheme, type Theme } from '@/theme';

interface ThemeContextType {
  theme: Theme;
  mode: 'dark';
  tokens: LixumTokens;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: darkTheme,
  mode: 'dark',
  tokens: DARK as LixumTokens,
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <ThemeContext.Provider
      value={{
        theme: darkTheme,
        mode: 'dark',
        tokens: DARK as LixumTokens,
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
