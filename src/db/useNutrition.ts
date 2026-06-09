import { useCallback, useEffect, useState } from 'react';
import { db, ensureDbReady, safeRead, safeRun } from './schema';

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export const MEAL_ORDER: MealType[] = ['breakfast', 'lunch', 'dinner', 'snack'];

export const MEAL_LABELS: Record<MealType, string> = {
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  dinner: 'Dinner',
  snack: 'Snack',
};

// AppIcon semantic keys (see src/components/AppIcon.tsx)
export const MEAL_ICONS: Record<MealType, string> = {
  breakfast: 'breakfast',
  lunch: 'lunch',
  dinner: 'dinner',
  snack: 'snack',
};

export type FoodItem = {
  id: number;
  mealId: number;
  name: string;
  calories: number;
  carbsG: number;
  proteinG: number;
  fatG: number;
};

export type Meal = {
  id: number;
  mealType: MealType;
  loggedAt: string;
  items: FoodItem[];
};

export type MacroTotals = {
  calories: number;
  carbsG: number;
  proteinG: number;
  fatG: number;
};

type DbMeal = { id: number; meal_type: string; logged_at: string };
type DbFoodItem = {
  id: number;
  meal_id: number;
  name: string;
  calories: number;
  carbs_g: number;
  protein_g: number;
  fat_g: number;
};

// Returns YYYY-MM-DD in the device's local timezone, matching SQLite 'localtime' modifier.
function localDateString(): string {
  return new Date().toLocaleDateString('en-CA');
}

export function useNutrition() {
  const [meals, setMeals] = useState<Meal[]>([]);

  const load = useCallback(() => {
    const today = localDateString();
    const mealRows = safeRead(
      () =>
        db.getAllSync<DbMeal>(
          `SELECT * FROM meals WHERE date(logged_at, 'localtime') = ? ORDER BY logged_at ASC`,
          today,
        ),
      [] as DbMeal[],
    );
    const itemRows = safeRead(
      () =>
        db.getAllSync<DbFoodItem>(
          `SELECT fi.* FROM food_items fi
       JOIN meals m ON m.id = fi.meal_id
       WHERE date(m.logged_at, 'localtime') = ?`,
          today,
        ),
      [] as DbFoodItem[],
    );

    const itemsByMeal = new Map<number, FoodItem[]>();
    for (const row of itemRows) {
      const item: FoodItem = {
        id: row.id,
        mealId: row.meal_id,
        name: row.name,
        calories: row.calories,
        carbsG: row.carbs_g,
        proteinG: row.protein_g,
        fatG: row.fat_g,
      };
      if (!itemsByMeal.has(row.meal_id)) itemsByMeal.set(row.meal_id, []);
      itemsByMeal.get(row.meal_id)!.push(item);
    }

    const result: Meal[] = mealRows.map((m) => ({
      id: m.id,
      mealType: m.meal_type as MealType,
      loggedAt: m.logged_at,
      items: itemsByMeal.get(m.id) ?? [],
    }));

    result.sort((a, b) => MEAL_ORDER.indexOf(a.mealType) - MEAL_ORDER.indexOf(b.mealType));

    setMeals(result);
  }, []);

  useEffect(() => {
    load();
    // Web: the SQLite worker may not be ready on first mount — re-load once it is.
    ensureDbReady().then(load);
  }, [load]);

  const addFoodItem = useCallback(
    (
      mealType: MealType,
      item: { name: string; calories: number; carbsG: number; proteinG: number; fatG: number },
    ) => {
      safeRun(() => {
        const today = localDateString();
        let meal = db.getFirstSync<DbMeal>(
          `SELECT * FROM meals WHERE meal_type = ? AND date(logged_at, 'localtime') = ?`,
          mealType,
          today,
        );
        if (!meal) {
          db.runSync(`INSERT INTO meals (meal_type) VALUES (?)`, mealType);
          meal = db.getFirstSync<DbMeal>(
            `SELECT * FROM meals WHERE meal_type = ? AND date(logged_at, 'localtime') = ? ORDER BY id DESC LIMIT 1`,
            mealType,
            today,
          )!;
        }
        db.runSync(
          `INSERT INTO food_items (meal_id, name, calories, carbs_g, protein_g, fat_g) VALUES (?, ?, ?, ?, ?, ?)`,
          meal.id,
          item.name.trim(),
          item.calories,
          item.carbsG,
          item.proteinG,
          item.fatG,
        );
      });
      load();
    },
    [load],
  );

  const deleteFoodItem = useCallback(
    (id: number) => {
      safeRun(() => db.runSync(`DELETE FROM food_items WHERE id = ?`, id));
      load();
    },
    [load],
  );

  // Accumulate raw floats then round once — avoids compounding rounding error across items.
  const raw = meals.reduce(
    (acc, meal) => {
      for (const item of meal.items) {
        acc.calories += item.calories;
        acc.carbsG += item.carbsG;
        acc.proteinG += item.proteinG;
        acc.fatG += item.fatG;
      }
      return acc;
    },
    { calories: 0, carbsG: 0, proteinG: 0, fatG: 0 },
  );

  const dailyTotals: MacroTotals = {
    calories: raw.calories,
    carbsG: Math.round(raw.carbsG * 10) / 10,
    proteinG: Math.round(raw.proteinG * 10) / 10,
    fatG: Math.round(raw.fatG * 10) / 10,
  };

  return { meals, dailyTotals, addFoodItem, deleteFoodItem };
}
