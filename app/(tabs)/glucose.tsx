import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SectionLabel } from '@/components/SectionLabel';
import { radius } from '@/theme/tokens';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { GlucoseSummaryCard } from '@/components/GlucoseSummaryCard';
import { HypoModal } from '@/components/HypoModal';
import { PrimaryButton } from '@/components/PrimaryButton';
import { useGlucose } from '@/db/useGlucose';
import { useUserProfile } from '@/db/useUserProfile';
import { glucoseQuickActions } from '@/data/content';
import { useTheme } from '@/theme/ThemeContext';
import { fonts } from '@/theme/typography';

export default function GlucoseScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const [tab, setTab] = useState<'trend' | 'log'>('trend');
  const [draftValue, setDraftValue] = useState('');

  const { profile } = useUserProfile();
  const { readings, latest, weekTrend, logReading, hypoAlert, dismissHypo } = useGlucose();

  const max = Math.max(...weekTrend, 1);

  const handleSave = () => {
    const val = parseFloat(draftValue.replace(',', '.'));
    if (!isNaN(val) && val > 0) {
      logReading(val);
      setDraftValue('');
    }
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top, backgroundColor: colors.white }]}>
      <View style={styles.tabs}>
        <Pressable accessibilityRole="tab" onPress={() => setTab('trend')} style={styles.tab}>
          <Text style={[styles.tabText, tab === 'trend' && styles.tabActive, { color: tab === 'trend' ? colors.ink : colors.inkDim }]}>
            Trend
          </Text>
          {tab === 'trend' ? <View style={[styles.tabLine, { backgroundColor: colors.ink }]} /> : null}
        </Pressable>
        <Pressable accessibilityRole="tab" onPress={() => setTab('log')} style={styles.tab}>
          <Text style={[styles.tabText, tab === 'log' && styles.tabActive, { color: tab === 'log' ? colors.ink : colors.inkDim }]}>
            Log
          </Text>
          {tab === 'log' ? <View style={[styles.tabLine, { backgroundColor: colors.ink }]} /> : null}
        </Pressable>
      </View>

      <Pressable style={styles.locationRow}>
        <Text style={[styles.location, { color: colors.ink }]}>{profile.region} · {profile.unit}</Text>
        <Ionicons name="chevron-down" size={18} color={colors.ink} />
      </Pressable>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {tab === 'trend' ? (
          <>
            {latest ? (
              <GlucoseSummaryCard reading={latest} onLogPress={() => setTab('log')} />
            ) : (
              <Pressable
                accessibilityRole="button"
                style={[styles.emptyCard, { backgroundColor: colors.cream, borderColor: colors.border }]}
                onPress={() => setTab('log')}
              >
                <Text style={[styles.emptyText, { color: colors.inkDim }]}>No readings yet — tap to log one</Text>
              </Pressable>
            )}

            <SectionLabel>7-DAY TREND</SectionLabel>
            <View style={[styles.chart, { backgroundColor: colors.cream, borderColor: colors.border }]} accessibilityLabel="Seven day glucose trend chart">
              {weekTrend.map((v, i) => {
                const h = Math.max(12, (v / max) * 96);
                const inRange = v >= 4.0 && v <= 7.0;
                return (
                  <View key={i} style={styles.barWrap}>
                    <LinearGradient
                      colors={inRange ? [colors.tealLight, colors.mint] : [colors.terracotta, colors.gold]}
                      style={[styles.bar, { height: h }]}
                    />
                    <Text style={[styles.barLabel, { color: colors.inkDim }]}>{['M', 'T', 'W', 'T', 'F', 'S', 'S'][i]}</Text>
                  </View>
                );
              })}
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chips}>
              {glucoseQuickActions.map((c) => (
                <Pressable
                  key={c.id}
                  accessibilityRole="button"
                  accessibilityLabel={c.label}
                  style={styles.chip}
                  onPress={() => {
                    if (c.id === 'log') setTab('log');
                  }}
                >
                  <Text style={styles.chipIcon}>{c.icon}</Text>
                  <Text style={[styles.chipLabel, { color: colors.ink }]}>{c.label}</Text>
                </Pressable>
              ))}
            </ScrollView>
          </>
        ) : (
          <>
            <Text style={[styles.logHeading, { color: colors.ink }]}>Log a reading</Text>
            <Text style={[styles.logHint, { color: colors.inkMuted }]}>
              Stored on-device only. Not shared automatically.
            </Text>
            <View style={[styles.logField, { borderColor: colors.border, backgroundColor: colors.cream }]}>
              <TextInput
                accessibilityLabel="Glucose value in mmol per liter"
                keyboardType="decimal-pad"
                placeholder="e.g. 5.2"
                placeholderTextColor={colors.inkDim}
                value={draftValue}
                onChangeText={setDraftValue}
                style={[styles.logInput, { color: colors.ink }]}
              />
              <Text style={[styles.logUnit, { color: colors.inkMuted }]}>{profile.unit}</Text>
            </View>
            <PrimaryButton label="SAVE READING" style={styles.saveBtn} onPress={handleSave} />

            {readings.length > 0 ? (
              <>
                <Text style={[styles.recentTitle, { color: colors.ink }]}>Recent</Text>
                {readings.slice(0, 10).map((log) => (
                  <View key={log.id} style={[styles.recentRow, { borderBottomColor: colors.border }]}>
                    <Text style={[styles.recentValue, { color: colors.ink }]}>
                      {log.value.toFixed(1)} {profile.unit}
                    </Text>
                    <Text style={[styles.recentTime, { color: colors.inkDim }]}>{log.loggedAt}</Text>
                  </View>
                ))}
              </>
            ) : null}
          </>
        )}

        <LinearGradient colors={['#E8F2F1', colors.cream]} style={styles.promo}>
          <Text style={styles.promoBrand}>VitalOptima</Text>
          <Text style={styles.promoTitle}>Reading below 3.9 mmol/L?</Text>
          <Text style={styles.promoSub}>
            The hypo protocol shows within the app. Always follow your care plan.
          </Text>
          <Text style={styles.promoNote}>Emergency (AU): 000</Text>
        </LinearGradient>

        <Pressable
          accessibilityRole="button"
          style={styles.reportLink}
          onPress={() => router.push('/report')}
        >
          <Text style={styles.reportLinkText}>Prepare visit summary →</Text>
        </Pressable>
      </ScrollView>

      <HypoModal value={hypoAlert} onDismiss={dismissHypo} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, paddingHorizontal: 20 },
  tabs: { flexDirection: 'row', gap: 24, marginTop: 8, marginBottom: 12 },
  tab: { paddingBottom: 8, minHeight: 44, justifyContent: 'center' },
  tabText: { fontFamily: fonts.body, fontSize: 17 },
  tabActive: { fontFamily: fonts.bodyBold },
  tabLine: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, borderRadius: 2 },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 16 },
  location: { fontFamily: fonts.bodyBold, fontSize: 16 },
  scroll: { paddingBottom: 32 },
  emptyCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyText: { fontFamily: fonts.body, fontSize: 14 },
  chart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 128,
    gap: 8,
    marginBottom: 24,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: radius.lg,
    borderWidth: 1,
  },
  barWrap: { flex: 1, alignItems: 'center', height: '100%', justifyContent: 'flex-end' },
  bar: { width: '100%', maxWidth: 28, borderRadius: 4, minHeight: 8 },
  barLabel: { fontFamily: fonts.body, fontSize: 10, marginTop: 6 },
  chips: { marginBottom: 20, marginHorizontal: -20, paddingHorizontal: 20 },
  chip: { width: 88, alignItems: 'center', marginRight: 12 },
  chipIcon: { fontSize: 28, width: 72, height: 72, textAlign: 'center', lineHeight: 72, backgroundColor: '#E8F2F1', borderRadius: 12, marginBottom: 8 },
  chipLabel: { fontFamily: fonts.bodyBold, fontSize: 12, textAlign: 'center' },
  logHeading: { fontFamily: fonts.display, fontSize: 24, marginBottom: 8 },
  logHint: { fontFamily: fonts.body, fontSize: 14, lineHeight: 20, marginBottom: 16 },
  logField: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 12, paddingHorizontal: 16, marginBottom: 16 },
  logInput: { flex: 1, fontFamily: fonts.display, fontSize: 32, paddingVertical: 16 },
  logUnit: { fontFamily: fonts.bodyMedium, fontSize: 15 },
  saveBtn: { marginBottom: 28 },
  recentTitle: { fontFamily: fonts.bodyBold, fontSize: 15, marginBottom: 12 },
  recentRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 14, borderBottomWidth: StyleSheet.hairlineWidth },
  recentValue: { fontFamily: fonts.bodyBold, fontSize: 15 },
  recentTime: { fontFamily: fonts.body, fontSize: 13 },
  promo: { borderRadius: 16, padding: 22, marginBottom: 20, marginTop: 8 },
  promoBrand: { fontFamily: fonts.bodyBold, fontSize: 14, color: '#0D4F4A', marginBottom: 8 },
  promoTitle: { fontFamily: fonts.display, fontSize: 22, lineHeight: 26, color: '#0D4F4A', marginBottom: 8 },
  promoSub: { fontFamily: fonts.body, fontSize: 14, lineHeight: 20, color: '#1A6B64', marginBottom: 8 },
  promoNote: { fontFamily: fonts.bodyBold, fontSize: 13, color: '#C45C4A' },
  reportLink: { paddingVertical: 12, minHeight: 44, justifyContent: 'center' },
  reportLinkText: { fontFamily: fonts.bodyBold, fontSize: 15, color: '#C45C4A' },
});
