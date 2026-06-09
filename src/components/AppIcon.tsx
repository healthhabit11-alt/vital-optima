import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';

type MciName = ComponentProps<typeof MaterialCommunityIcons>['name'];

/**
 * Semantic icon keys → vector glyphs. Replaces the old emoji strings so every
 * icon renders as a crisp, tintable vector in the app's pine/lime/silver
 * colourway. Data layers store these keys (e.g. medication.icon = 'med').
 */
const GLYPHS = {
  med: 'medical-bag', // medications — medical bag with a cross
  food: 'silverware-fork-knife', // food / interactions
  meal: 'food-apple', // healthy meal
  history: 'chart-line', // adherence history
  reminders: 'bell', // reminders
  log: 'pencil', // log a reading
  trend: 'trending-up', // 7-day trend
  warning: 'alert', // low-reading / hypo
  export: 'tray-arrow-up', // export data
  check: 'check-circle', // confirmed / no conflicts
  glucose: 'water', // glucose droplet
  candy: 'candy', // fast-acting carbs
  timer: 'timer-sand', // wait 15 minutes
  repeat: 'repeat', // repeat step

  // meal times
  breakfast: 'weather-sunset-up',
  lunch: 'white-balance-sunny',
  dinner: 'weather-night',
  snack: 'food-apple',

  // Legacy aliases — keeps any rows still holding the old emoji rendering
  // correctly after the migration to semantic keys.
  '💊': 'medical-bag',
  '🍽️': 'silverware-fork-knife',
  '🥗': 'food-apple',
  '📊': 'chart-line',
  '🔔': 'bell',
  '✏️': 'pencil',
  '📈': 'trending-up',
  '⚠️': 'alert',
  '📤': 'tray-arrow-up',
  '✓': 'check-circle',
} satisfies Record<string, MciName>;

export type AppIconName = keyof typeof GLYPHS;

type AppIconProps = {
  /** A semantic key from GLYPHS. Unknown keys fall back to a neutral glyph. */
  name: string;
  size?: number;
  color: string;
};

export function AppIcon({ name, size = 24, color }: AppIconProps) {
  const glyph = (GLYPHS as Record<string, MciName>)[name] ?? 'help-circle';
  return <MaterialCommunityIcons name={glyph} size={size} color={color} />;
}
