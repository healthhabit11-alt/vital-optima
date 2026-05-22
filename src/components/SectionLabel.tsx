import type { ReactNode } from 'react';
import { StyleSheet, Text, type TextStyle } from 'react-native';

import { useTheme } from '@/theme/ThemeContext';
import { fonts } from '@/theme/typography';

type SectionLabelProps = {
  children: ReactNode;
  style?: TextStyle;
};

/** Taco Bell–style tracked section kicker */
export function SectionLabel({ children, style }: SectionLabelProps) {
  const { colors } = useTheme();

  return (
    <Text style={[styles.base, { color: colors.inkDim }, style]}>{children}</Text>
  );
}

const styles = StyleSheet.create({
  base: {
    fontFamily: fonts.body,
    fontSize: 11,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    marginBottom: 14,
  },
});
