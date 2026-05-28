import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { MedicationCard } from '@/components/MedicationCard';
import { PrimaryButton } from '@/components/PrimaryButton';
import { StickyActionBar } from '@/components/StickyActionBar';
import { getMedicationDetail } from '@/data/content';
import { useMedications } from '@/db/useMedications';
import type { MedicationComponent } from '@/data/content';
import { colors } from '@/theme/colors';
import { useTheme } from '@/theme/ThemeContext';
import { fonts } from '@/theme/typography';

function defaultComponents(name: string): MedicationComponent[] {
  return [
    { id: 'dose', title: `${name} dose`, meta: 'As prescribed · log when taken', flagged: true, action: 'customize', icon: '💊' },
    { id: 'food', title: 'Take with food', meta: 'Check timing with your care plan', action: 'swap', icon: '🥗' },
    { id: 'interaction', title: 'Interaction check', meta: 'No conflicts logged today', action: 'customize', icon: '✓' },
  ];
}

export default function MedicationDetailScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();

  const { colors: themeColors } = useTheme();
  const { medications, logDose, todayDoseCount } = useMedications();

  const liveMed = useMemo(() => medications.find((m) => m.id === id), [medications, id]);
  const staticDetail = useMemo(() => (id ? getMedicationDetail(id) : undefined), [id]);

  const med = liveMed ?? staticDetail;
  const components = staticDetail?.components ?? (med ? defaultComponents(med.name) : []);
  const logged = (liveMed?.status ?? staticDetail?.status) === 'taken';

  if (!med) {
    return (
      <View style={[styles.missing, { backgroundColor: themeColors.cream }]}>
        <Text style={styles.missingTitle}>Medication not found</Text>
        <PrimaryButton label="Go back" onPress={() => router.back()} />
      </View>
    );
  }

  return (
    <View style={[styles.root, { backgroundColor: themeColors.white }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.heroWrap}>
          <LinearGradient colors={med.gradient} style={styles.hero}>
            <Text style={styles.heroIcon}>{med.icon}</Text>
          </LinearGradient>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Go back"
            style={[styles.back, { top: insets.top + 8 }]}
            onPress={() => router.back()}
          >
            <Ionicons name="chevron-back" size={22} color={colors.ink} />
          </Pressable>

          <View style={[styles.heroActions, { top: insets.top + 8 }]}>
            <Pressable accessibilityRole="button" accessibilityLabel="Share" style={styles.iconBtn}>
              <Ionicons name="share-outline" size={20} color={colors.teal} />
            </Pressable>
          </View>

          <PrimaryButton
            label={logged ? 'LOGGED' : 'LOG TAKEN'}
            variant="teal"
            style={logged ? { ...styles.logBtn, ...styles.logBtnDone } : styles.logBtn}
            onPress={() => { if (id && !logged) logDose(id); }}
          />
        </View>

        <View style={styles.body}>
          <Text style={[styles.title, { color: themeColors.ink }]}>{med.name}</Text>
          <Text style={[styles.meta, { color: themeColors.inkMuted }]}>{med.schedule}</Text>
          <Text style={styles.flag}>
            {logged ? 'LOGGED TODAY' : 'SCHEDULED DOSE'}
          </Text>

          {components.map((c) => (
            <View key={c.id} style={[styles.row, { borderTopColor: themeColors.border }]}>
              <View style={[styles.thumb, { backgroundColor: themeColors.cream }]}>
                <Text style={styles.thumbIcon}>{c.icon}</Text>
              </View>
              <View style={styles.rowText}>
                <Text style={[styles.rowTitle, { color: themeColors.ink }]}>{c.title}</Text>
                <Text style={[styles.rowMeta, { color: themeColors.inkMuted }]}>{c.meta}</Text>
                {c.flagged ? <Text style={styles.rowFlag}>CHECKED</Text> : null}
              </View>
              <PrimaryButton
                label={c.action === 'customize' ? 'EDIT' : 'SWAP'}
                variant="outline"
                style={styles.rowAction}
              />
            </View>
          ))}

          <Text style={[styles.note, { color: themeColors.inkDim }]}>
            Food and drug notes are for wellness support only. Contact your prescriber for clinical decisions.
          </Text>

          <Text style={[styles.relatedTitle, { color: themeColors.ink }]}>Also today</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {medications
              .filter((m) => m.id !== med.id)
              .map((m) => (
                <MedicationCard key={m.id} medication={m} compact onLogPress={() => logDose(m.id)} />
              ))}
          </ScrollView>
        </View>
      </ScrollView>

      <StickyActionBar
        label={`TODAY'S DOSES (${todayDoseCount}/${medications.length})`}
        onPress={() => { if (id && !logged) logDose(id); }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.white },
  missing: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 16 },
  missingTitle: { fontFamily: fonts.bodyBold, fontSize: 18, color: colors.ink },
  heroWrap: { position: 'relative', marginBottom: 8 },
  hero: { height: 300, alignItems: 'center', justifyContent: 'center' },
  heroIcon: { fontSize: 100 },
  back: {
    position: 'absolute',
    left: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroActions: { position: 'absolute', right: 16, flexDirection: 'row', gap: 8 },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logBtn: { position: 'absolute', bottom: 20, right: 16, paddingHorizontal: 24 },
  logBtnDone: { opacity: 0.85 },
  body: { paddingHorizontal: 20, paddingBottom: 100 },
  title: { fontFamily: fonts.bodyBold, fontSize: 24, marginBottom: 6 },
  meta: { fontFamily: fonts.body, fontSize: 15, marginBottom: 6 },
  flag: { fontFamily: fonts.bodyBold, fontSize: 11, letterSpacing: 0.8, color: colors.teal, marginBottom: 20 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    gap: 12,
  },
  thumb: {
    width: 56,
    height: 56,
    borderRadius: 8,
    backgroundColor: colors.cream,
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbIcon: { fontSize: 24 },
  rowText: { flex: 1 },
  rowTitle: { fontFamily: fonts.bodyBold, fontSize: 15, marginBottom: 2 },
  rowMeta: { fontFamily: fonts.body, fontSize: 13 },
  rowFlag: { fontFamily: fonts.bodyBold, fontSize: 10, color: colors.teal, marginTop: 4 },
  rowAction: { paddingVertical: 8, paddingHorizontal: 10 },
  note: {
    fontFamily: fonts.body,
    fontSize: 13,
    lineHeight: 18,
    marginTop: 16,
    marginBottom: 24,
  },
  relatedTitle: { fontFamily: fonts.bodyBold, fontSize: 17, marginBottom: 14 },
});
