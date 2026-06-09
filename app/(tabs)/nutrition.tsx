import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppIcon } from '@/components/AppIcon';
import { SectionLabel } from '@/components/SectionLabel';
import { PrimaryButton } from '@/components/PrimaryButton';
import {
  MEAL_ICONS,
  MEAL_LABELS,
  MEAL_ORDER,
  MealType,
  useNutrition,
} from '@/db/useNutrition';
import { useTheme } from '@/theme/ThemeContext';
import { fonts } from '@/theme/typography';
import { radius } from '@/theme/tokens';

const GOLD = '#C9A227';
const GOLD_BG = '#FFF8E6';

type MacroPillProps = {
  label: string;
  value: number;
  unit: string;
  color: string;
  bg: string;
};

function MacroPill({ label, value, unit, color, bg }: MacroPillProps) {
  return (
    <View style={[pillStyles.root, { backgroundColor: bg }]}>
      <Text style={[pillStyles.value, { color }]}>{value}</Text>
      <Text style={[pillStyles.unit, { color }]}>{unit}</Text>
      <Text style={pillStyles.label}>{label}</Text>
    </View>
  );
}

const pillStyles = StyleSheet.create({
  root: { flex: 1, borderRadius: 14, padding: 14, alignItems: 'center' },
  value: { fontFamily: fonts.display, fontSize: 22, lineHeight: 26 },
  unit: { fontFamily: fonts.bodyBold, fontSize: 11, marginBottom: 2 },
  label: { fontFamily: fonts.body, fontSize: 11, color: '#9C958D' },
});

