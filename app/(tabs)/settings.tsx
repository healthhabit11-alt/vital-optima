import { Ionicons } from '@expo/vector-icons';
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/theme/ThemeContext';
import { useMedications } from '@/db/useMedications';
import { useUserProfile } from '@/db/useUserProfile';
import { useThemedStyles } from '@/theme/useThemedStyles';
import { fonts } from '@/theme/typography';

type SettingsItem = {
  id: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  danger?: boolean;
};

const settingsItems: SettingsItem[] = [
  { id: 'notifications', label: 'Notification preferences', icon: 'notifications-outline' },
  { id: 'export', label: 'Export data (JSON + PDF)', icon: 'download-outline' },
  { id: 'delete', label: 'Delete all data', icon: 'trash-outline', danger: true },
  { id: 'privacy', label: 'Privacy policy', icon: 'shield-outline' },
];

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const { resolved, setMode } = useTheme();
  const { profile } = useUserProfile();
  const { medications, todayDoseCount } = useMedications();
  const isDark = resolved === 'dark';
  const styles = useThemedStyles((c) =>
    StyleSheet.create({
      root: { flex: 1, backgroundColor: c.cream, paddingHorizontal: 24 },
      avatar: {
        width: 88,
        height: 88,
        borderRadius: 44,
        backgroundColor: c.teal,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
        alignSelf: 'center',
      },
      avatarText: { fontFamily: fonts.display, fontSize: 36, color: c.white },
      name: { fontFamily: fonts.display, fontSize: 28, color: c.ink, marginBottom: 4, textAlign: 'center' },
      sub: { fontFamily: fonts.body, fontSize: 14, color: c.inkMuted, marginBottom: 28, textAlign: 'center' },
      stats: {
        flexDirection: 'row',
        backgroundColor: c.white,
        borderRadius: 16,
        padding: 20,
        marginBottom: 28,
        borderWidth: 1,
        borderColor: c.border,
      },
      stat: { flex: 1, alignItems: 'center' },
      statValue: { fontFamily: fonts.display, fontSize: 22, color: c.teal, marginBottom: 4 },
      statLabel: { fontFamily: fonts.body, fontSize: 12, color: c.inkDim },
      menu: {
        backgroundColor: c.white,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: c.border,
        overflow: 'hidden',
        marginBottom: 32,
      },
      menuRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 18,
        minHeight: 56,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: c.border,
      },
      menuLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
      menuText: { fontFamily: fonts.bodyMedium, fontSize: 16, color: c.ink },
      menuDanger: { color: c.terracotta },
    }),
  );

  return (
    <ScrollView
      style={[styles.root, { paddingTop: insets.top + 20 }]}
      contentContainerStyle={{ alignItems: 'center', paddingBottom: insets.bottom + 24 }}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{profile.displayName[0]}</Text>
      </View>
      <Text style={styles.name}>{profile.displayName}</Text>
      <Text style={styles.sub}>Local profile · offline-first</Text>

      <View style={styles.stats}>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{profile.region}</Text>
          <Text style={styles.statLabel}>Region</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statValue}>
            {todayDoseCount}/{medications.length}
          </Text>
          <Text style={styles.statLabel}>Today</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{profile.pinHash ? 'PIN' : 'None'}</Text>
          <Text style={styles.statLabel}>{profile.pinHash ? 'Secured' : 'No PIN'}</Text>
        </View>
      </View>

      <View style={styles.menu}>
        <View style={styles.menuRow}>
          <View style={styles.menuLeft}>
            <Ionicons name="moon-outline" size={20} color={styles.statValue.color} />
            <Text style={styles.menuText}>Dark mode</Text>
          </View>
          <Switch
            accessibilityLabel="Toggle dark mode"
            value={isDark}
            onValueChange={(v) => setMode(v ? 'dark' : 'light')}
            trackColor={{ false: '#E8E2D9', true: '#0D4F4A' }}
          />
        </View>
        {settingsItems.map((item) => (
          <Pressable
            key={item.id}
            accessibilityRole="button"
            accessibilityLabel={item.label}
            style={styles.menuRow}
          >
            <View style={styles.menuLeft}>
              <Ionicons
                name={item.icon}
                size={20}
                color={item.danger ? '#C45C4A' : '#0D4F4A'}
              />
              <Text style={[styles.menuText, item.danger && styles.menuDanger]}>{item.label}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#9C958D" />
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}
