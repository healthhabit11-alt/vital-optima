import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppIcon } from '@/components/AppIcon';
import { FadeIn } from '@/components/FadeIn';
import { PrimaryButton } from '@/components/PrimaryButton';
import { reportTimeSlots, wellnessResources } from '@/data/content';
import { useMedications } from '@/db/useMedications';
import { useGlucose } from '@/db/useGlucose';
import { useTheme } from '@/theme/ThemeContext';
import { radius, shadow } from '@/theme/tokens';
import { fonts } from '@/theme/typography';

const tabs = ['Summary', 'Adherence', 'Glucose', 'Export'] as const;

export default function ReportScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]>('Summary');
  const [selectedRange, setSelectedRange] = useState(reportTimeSlots[0].time);

  const { medications, todayDoseCount, doseHistory } = useMedications();
  const { readings, weekTrend } = useGlucose();

  const avgGlucose = (weekTrend.reduce((a, b) => a + b, 0) / weekTrend.length).toFixed(1);
  const inRangeCount = weekTrend.filter((v) => v >= 4.0 && v <= 7.0).length;

  return (
    <View style={[styles.root, { paddingTop: insets.top, backgroundColor: colors.white }]}>
      <View style={styles.topBar}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Close"
          style={[styles.roundBtn, { backgroundColor: colors.cream }]}
          onPress={() => router.back()}
        >
          <Ionicons name="close" size={22} color={colors.ink} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <FadeIn delay={0}>
          <Text style={[styles.name, { color: colors.ink }]}>Visit summary</Text>
          <Text style={[styles.meta, { color: colors.inkMuted }]}>{wellnessResources.summary}</Text>
          <Text style={[styles.meta, { color: colors.inkMuted }]}>{wellnessResources.address}</Text>

          <View style={styles.gallery}>
            <LinearGradient colors={[colors.tealMuted, colors.cream]} style={styles.galleryMain}>
              <AppIcon name="history" size={52} color={colors.teal} />
            </LinearGradient>
            <View style={styles.gallerySide}>
              <View style={[styles.galleryTile, { backgroundColor: colors.cream }]}>
                <AppIcon name="med" size={32} color={colors.teal} />
              </View>
              <View style={[styles.galleryTile, { backgroundColor: colors.goldBg }]}>
                <AppIcon name="glucose" size={32} color={colors.teal} />
              </View>
            </View>
          </View>
        </FadeIn>

        <View style={[styles.tabs, { borderBottomColor: colors.border }]}>
          {tabs.map((t) => (
            <Pressable key={t} accessibilityRole="tab" onPress={() => setActiveTab(t)} style={styles.tab}>
              <Text
                style={[
                  styles.tabText,
                  { color: activeTab === t ? colors.ink : colors.inkDim },
                  activeTab === t && styles.tabTextActive,
                ]}
              >
                {t}
              </Text>
              {activeTab === t ? <View style={[styles.tabUnderline, { backgroundColor: colors.ink }]} /> : null}
            </Pressable>
          ))}
        </View>

        {activeTab === 'Summary' && (
          <View>
            <View style={[styles.statRow, { backgroundColor: colors.cream, borderColor: colors.border }]}>
              <View style={styles.statItem}>
                <Text style={[styles.statVal, { color: colors.teal }]}>{todayDoseCount}/{medications.length}</Text>
                <Text style={[styles.statLbl, { color: colors.inkDim }]}>Today's doses</Text>
              </View>
              <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
              <View style={styles.statItem}>
                <Text style={[styles.statVal, { color: colors.teal }]}>{doseHistory.length}</Text>
                <Text style={[styles.statLbl, { color: colors.inkDim }]}>Total logged</Text>
              </View>
              <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
              <View style={styles.statItem}>
                <Text style={[styles.statVal, { color: colors.teal }]}>{readings.length}</Text>
                <Text style={[styles.statLbl, { color: colors.inkDim }]}>Readings</Text>
              </View>
            </View>
          </View>
        )}

        {activeTab === 'Adherence' && (
          <View>
            <Text style={[styles.sectionTitle, { color: colors.ink }]}>Dose log</Text>
            {doseHistory.length === 0 ? (
              <Text style={[styles.empty, { color: colors.inkDim }]}>No doses logged yet.</Text>
            ) : (
              doseHistory.slice(0, 20).map((log) => (
                <View key={log.id} style={[styles.logRow, { borderBottomColor: colors.border }]}>
                  <View style={[styles.logDot, { backgroundColor: colors.teal }]} />
                  <View style={styles.logText}>
                    <Text style={[styles.logName, { color: colors.ink }]}>{log.medicationName}</Text>
                    <Text style={[styles.logTime, { color: colors.inkDim }]}>{log.loggedAt}</Text>
                  </View>
                </View>
              ))
            )}
          </View>
        )}

        {activeTab === 'Glucose' && (
          <View>
            <View style={[styles.statRow, { backgroundColor: colors.cream, borderColor: colors.border }]}>
              <View style={styles.statItem}>
                <Text style={[styles.statVal, { color: colors.teal }]}>{avgGlucose}</Text>
                <Text style={[styles.statLbl, { color: colors.inkDim }]}>7-day avg</Text>
              </View>
              <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
              <View style={styles.statItem}>
                <Text style={[styles.statVal, { color: colors.teal }]}>{inRangeCount}/7</Text>
                <Text style={[styles.statLbl, { color: colors.inkDim }]}>In range</Text>
              </View>
              <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
              <View style={styles.statItem}>
                <Text style={[styles.statVal, { color: colors.teal }]}>{readings.length}</Text>
                <Text style={[styles.statLbl, { color: colors.inkDim }]}>Readings</Text>
              </View>
            </View>
            <Text style={[styles.sectionTitle, { color: colors.ink }]}>Recent readings</Text>
            {readings.length === 0 ? (
              <Text style={[styles.empty, { color: colors.inkDim }]}>No glucose readings yet.</Text>
            ) : (
              readings.slice(0, 10).map((r) => (
                <View key={r.id} style={[styles.logRow, { borderBottomColor: colors.border }]}>
                  <View style={[styles.logDot, { backgroundColor: r.inRange ? colors.teal : colors.terracotta }]} />
                  <Text style={[styles.logName, { color: colors.ink }]}>{r.value.toFixed(1)} mmol/L</Text>
                  <Text style={[styles.logTime, { color: colors.inkDim }]}>{r.loggedAt}</Text>
                </View>
              ))
            )}
          </View>
        )}

        {activeTab === 'Export' && (
          <View>
            <Text style={[styles.sectionTitle, { color: colors.ink }]}>Export your data</Text>
            <Text style={[styles.empty, { color: colors.inkDim }]}>
              PDF and JSON export will be generated on-device and shared via the system share sheet. No data leaves your phone without your action.
            </Text>
            <View style={[styles.formatRow, { borderColor: colors.border }]}>
              <View style={[styles.formatCard, { backgroundColor: colors.cream, borderColor: colors.border }]}>
                <Text style={styles.formatIcon}>📄</Text>
                <Text style={[styles.formatLabel, { color: colors.ink }]}>PDF</Text>
                <Text style={[styles.formatSub, { color: colors.inkDim }]}>For your clinician</Text>
              </View>
              <View style={[styles.formatCard, { backgroundColor: colors.cream, borderColor: colors.border }]}>
                <Text style={styles.formatIcon}>🗂️</Text>
                <Text style={[styles.formatLabel, { color: colors.ink }]}>JSON</Text>
                <Text style={[styles.formatSub, { color: colors.inkDim }]}>Raw data backup</Text>
              </View>
            </View>
          </View>
        )}

        <Text style={[styles.bookLabel, { color: colors.ink }]}>Report range</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {reportTimeSlots.map((slot) => {
            const selected = selectedRange === slot.time;
            return (
              <View key={slot.time} style={styles.slotWrap}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  onPress={() => setSelectedRange(slot.time)}
                  style={[
                    styles.slot,
                    { backgroundColor: selected ? colors.teal : colors.tealLight },
                    selected && shadow.card,
                  ]}
                >
                  <Text style={styles.slotTime}>{slot.time}</Text>
                </Pressable>
                <View style={[styles.discount, { backgroundColor: colors.tealMuted }]}>
                  <Text style={[styles.discountText, { color: colors.teal }]}>{slot.label}</Text>
                </View>
              </View>
            );
          })}
        </ScrollView>

        <PrimaryButton
          label="GENERATE PDF"
          style={styles.generate}
          onPress={() =>
            Alert.alert(
              'PDF Export',
              'On-device PDF generation is coming in v1.1. Your data is ready to share as JSON once that feature ships.',
              [{ text: 'Got it' }],
            )
          }
        />
        <Text style={[styles.disclaimer, { color: colors.inkDim }]}>
          Reports are generated on-device. Share only through the system share sheet. Not a substitute for medical advice.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  topBar: { paddingHorizontal: 16, paddingVertical: 8 },
  roundBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: { paddingHorizontal: 20, paddingBottom: 40 },
  name: { fontFamily: fonts.display, fontSize: 28, marginBottom: 8 },
  meta: { fontFamily: fonts.body, fontSize: 14, marginBottom: 4 },
  gallery: { flexDirection: 'row', gap: 8, height: 160, marginVertical: 20 },
  galleryMain: { flex: 1.2, borderRadius: radius.lg, alignItems: 'center', justifyContent: 'center' },
  gallerySide: { flex: 1, gap: 8 },
  galleryTile: { flex: 1, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  galleryEmoji: { fontSize: 40 },
  tabs: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingBottom: 8,
  },
  tab: { paddingBottom: 8 },
  tabText: { fontFamily: fonts.body, fontSize: 14 },
  tabTextActive: { fontFamily: fonts.bodyBold },
  tabUnderline: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 3 },
  statRow: {
    flexDirection: 'row',
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: 20,
    marginBottom: 20,
  },
  statItem: { flex: 1, alignItems: 'center' },
  statVal: { fontFamily: fonts.display, fontSize: 24, marginBottom: 4 },
  statLbl: { fontFamily: fonts.body, fontSize: 12, textAlign: 'center' },
  statDivider: { width: 1, marginHorizontal: 8 },
  sectionTitle: { fontFamily: fonts.bodyBold, fontSize: 15, marginBottom: 12 },
  empty: { fontFamily: fonts.body, fontSize: 14, lineHeight: 20, marginBottom: 20 },
  logRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 12,
    marginBottom: 2,
  },
  logDot: { width: 10, height: 10, borderRadius: 5 },
  logText: { flex: 1 },
  logName: { fontFamily: fonts.bodyBold, fontSize: 14, flex: 1 },
  logTime: { fontFamily: fonts.body, fontSize: 13 },
  formatRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  formatCard: {
    flex: 1,
    borderRadius: radius.md,
    borderWidth: 1,
    padding: 20,
    alignItems: 'center',
    gap: 8,
  },
  formatIcon: { fontSize: 32 },
  formatLabel: { fontFamily: fonts.bodyBold, fontSize: 16 },
  formatSub: { fontFamily: fonts.body, fontSize: 12, textAlign: 'center' },
  bookLabel: { fontFamily: fonts.bodyBold, fontSize: 15, marginBottom: 14, marginTop: 8 },
  slotWrap: { marginRight: 12, alignItems: 'center' },
  slot: {
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: radius.md,
    minWidth: 88,
    alignItems: 'center',
    minHeight: 44,
    justifyContent: 'center',
  },
  slotTime: { fontFamily: fonts.bodyBold, fontSize: 14, color: '#FFFFFF' },
  discount: {
    marginTop: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.pill,
  },
  discountText: { fontFamily: fonts.bodyBold, fontSize: 11 },
  generate: { marginTop: 28 },
  disclaimer: { fontFamily: fonts.body, fontSize: 12, lineHeight: 18, marginTop: 16 },
});
