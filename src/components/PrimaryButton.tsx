import { Pressable, StyleSheet, Text, type ViewStyle } from 'react-native';

import { colors } from '@/theme/colors';
import { shadow } from '@/theme/tokens';
import { fonts } from '@/theme/typography';

type PrimaryButtonProps = {
  label: string;
  onPress?: () => void;
  variant?: 'teal' | 'terracotta' | 'outline';
  style?: ViewStyle;
};

export function PrimaryButton({ label, onPress, variant = 'teal', style }: PrimaryButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        variant === 'teal' && styles.teal,
        variant === 'terracotta' && styles.terracotta,
        variant === 'outline' && styles.outline,
        pressed && styles.pressed,
        style,
      ]}
    >
      <Text
        style={[
          styles.label,
          variant === 'outline' && styles.labelOutline,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 4,
  },
  teal: {
    backgroundColor: colors.teal,
    ...shadow.card,
  },
  terracotta: {
    backgroundColor: colors.terracotta,
    ...shadow.card,
  },
  outline: {
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.teal,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 4,
  },
  pressed: {
    opacity: 0.88,
  },
  label: {
    fontFamily: fonts.bodyBold,
    fontSize: 14,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    color: colors.white,
  },
  labelOutline: {
    color: colors.teal,
    letterSpacing: 0.6,
    textTransform: 'none',
    fontSize: 13,
  },
});
