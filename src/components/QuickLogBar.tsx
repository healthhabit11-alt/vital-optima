import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/theme/ThemeContext';
import { radius, shadow } from '@/theme/tokens';
import { fonts } from '@/theme/typography';

const actions = [
  { id: 'dose', label: 'Log dose', icon: 'medical' as const, href: '/medication/evening-arv' as const },
  { id: 'glucose', label: 'Glucose', icon: 'water' as const, href: '/(tabs)/glucose' as const },
  { id: 'symptom', label: 'Note', icon: 'document-text' as const, href: '/(tabs)/meds' as const },
] as const;

export function QuickLogBar() {
  const { colors } = useTheme();

  return (
    <View style={styles.row}>
      {actions.map((a) => (
        <Pressable
          key={a.id}
          accessibilityRole="button"
          accessibilityLabel={a.label}
          style={({ pressed }) => [
            styles.btn,
            shadow.card,
            {
              backgroundColor: colors.white,
              borderColor: colors.border,
            },
            pressed && styles.btnPressed,
          ]}
          onPress={() => router.push(a.href)}
        >
          <View style={[styles.iconWrap, { backgroundColor: colors.tealMuted }]}>
            <Ionicons name={a.icon} size={20} color={colors.teal} />
          </View>
          <Text style={[styles.label, { color: colors.teal }]}>{a.label}</Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 24,
  },
  btn: {
    flex: 1,
    minHeight: 80,
    borderRadius: radius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 8,
  },
  btnPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontFamily: fonts.bodyBold,
    fontSize: 12,
  },
});