export default function NutritionScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { meals, dailyTotals, addFoodItem, deleteFoodItem } = useNutrition();

  const [tab, setTab] = useState<'today' | 'log'>('today');
  const [selectedMeal, setSelectedMeal] = useState<MealType>('breakfast');
  const [foodName, setFoodName] = useState('');
  const [calories, setCalories] = useState('');
  const [carbs, setCarbs] = useState('');
  const [protein, setProtein] = useState('');
  const [fat, setFat] = useState('');

  const resetForm = () => {
    setFoodName('');
    setCalories('');
    setCarbs('');
    setProtein('');
    setFat('');
  };

  const handleSave = () => {
    if (!foodName.trim()) return;
    addFoodItem(selectedMeal, {
      name: foodName,
      calories: parseInt(calories, 10) || 0,
      carbsG: parseFloat(carbs) || 0,
      proteinG: parseFloat(protein) || 0,
      fatG: parseFloat(fat) || 0,
    });
    resetForm();
    setTab('today');
  };

  const handleDelete = (id: number, name: string) => {
    Alert.alert('Remove item', `Remove "${name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => deleteFoodItem(id) },
    ]);
  };

  const totalItems = meals.reduce((n, m) => n + m.items.length, 0);

  return (
    <View style={[styles.root, { paddingTop: insets.top, backgroundColor: colors.white }]}>
      <View style={styles.tabs}>
        <Pressable accessibilityRole="tab" onPress={() => setTab('today')} style={styles.tab}>
          <Text style={[styles.tabText, tab === 'today' && styles.tabActive, { color: tab === 'today' ? colors.ink : colors.inkDim }]}>
            Today
          </Text>
          {tab === 'today' && <View style={[styles.tabLine, { backgroundColor: colors.ink }]} />}
        </Pressable>
        <Pressable accessibilityRole="tab" onPress={() => setTab('log')} style={styles.tab}>
          <Text style={[styles.tabText, tab === 'log' && styles.tabActive, { color: tab === 'log' ? colors.ink : colors.inkDim }]}>
            Log food
          </Text>
          {tab === 'log' && <View style={[styles.tabLine, { backgroundColor: colors.ink }]} />}
        </Pressable>
      </View>

      {tab === 'today' ? (
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <LinearGradient
            colors={[GOLD_BG, '#FFF3CC']}
            style={[styles.calorieCard, { borderColor: '#EDD98A' }]}
          >
            <Text style={styles.calorieKicker}>TOTAL TODAY</Text>
            <Text style={styles.calorieNum}>{dailyTotals.calories}</Text>
            <Text style={styles.calorieUnit}>kcal</Text>
          </LinearGradient>

          <View style={styles.macroRow}>
            <MacroPill label="Carbs" value={dailyTotals.carbsG} unit="g" color={GOLD} bg={GOLD_BG} />
            <View style={styles.macroGap} />
            <MacroPill label="Protein" value={dailyTotals.proteinG} unit="g" color={colors.teal} bg={colors.tealMuted} />
            <View style={styles.macroGap} />
            <MacroPill label="Fat" value={dailyTotals.fatG} unit="g" color={colors.terracotta} bg="#FCEEEA" />
          </View>

          {dailyTotals.carbsG > 0 && (
            <View style={[styles.carbNote, { backgroundColor: colors.cream, borderColor: colors.border }]}>
              <Ionicons name="information-circle-outline" size={15} color={colors.inkDim} />
              <Text style={[styles.carbNoteText, { color: colors.inkMuted }]}>
                Carb intake affects glucose levels. Review with your care team.
              </Text>
            </View>
          )}

          <SectionLabel>MEALS</SectionLabel>

          {totalItems === 0 ? (
            <Pressable
              accessibilityRole="button"
              style={[styles.emptyCard, { backgroundColor: colors.cream, borderColor: colors.border }]}
              onPress={() => setTab('log')}
            >
              <Text style={[styles.emptyText, { color: colors.inkDim }]}>No food logged today — tap to add</Text>
            </Pressable>
          ) : (
            MEAL_ORDER.map((type) => {
              const meal = meals.find((m) => m.mealType === type);
              if (!meal || meal.items.length === 0) return null;
              const mealCal = meal.items.reduce((s, i) => s + i.calories, 0);
              return (
                <View key={type} style={[styles.mealSection, { borderColor: colors.border }]}>
                  <View style={styles.mealHeader}>
                    <AppIcon name={MEAL_ICONS[type]} size={22} color={colors.teal} />
                    <Text style={[styles.mealLabel, { color: colors.ink }]}>{MEAL_LABELS[type]}</Text>
                    <Text style={[styles.mealCal, { color: colors.inkDim }]}>{mealCal} kcal</Text>
                  </View>
                  {meal.items.map((item, idx) => (
                    <Pressable
                      key={item.id}
                      accessibilityRole="button"
                      accessibilityLabel={`Remove ${item.name}`}
                      style={[
                        styles.foodRow,
                        idx < meal.items.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
                      ]}
                      onLongPress={() => handleDelete(item.id, item.name)}
                    >
                      <View style={styles.foodLeft}>
                        <Text style={[styles.foodName, { color: colors.ink }]}>{item.name}</Text>
                        <Text style={[styles.foodMacros, { color: colors.inkDim }]}>
                          {item.carbsG > 0 ? `${item.carbsG}g carbs · ` : ''}
                          {item.proteinG > 0 ? `${item.proteinG}g protein · ` : ''}
                          {item.fatG > 0 ? `${item.fatG}g fat` : ''}
                        </Text>
                      </View>
                      <Text style={[styles.foodCal, { color: colors.ink }]}>{item.calories} kcal</Text>
                    </Pressable>
                  ))}
                </View>
              );
            })
          )}

          <Pressable
            accessibilityRole="button"
            style={[styles.addMoreBtn, { borderColor: colors.border }]}
            onPress={() => setTab('log')}
          >
            <Ionicons name="add-circle-outline" size={18} color={GOLD} />
            <Text style={[styles.addMoreText, { color: GOLD }]}>Add food</Text>
          </Pressable>
        </ScrollView>
      ) : (
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <ScrollView contentContainerStyle={styles.logScroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            <Text style={[styles.logHeading, { color: colors.ink }]}>Log food</Text>
            <Text style={[styles.logHint, { color: colors.inkMuted }]}>
              Stored on-device only. Long-press any item on Today to remove it.
            </Text>

            <Text style={[styles.fieldLabel, { color: colors.inkDim }]}>MEAL</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.mealPicker}>
              {MEAL_ORDER.map((type) => (
                <Pressable
                  key={type}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: selectedMeal === type }}
                  style={[
                    styles.mealChip,
                    { borderColor: colors.border, backgroundColor: colors.white },
                    selectedMeal === type && { backgroundColor: GOLD, borderColor: GOLD },
                  ]}
                  onPress={() => setSelectedMeal(type)}
                >
                  <AppIcon name={MEAL_ICONS[type]} size={18} color={colors.teal} />
                  <Text style={[styles.mealChipLabel, { color: selectedMeal === type ? '#FFF' : colors.ink }]}>
                    {MEAL_LABELS[type]}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>

            <Text style={[styles.fieldLabel, { color: colors.inkDim }]}>FOOD NAME</Text>
            <TextInput
              accessibilityLabel="Food name"
              placeholder="e.g. Brown rice, grilled chicken"
              placeholderTextColor={colors.inkDim}
              value={foodName}
              onChangeText={setFoodName}
              style={[styles.input, { borderColor: colors.border, color: colors.ink }]}
              returnKeyType="next"
            />

            <Text style={[styles.fieldLabel, { color: colors.inkDim }]}>MACROS (optional)</Text>
            <View style={styles.macroInputRow}>
              <View style={styles.macroInputWrap}>
                <TextInput
                  accessibilityLabel="Calories"
                  placeholder="0"
                  placeholderTextColor={colors.inkDim}
                  value={calories}
                  onChangeText={setCalories}
                  style={[styles.macroInput, { borderColor: colors.border, color: colors.ink }]}
                  keyboardType="number-pad"
                />
                <Text style={[styles.macroInputLabel, { color: colors.inkMuted }]}>kcal</Text>
              </View>
              <View style={styles.macroInputWrap}>
                <TextInput
                  accessibilityLabel="Carbohydrates in grams"
                  placeholder="0"
                  placeholderTextColor={colors.inkDim}
                  value={carbs}
                  onChangeText={setCarbs}
                  style={[styles.macroInput, { borderColor: GOLD + '88', color: colors.ink }]}
                  keyboardType="decimal-pad"
                />
                <Text style={[styles.macroInputLabel, { color: GOLD }]}>carbs g</Text>
              </View>
              <View style={styles.macroInputWrap}>
                <TextInput
                  accessibilityLabel="Protein in grams"
                  placeholder="0"
                  placeholderTextColor={colors.inkDim}
                  value={protein}
                  onChangeText={setProtein}
                  style={[styles.macroInput, { borderColor: colors.teal + '55', color: colors.ink }]}
                  keyboardType="decimal-pad"
                />
                <Text style={[styles.macroInputLabel, { color: colors.teal }]}>protein g</Text>
              </View>
              <View style={styles.macroInputWrap}>
                <TextInput
                  accessibilityLabel="Fat in grams"
                  placeholder="0"
                  placeholderTextColor={colors.inkDim}
                  value={fat}
                  onChangeText={setFat}
                  style={[styles.macroInput, { borderColor: colors.terracotta + '55', color: colors.ink }]}
                  keyboardType="decimal-pad"
                />
                <Text style={[styles.macroInputLabel, { color: colors.terracotta }]}>fat g</Text>
              </View>
            </View>

            <PrimaryButton label="SAVE" onPress={handleSave} style={styles.saveBtn} />
          </ScrollView>
        </KeyboardAvoidingView>
      )}
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

  scroll: { paddingBottom: 40 },

  calorieCard: {
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
  },
  calorieKicker: {
    fontFamily: fonts.bodyBold,
    fontSize: 10,
    letterSpacing: 1.8,
    color: '#B8920E',
    marginBottom: 6,
  },
  calorieNum: { fontFamily: fonts.display, fontSize: 56, lineHeight: 60, color: GOLD },
  calorieUnit: { fontFamily: fonts.bodyMedium, fontSize: 14, color: '#B8920E', marginTop: 2 },

  macroRow: { flexDirection: 'row', marginBottom: 16 },
  macroGap: { width: 10 },

  carbNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    borderRadius: 10,
    borderWidth: 1,
    padding: 12,
    marginBottom: 20,
  },
  carbNoteText: { flex: 1, fontFamily: fonts.body, fontSize: 12, lineHeight: 17 },

  emptyCard: { borderRadius: 12, borderWidth: 1, padding: 24, alignItems: 'center', marginBottom: 16 },
  emptyText: { fontFamily: fonts.body, fontSize: 14 },

  mealSection: {
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: '#E8E2D9',
    overflow: 'hidden',
    marginBottom: 12,
  },
  mealHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FAF8F5',
  },
  mealIcon: { fontSize: 18 },
  mealLabel: { flex: 1, fontFamily: fonts.bodyBold, fontSize: 15 },
  mealCal: { fontFamily: fonts.body, fontSize: 13 },

  foodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 13,
    backgroundColor: '#FFFFFF',
  },
  foodLeft: { flex: 1, gap: 3 },
  foodName: { fontFamily: fonts.bodyMedium, fontSize: 15 },
  foodMacros: { fontFamily: fonts.body, fontSize: 12 },
  foodCal: { fontFamily: fonts.bodyBold, fontSize: 14 },

  addMoreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: 12,
    borderStyle: 'dashed',
    paddingVertical: 16,
    marginTop: 4,
    marginBottom: 8,
  },
  addMoreText: { fontFamily: fonts.bodyBold, fontSize: 14 },

  logScroll: { paddingBottom: 40 },
  logHeading: { fontFamily: fonts.display, fontSize: 28, marginBottom: 8 },
  logHint: { fontFamily: fonts.body, fontSize: 14, lineHeight: 20, marginBottom: 24 },

  fieldLabel: { fontFamily: fonts.bodyBold, fontSize: 11, letterSpacing: 1.2, marginBottom: 10 },
  input: {
    fontFamily: fonts.body,
    fontSize: 17,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 24,
  },

  mealPicker: { marginBottom: 24 },
  mealChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 10,
  },
  mealChipIcon: { fontSize: 16 },
  mealChipLabel: { fontFamily: fonts.bodyBold, fontSize: 14 },

  macroInputRow: { flexDirection: 'row', gap: 10, marginBottom: 28 },
  macroInputWrap: { flex: 1, alignItems: 'center', gap: 6 },
  macroInput: {
    width: '100%',
    fontFamily: fonts.bodyBold,
    fontSize: 20,
    textAlign: 'center',
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 12,
  },
  macroInputLabel: { fontFamily: fonts.body, fontSize: 11 },

  saveBtn: { marginTop: 4 },
});
