import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors } from '@/theme/colors';
import { fonts } from '@/theme/typography';

type StickyActionBarProps = {
  label: string;
  onPress?: () => void;
  icon?: string;
};

/** Taco Bell–style full-width bottom CTA */
export function StickyActionBar({ label, onPress, icon }: StickyActionBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={[styles.bar, { paddingBottom: Math.max(insets.bottom, 12) }]}
    >
      <Text style={styles.label}>{label}</Text>
      {icon ? <Text style={styles.icon}>{icon}</Text> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  bar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.teal,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 16,
    gap: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255,255,255,0.15)',
  },
  label: {
    fontFamily: fonts.bodyBold,
    fontSize: 14,
    letterSpacing: 1.4,
    color: colors.white,
  },
  icon: {
    fontSize: 18,
  },
});
