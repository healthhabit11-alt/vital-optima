import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { FadeIn } from '@/components/FadeIn';
import { MedicationCard } from '@/components/MedicationCard';
import { SectionLabel } from '@/components/SectionLabel';
import { SegmentToggle } from '@/components/SegmentToggle';
import { TealHeader } from '@/components/TealHeader';
import { TrackerCategoryRow } from '@/components/TrackerCategoryRow';
import { radius, shadow } from '@/theme/tokens';
import { medicationCategories } from '@/data/content';
import { useMedications } from '@/db/useMedications';
import { useUserProfile } from '@/db/useUserProfile';
import { useTheme } from '@/theme/ThemeContext';
import { fonts } from '@/theme/typography';

export default function MedsScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const [mode, setMode] = useState<'left' | 'right'>('left');
  const [query, setQuery] = useState('');

  const { medications } = useMedications();
  const { profile } = useUserProfile();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return medications;
    return medications.filter(
      (m) => m.name.toLowerCase().includes(q) || m.schedule.toLowerCase().includes(q),
    );
  }, [query, medications]);

  return (
    <View style={[styles.root, { backgroundColor: colors.white }]}>
      <TealHeader topInset={insets.top}>
        <View style={styles.headerTop}>
          <SegmentToggle left="SCHEDULE" right="LOG" active={mode} onChange={setMode} dark />
          <View style={styles.region}>
            <Text style={styles.regionLabel}>REGION</Text>
            <Text style={styles.regionValue}>{profile.region} · local data</Text>
          </View>
        </View>
        <View style={styles.search}>
          <Ionicons name="search" size={18} color="rgba(255,255,255,0.6)" />
          <TextInput
            accessibilityLabel="Search medications"
            placeholder="Search medications…"
            placeholderTextColor="rgba(255,255,255,0.5)"
            style={styles.searchInput}
            value={query}
            onChangeText={setQuery}
          />
        </View>
      </TealHeader>

      <ScrollView
        style={styles.body}
        contentContainerStyle={[styles.bodyContent, { paddingBottom: insets.bottom + 24 }]}
        showsVerticalScrollIndicator={false}
      >
        <FadeIn delay={0}>
          <View style={styles.quickRow}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Today's doses"
              style={[styles.quickBtn, shadow.card, { backgroundColor: colors.cream, borderColor: colors.border }]}
            >
              <Ionicons name="today" size={20} color={colors.teal} />
              <Text style={[styles.quickLabel, { color: colors.teal }]}>Today</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Saved medications"
              style={[styles.quickBtn, shadow.card, { backgroundColor: colors.cream, borderColor: colors.border }]}
            >
              <Ionicons name="bookmark" size={20} color={colors.teal} />
              <Text style={[styles.quickLabel, { color: colors.teal }]}>Saved</Text>
            </Pressable>
          </View>
        </FadeIn>

        <FadeIn delay={80}>
          <SectionLabel>DUE TODAY ({filtered.length})</SectionLabel>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.carousel}>
            {filtered.map((m) => (
              <MedicationCard key={m.id} medication={m} compact />
            ))}
          </ScrollView>
        </FadeIn>

        <FadeIn delay={140}>
          <SectionLabel>BROWSE</SectionLabel>
          {medicationCategories.map((c) => (
            <TrackerCategoryRow key={c.id} category={c} />
          ))}
        </FadeIn>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 12,
    zIndex: 1,
  },
  region: { flex: 1, alignItems: 'flex-end' },
  regionLabel: {
    fontFamily: fonts.body,
    fontSize: 10,
    letterSpacing: 1,
    color: 'rgba(255,255,255,0.65)',
  },
  regionValue: {
    fontFamily: fonts.bodyBold,
    fontSize: 11,
    color: '#FFFFFF',
    textAlign: 'right',
  },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.22)',
    borderRadius: radius.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 10,
    zIndex: 1,
  },
  searchInput: { flex: 1, fontFamily: fonts.body, fontSize: 15, color: '#FFFFFF' },
  body: { flex: 1 },
  bodyContent: { paddingHorizontal: 20, paddingTop: 20 },
  quickRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  quickBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: radius.md,
    paddingVertical: 16,
    minHeight: 56,
    borderWidth: 1,
  },
  quickLabel: { fontFamily: fonts.bodyBold, fontSize: 14 },
  carousel: { marginBottom: 8, marginHorizontal: -20, paddingHorizontal: 20 },
});
