import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AppIcon } from './AppIcon';
import type { TrackerCategory } from '@/data/content';
import { useTheme } from '@/theme/ThemeContext';
import { radius, shadow } from '@/theme/tokens';
import { fonts } from '@/theme/typography';

type TrackerCategoryRowProps = {
  category: TrackerCategory;
  onPress?: () => void;
};

export function TrackerCategoryRow({ category, onPress }: TrackerCategoryRowProps) {
  const { colors } = useTheme();
  const handlePress = onPress ?? (() => router.push('/(tabs)/meds'));

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={category.title}
      onPress={handlePress}
      style={({ pressed }) => [
        styles.row,
        { borderBottomColor: colors.border },
        pressed && styles.rowPressed,
      ]}
    >
      <View style={[styles.thumb, shadow.card, { backgroundColor: category.tint }]}>
        <AppIcon name={category.icon} size={32} color={colors.teal} />
      </View>
      <View style={styles.text}>
        <Text style={[styles.title, { color: colors.teal }]}>{category.title}</Text>
        <Text style={[styles.desc, { color: colors.inkMuted }]} numberOfLines={2}>
          {category.description}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.inkDim} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 14,
  },
  rowPressed: {
    opacity: 0.88,
  },
  thumb: {
    width: 72,
    height: 72,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 32,
  },
  text: {
    flex: 1,
  },
  title: {
    fontFamily: fonts.bodyBold,
    fontSize: 17,
    marginBottom: 4,
  },
  desc: {
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 20,
  },
});
