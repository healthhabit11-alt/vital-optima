import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { useColorScheme as useSystemScheme } from 'react-native';

import { colors as lightColors } from './colors';

export const darkColors = {
  ...lightColors,
  white: '#101713', // elevated surface (dark pine)
  cream: '#0A0F0C', // app background (dark pine)
  creamDark: '#161D18',
  ink: '#EAF1EA',
  inkMuted: '#AEB8B0',
  inkDim: '#7E8A82',
  border: '#27302A',
  tealMuted: '#16241C',
  goldBg: '#1C231D',
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
