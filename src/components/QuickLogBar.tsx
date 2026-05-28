import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useMedications } from '@/db/useMedications';
import { useTheme } from '@/theme/ThemeContext';
import { radius, shadow } from '@/theme/tokens';
import { fonts } from '@/theme/typography';

type Action = {
  id: string;
  label: string;
  icon: 'medical' | 'water' | 'document-text';
  onPress: () => void;
};

export function QuickLogBar() {
  const { colors } = useTheme();
  const { medications } = useMedications();

  const nextUntaken = medications.find((m) => m.status !== 'taken');

  const actions: Action[] = [
    {
      id: 'dose',
      label: nextUntaken ? 'Log dose' : 'All done!',
      icon: 'medical',
      onPress: () => {
        if (nextUntaken) router.push(`/medication/${nextUntaken.id}`);
        else router.push('/(tabs)/meds');
      },
    },
    {
      id: 'glucose',
      label: 'Glucose',
      icon: 'water',
      onPress: () => router.push('/(tabs)/glucose'),
    },
    {
      id: 'report',
      label: 'Report',
      icon: 'document-text',
      onPress: () => router.push('/report'),
    },
  ];

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
          onPress={a.onPress}
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
