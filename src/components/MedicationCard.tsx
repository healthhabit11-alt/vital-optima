import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { Medication, MedicationStatus } from '@/data/content';
import { colors } from '@/theme/colors';
import { useTheme } from '@/theme/ThemeContext';
import { radius, shadow } from '@/theme/tokens';
import { fonts } from '@/theme/typography';

type MedicationCardProps = {
  medication: Medication;
  compact?: boolean;
  onLogPress?: () => void;
};

const CARD_W = 148;

const statusConfig: Record<MedicationStatus, { label: string; bg: string; text: string }> = {
  taken: { label: 'Taken', bg: colors.tealMuted, text: colors.teal },
  due: { label: 'Due now', bg: colors.goldBg, text: colors.gold },
  upcoming: { label: 'Upcoming', bg: '#FCEEEA', text: colors.terracotta },
  missed: { label: 'Missed', bg: '#FDE8E4', text: colors.badge },
};

export function MedicationCard({ medication, compact, onLogPress }: MedicationCardProps) {
  const { colors: themeColors } = useTheme();
  const status = statusConfig[medication.status];

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${medication.name}, ${status.label}, ${medication.schedule}`}
      onPress={() => router.push(`/medication/${medication.id}`)}
      style={({ pressed }) =>
        StyleSheet.flatten([
          styles.card,
          compact ? styles.cardCompact : null,
          pressed && styles.cardPressed,
        ])
      }
    >
      <View style={[styles.imageWrap, shadow.card]}>
        <LinearGradient
          colors={medication.gradient}
          style={StyleSheet.flatten([styles.gradient, compact ? styles.gradientCompact : null])}
        >
          <Text style={styles.icon}>{medication.icon}</Text>
        </LinearGradient>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Log ${medication.name} as taken`}
          hitSlop={8}
          style={[styles.logBtn, shadow.float, medication.status === 'taken' && styles.logBtnDone]}
          onPress={(e) => { e.stopPropagation(); if (medication.status !== 'taken') onLogPress?.(); }}
        >
          <Ionicons name={medication.status === 'taken' ? 'checkmark' : 'add'} size={22} color={colors.teal} />
        </Pressable>
        {medication.tag ? (
          <View style={styles.limitedTag}>
            <Text style={styles.limitedText}>{medication.tag}</Text>
          </View>
        ) : null}
      </View>
      <View style={[styles.statusPill, { backgroundColor: status.bg }]}>
        <Text style={[styles.statusText, { color: status.text }]}>{status.label}</Text>
      </View>
      <Text style={[styles.title, { color: themeColors.ink }]} numberOfLines={2}>
        {medication.name}
      </Text>
      <Text style={[styles.meta, { color: themeColors.inkDim }]}>{medication.schedule}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: CARD_W,
    marginRight: 14,
  },
  cardCompact: {
    width: 132,
  },
  cardPressed: {
    opacity: 0.92,
    transform: [{ scale: 0.98 }],
  },
  imageWrap: {
    position: 'relative',
    marginBottom: 10,
    borderRadius: radius.md,
    overflow: 'hidden',
  },
  gradient: {
    width: CARD_W,
    height: CARD_W,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gradientCompact: {
    width: 132,
    height: 132,
  },
  icon: {
    fontSize: 48,
  },
  logBtn: {
    position: 'absolute',
    right: 8,
    bottom: 8,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logBtnDone: {
    backgroundColor: colors.tealMuted,
    opacity: 0.7,
  },
  limitedTag: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: colors.goldBg,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
  },
  limitedText: {
    fontFamily: fonts.bodyBold,
    fontSize: 8,
    letterSpacing: 0.8,
    color: colors.gold,
  },
  statusPill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.pill,
    marginBottom: 6,
  },
  statusText: {
    fontFamily: fonts.bodyBold,
    fontSize: 10,
    letterSpacing: 0.4,
  },
  title: {
    fontFamily: fonts.bodyBold,
    fontSize: 14,
    lineHeight: 18,
    marginBottom: 2,
  },
  meta: {
    fontFamily: fonts.body,
    fontSize: 12,
  },
});
