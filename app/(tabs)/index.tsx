import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { FadeIn } from '@/components/FadeIn';
import { StickyActionBar } from '@/components/StickyActionBar';
import { GlucoseSummaryCard } from '@/components/GlucoseSummaryCard';
import { MedicationCard } from '@/components/MedicationCard';
import { PrimaryButton } from '@/components/PrimaryButton';
import { QuickLogBar } from '@/components/QuickLogBar';
import { SectionLabel } from '@/components/SectionLabel';
import { SegmentToggle } from '@/components/SegmentToggle';
import {
  adherence,
  dashboardInsight,
  latestGlucose,
  todaysMedications,
  user,
} from '@/data/content';
import { colors } from '@/theme/colors';
import { useTheme } from '@/theme/ThemeContext';
import { radius, shadow } from '@/theme/tokens';
import { fonts } from '@/theme/typography';

export default function DashboardScreen() {
  const insets = useSafeAreaInsets();
  const { colors: themeColors } = useTheme();
  const [mode, setMode] = useState<'left' | 'right'>('left');

  return (
    <View style={[styles.root, { paddingTop: insets.top, backgroundColor: themeColors.cream }]}>
      <LinearGradient colors={[colors.teal, colors.tealLight, '#2A7A72']} style={styles.header}>
        <View style={styles.headerGlow} />
        <View style={styles.headerRow}>
          <SegmentToggle left="TODAY" right="WEEK" active={mode} onChange={setMode} dark />
          <View style={styles.focus}>
            <Text style={styles.focusLabel}>ADHERENCE</Text>
            <Text style={styles.focusValue}>{adherence.streakDays} day streak</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        style={[styles.scroll, { backgroundColor: themeColors.cream }]}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <FadeIn delay={0}>
          <View style={styles.greeting}>
            <Text style={[styles.hey, { color: themeColors.ink }]}>Hey, {user.displayName.toLowerCase()}</Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Reminders, ${user.reminderCount} unread`}
              style={styles.reminders}
            >
              <Ionicons name="notifications-outline" size={18} color={colors.teal} />
              <Text style={styles.remindersLabel}>REMINDERS</Text>
              {user.reminderCount > 0 ? (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{user.reminderCount}</Text>
                </View>
              ) : null}
            </Pressable>
          </View>
        </FadeIn>

        <FadeIn delay={60}>
          <LinearGradient
            colors={['#134A45', '#1A6B64', '#3D9B8F']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.hero, shadow.card]}
          >
            <View style={styles.heroOrb} />
            <View style={[styles.heroOrb, styles.heroOrbSmall]} />
            <View style={styles.heroContent}>
              <Text style={styles.heroKicker}>TODAY&apos;S INSIGHT</Text>
              <Text style={styles.heroTitle}>{dashboardInsight.title}</Text>
              <Text style={styles.heroBody}>{dashboardInsight.body}</Text>
              <PrimaryButton
                label={dashboardInsight.cta.toUpperCase()}
                variant="terracotta"
                style={styles.heroCta}
                onPress={() => router.push('/(tabs)/meds')}
              />
            </View>
          </LinearGradient>
        </FadeIn>

        <FadeIn delay={120}>
          <GlucoseSummaryCard reading={latestGlucose} onLogPress={() => router.push('/(tabs)/glucose')} />
        </FadeIn>

        <FadeIn delay={160}>
          <QuickLogBar />
        </FadeIn>

        <FadeIn delay={200}>
          <SectionLabel>
            TODAY&apos;S MEDICATIONS ({adherence.dosesToday}/{adherence.dosesTotal})
          </SectionLabel>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.carousel}>
            {todaysMedications.map((m) => (
              <MedicationCard key={m.id} medication={m} />
            ))}
          </ScrollView>
        </FadeIn>

      </ScrollView>

      <StickyActionBar
        label="LOG NEXT DOSE"
        icon="💊"
        onPress={() => router.push('/medication/evening-arv')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 22,
    paddingTop: 12,
    overflow: 'hidden',
  },
  headerGlow: {
    position: 'absolute',
    top: -40,
    right: -30,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  focus: { flex: 1, alignItems: 'flex-end' },
  focusLabel: { fontFamily: fonts.body, fontSize: 10, letterSpacing: 1, color: 'rgba(255,255,255,0.65)' },
  focusValue: { fontFamily: fonts.bodyBold, fontSize: 12, color: colors.white },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 100 },
  greeting: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginTop: 20,
    marginBottom: 22,
  },
  hey: { fontFamily: fonts.display, fontSize: 36, letterSpacing: -0.8 },
  reminders: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8, minHeight: 44 },
  remindersLabel: { fontFamily: fonts.bodyBold, fontSize: 11, letterSpacing: 1, color: colors.teal },
  badge: {
    backgroundColor: colors.terracotta,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: { fontFamily: fonts.bodyBold, fontSize: 10, color: colors.white },
  hero: {
    borderRadius: radius.lg,
    padding: 22,
    minHeight: 172,
    overflow: 'hidden',
    marginBottom: 22,
  },
  heroOrb: {
    position: 'absolute',
    right: -20,
    bottom: -30,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.07)',
  },
  heroOrbSmall: {
    right: 60,
    bottom: 40,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  heroContent: { maxWidth: '100%', zIndex: 1 },
  heroKicker: {
    fontFamily: fonts.bodyBold,
    fontSize: 10,
    letterSpacing: 1.8,
    color: 'rgba(255,255,255,0.72)',
    marginBottom: 8,
  },
  heroTitle: {
    fontFamily: fonts.display,
    fontSize: 26,
    lineHeight: 30,
    color: colors.white,
    marginBottom: 10,
  },
  heroBody: {
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 21,
    color: 'rgba(255,255,255,0.92)',
    marginBottom: 16,
  },
  heroCta: { alignSelf: 'flex-start', paddingHorizontal: 20, paddingVertical: 12 },
  carousel: { paddingRight: 20, marginBottom: 24 },
});
