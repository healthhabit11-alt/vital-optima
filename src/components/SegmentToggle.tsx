import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '@/theme/colors';
import { fonts } from '@/theme/typography';

type SegmentToggleProps = {
  left: string;
  right: string;
  active: 'left' | 'right';
  onChange: (side: 'left' | 'right') => void;
  dark?: boolean;
};

export function SegmentToggle({ left, right, active, onChange, dark }: SegmentToggleProps) {
  return (
    <View style={[styles.track, dark && styles.trackDark]}>
      <Pressable
        onPress={() => onChange('left')}
        style={[styles.segment, active === 'left' && (dark ? styles.activeDark : styles.active)]}
      >
        <Text
          style={[
            styles.text,
            dark && styles.textDark,
            active === 'left' && (dark ? styles.textActiveDark : styles.textActive),
          ]}
        >
          {left}
        </Text>
      </Pressable>
      <Pressable
        onPress={() => onChange('right')}
        style={[styles.segment, active === 'right' && (dark ? styles.activeDark : styles.active)]}
      >
        <Text
          style={[
            styles.text,
            dark && styles.textDark,
            active === 'right' && (dark ? styles.textActiveDark : styles.textActive),
          ]}
        >
          {right}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    flexDirection: 'row',
    backgroundColor: colors.creamDark,
    borderRadius: 24,
    padding: 3,
    borderWidth: 1,
    borderColor: colors.border,
  },
  trackDark: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderColor: 'rgba(255,255,255,0.25)',
  },
  segment: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  active: {
    backgroundColor: colors.teal,
  },
  activeDark: {
    backgroundColor: colors.white,
  },
  text: {
    fontFamily: fonts.bodyBold,
    fontSize: 12,
    letterSpacing: 0.8,
    color: colors.inkMuted,
  },
  textDark: {
    color: 'rgba(255,255,255,0.7)',
  },
  textActive: {
    color: colors.white,
  },
  textActiveDark: {
    color: colors.teal,
  },
});
