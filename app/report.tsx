import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { FadeIn } from '@/components/FadeIn';
import { PrimaryButton } from '@/components/PrimaryButton';
import { reportTimeSlots, wellnessResources } from '@/data/content';
import { useTheme } from '@/theme/ThemeContext';
import { radius, shadow } from '@/theme/tokens';
import { fonts } from '@/theme/typography';

const tabs = ['Summary', 'Adherence', 'Glucose', 'Export'] as const;

export default function ReportScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]>('Summary');
  const [selectedRange, setSelectedRange] = useState(reportTimeSlots[0].time);

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
              <Text style={styles.galleryEmoji}>📊</Text>
            </LinearGradient>
            <View style={styles.gallerySide}>
              <View style={[styles.galleryTile, { backgroundColor: colors.cream }]}>
                <Text style={styles.galleryEmoji}>💊</Text>
              </View>
              <View style={[styles.galleryTile, { backgroundColor: colors.goldBg }]}>
                <Text style={styles.galleryEmoji}>🩸</Text>
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

        <PrimaryButton label="GENERATE PDF" style={styles.generate} />
        <Text style={[styles.disclaimer, { color: colors.inkDim }]}>
          Reports are generated on-device. Share only through the system share sheet. Not a substitute for medical
          advice.
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
  bookLabel: { fontFamily: fonts.bodyBold, fontSize: 15, marginBottom: 14 },
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
