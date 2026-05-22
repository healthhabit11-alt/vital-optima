import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { GlucoseReading } from '@/data/content';
import { useTheme } from '@/theme/ThemeContext';
import { radius, shadow } from '@/theme/tokens';
import { fonts } from '@/theme/typography';

type GlucoseSummaryCardProps = {
  reading: GlucoseReading;
  onLogPress?: () => void;
};

export function GlucoseSummaryCard({ reading, onLogPress }: GlucoseSummaryCardProps) {
  const { colors } = useTheme();

  return (
    <View style={[styles.card, shadow.card, { backgroundColor: colors.white, borderColor: colors.border }]}>
      <View style={[styles.accent, { backgroundColor: reading.inRange ? colors.mint : colors.terracotta }]} />
      <View style={styles.inner}>
        <View style={styles.header}>
          <Text style={[styles.label, { color: colors.teal }]}>Latest glucose</Text>
          <View
            style={[
              styles.badge,
              { backgroundColor: reading.inRange ? colors.tealMuted : colors.goldBg },
            ]}
          >
            <Ionicons
              name={reading.inRange ? 'checkmark-circle' : 'alert-circle'}
              size={14}
              color={reading.inRange ? colors.teal : colors.gold}
            />
            <Text style={[styles.badgeText, { color: reading.inRange ? colors.teal : colors.gold }]}>
              {reading.inRange ? 'In range' : 'Review'}
            </Text>
          </View>
        </View>
        <Text style={[styles.value, { color: colors.ink }]}>
          {reading.value}{' '}
          <Text style={[styles.unit, { color: colors.inkMuted }]}>{reading.unit}</Text>
        </Text>
        <Text style={[styles.time, { color: colors.inkDim }]}>{reading.loggedAt}</Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Log a new glucose reading"
          onPress={onLogPress}
          style={[styles.logBtn, { backgroundColor: colors.teal }]}
        >
          <Ionicons name="add-circle-outline" size={18} color={colors.white} />
          <Text style={[styles.logBtnText, { color: colors.white }]}>Log reading</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    borderRadius: radius.lg,
    marginBottom: 24,
    borderWidth: 1,
    overflow: 'hidden',
  },
  accent: {
    width: 5,
  },
  inner: {
    flex: 1,
    padding: 18,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontFamily: fonts.bodyBold,
    fontSize: 12,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  badgeText: {
    fontFamily: fonts.bodyBold,
    fontSize: 11,
  },
  value: {
    fontFamily: fonts.display,
    fontSize: 38,
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  unit: {
    fontFamily: fonts.body,
    fontSize: 16,
  },
  time: {
    fontFamily: fonts.body,
    fontSize: 13,
    marginBottom: 14,
  },
  logBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    minHeight: 44,
    paddingHorizontal: 16,
    borderRadius: radius.sm,
  },
  logBtnText: {
    fontFamily: fonts.bodyBold,
    fontSize: 13,
    letterSpacing: 0.4,
  },
});
