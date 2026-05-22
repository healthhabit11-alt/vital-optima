import { useMemo } from 'react';
import { StyleSheet, type ImageStyle, type TextStyle, type ViewStyle } from 'react-native';

import { useTheme, type ColorPalette } from './ThemeContext';

type NamedStyles = Record<string, ViewStyle | TextStyle | ImageStyle>;

export function useThemedStyles<T extends NamedStyles>(factory: (colors: ColorPalette) => T): T {
  const { colors } = useTheme();
  return useMemo(() => StyleSheet.create(factory(colors)), [colors]);
}
