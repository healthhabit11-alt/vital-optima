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
import { useMedications } from '@/db/useMedications';
import { useGlucose } from '@/db/useGlucose';
import { useUserProfile } from '@/db/useUserProfile';
import { HypoModal } from '@/components/HypoModal';
import { dashboardInsight } from '@/data/content';
import { colors } from '@/theme/colors';
import { useTheme } from '@/theme/ThemeContext';
import { radius, shadow } from '@/theme/tokens';
import { fonts } from '@/theme/typography';

export default function DashboardScreen() {
  const insets = useSafeAreaInsets();
  const { colors: themeColors } = useTheme();
  const [mode, setMode] = useState<'left' | 'right'>('left');

  const { profile } = useUserProfile();
  const { medications, todayDoseCount, logDose } = useMedications();
  const { latest, weekTrend, hypoAlert, dismissHypo } = useGlucose();

  const dosesTotal = medications.length;
  const streakLabel = `${todayDoseCount}/${dosesTotal} today`;
  const avgGlucose = (weekTrend.reduce((a, b) => a + b, 0) / weekTrend.length).toFixed(1);

  return (
    <View style={[styles.root, { paddingTop: insets.top, backgroundColor: themeColors.cream }]}>
      <LinearGradient colors={[colors.teal, colors.tealLight, '#2A7A72']} style={styles.header}>
        <View style={styles.headerGlow} />
        <View style={styles.headerRow}>
          <SegmentToggle left="TODAY" right="WEEK" active={mode} onChange={setMode} dark />
          <View style={styles.focus}>
            <Text style={styles.focusLabel}>ADHERENCE</Text>
            <Text style={styles.focusValue}>{streakLabel}</Text>
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
            <Text style={[styles.hey, { color: themeColors.ink }]}>
              Hey, {profile.displayName.toLowerCase()}
            </Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Reminders"
              style={styles.reminders}
              onPress={() => router.push('/(tabs)/settings')}
            >
              <Ionicons name="notifications-outline" size={18} color={colors.teal} />
              <Text style={styles.remindersLabel}>REMINDERS</Text>
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

        {latest ? (
          <FadeIn delay={120}>
            <GlucoseSummaryCard reading={latest} onLogPress={() => router.push('/(tabs)/glucose')} />
          </FadeIn>
        ) : null}

        <FadeIn delay={160}>
          <QuickLogBar />
        </FadeIn>

        {mode === 'left' ? (
          <FadeIn delay={200}>
            <SectionLabel>
              TODAY&apos;S MEDICATIONS ({todayDoseCount}/{dosesTotal})
            </SectionLabel>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.carousel}>
              {medications.map((m) => (
                <MedicationCard key={m.id} medication={m} onLogPress={() => logDose(m.id)} />
              ))}
            </ScrollView>
          </FadeIn>
        ) : (
          <FadeIn delay={200}>
            <SectionLabel>7-DAY OVERVIEW</SectionLabel>
            <View style={[styles.weekCard, { backgroundColor: themeColors.white, borderColor: themeColors.border }]}>
              <View style={styles.weekRow}>
                <View style={styles.weekStat}>
                  <Text style={[styles.weekValue, { color: colors.teal }]}>{todayDoseCount}/{dosesTotal}</Text>
                  <Text style={[styles.weekLabel, { color: themeColors.inkDim }]}>Doses today</Text>
                </View>
                <View style={[styles.weekDivider, { backgroundColor: themeColors.border }]} />
                <View style={styles.weekStat}>
                  <Text style={[styles.weekValue, { color: colors.teal }]}>{avgGlucose}</Text>
                  <Text style={[styles.weekLabel, { color: themeColors.inkDim }]}>Avg glucose</Text>
                </View>
                <View style={[styles.weekDivider, { backgroundColor: themeColors.border }]} />
                <View style={styles.weekStat}>
                  <Text style={[styles.weekValue, { color: colors.teal }]}>{weekTrend.filter(v => v >= 4.0 && v <= 7.0).length}/7</Text>
                  <Text style={[styles.weekLabel, { color: themeColors.inkDim }]}>In range</Text>
                </View>
              </View>
              <PrimaryButton
                label="FULL REPORT"
                variant="outline"
                style={styles.weekBtn}
                onPress={() => router.push('/report')}
              />
            </View>
          </FadeIn>
        )}
      </ScrollView>

      <StickyActionBar
        label="LOG NEXT DOSE"
        icon="💊"
        onPress={() => {
          const next = medications.find((m) => m.status !== 'taken');
          if (next) router.push(`/medication/${next.id}`);
          else router.push('/(tabs)/meds');
        }}
      />

      <HypoModal value={hypoAlert} onDismiss={dismissHypo} />
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
  weekCard: {
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: 20,
    marginBottom: 24,
  },
  weekRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  weekStat: { flex: 1, alignItems: 'center' },
  weekValue: { fontFamily: fonts.display, fontSize: 26, marginBottom: 4 },
  weekLabel: { fontFamily: fonts.body, fontSize: 12, textAlign: 'center' },
  weekDivider: { width: 1, height: 48, marginHorizontal: 8 },
  weekBtn: { alignSelf: 'stretch' },
});
