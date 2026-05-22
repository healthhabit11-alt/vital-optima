import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { useColorScheme as useSystemScheme } from 'react-native';

import { colors as lightColors } from './colors';

export const darkColors = {
  ...lightColors,
  white: '#121816',
  cream: '#0C100E',
  creamDark: '#1A221E',
  ink: '#F4F0E8',
  inkMuted: '#B8B0A6',
  inkDim: '#8A8278',
  border: '#2A332F',
  tealMuted: '#1A2E2B',
  goldBg: '#2A2418',
} as const;

type ThemeMode = 'light' | 'dark' | 'system';

export type ColorPalette = {
  [K in keyof typeof lightColors]: string;
};

type ThemeContextValue = {
  mode: ThemeMode;
  resolved: 'light' | 'dark';
  colors: ColorPalette;
  setMode: (mode: ThemeMode) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const system = useSystemScheme();
  const [mode, setMode] = useState<ThemeMode>('system');

  const resolved = mode === 'system' ? (system === 'dark' ? 'dark' : 'light') : mode;
  const palette: ColorPalette = resolved === 'dark' ? darkColors : lightColors;

  const value = useMemo(
    () => ({ mode, resolved, colors: palette, setMode }),
    [mode, resolved, palette],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}

export function useColors() {
  return useTheme().colors;
}
