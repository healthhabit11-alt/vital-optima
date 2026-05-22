import { LinearGradient } from 'expo-linear-gradient';
import type { ReactNode } from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';

import { colors } from '@/theme/colors';

type TealHeaderProps = {
  children: ReactNode;
  topInset?: number;
  style?: ViewStyle;
};

export function TealHeader({ children, topInset = 0, style }: TealHeaderProps) {
  return (
    <LinearGradient
      colors={[colors.teal, colors.tealLight, '#2A7A72']}
      style={[styles.header, { paddingTop: topInset + 12 }, style]}
    >
      <View style={styles.glow} />
      {children}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    overflow: 'hidden',
  },
  glow: {
    position: 'absolute',
    top: -50,
    right: -40,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(255,255,255,0.07)',
  },
});
