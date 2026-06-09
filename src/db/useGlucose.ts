import { useCallback, useEffect, useState } from 'react';
import { db, ensureDbReady, safeRead, safeRun } from './schema';
import type { GlucoseReading } from '../data/content';

type DbReading = {
  id: number;
  value: number;
  unit: string;
  logged_at: string;
  note?: string;
};

export function formatLoggedAt(raw: string): string {
  const d = new Date(raw.replace(' ', 'T'));
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  const timeStr = d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  if (isToday) return `Today, ${timeStr}`;
  const dayStr = d.toLocaleDateString([], { weekday: 'short', day: 'numeric', month: 'short' });
  return `${dayStr}, ${timeStr}`;
}

function toReading(row: DbReading): GlucoseReading & { id: number; rawDate: string } {
  return {
    id: row.id,
    value: row.value,
    unit: 'mmol/L',
    loggedAt: formatLoggedAt(row.logged_at),
    rawDate: row.logged_at.slice(0, 10),
    inRange: row.value >= 4.0 && row.value <= 7.0,
  };
}

export const HYPO_THRESHOLD = 3.9;

// Returns avg value per day for the last 7 calendar days (0 = no readings that day).
function computeWeekTrend(rows: DbReading[]): { trend: number[]; labels: string[] } {
  const today = new Date();
  const trend: number[] = [];
  const labels: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dayStr = d.toISOString().slice(0, 10);
    labels.push(['S', 'M', 'T', 'W', 'T', 'F', 'S'][d.getDay()]);
    const dayRows = rows.filter((r) => r.logged_at.slice(0, 10) === dayStr);
    trend.push(
      dayRows.length === 0
        ? 0
        : dayRows.reduce((s, r) => s + r.value, 0) / dayRows.length,
    );
  }
  return { trend, labels };
}

export function useGlucose() {
  const [readings, setReadings] = useState<(GlucoseReading & { id: number; rawDate: string })[]>([]);
  const [weekTrend, setWeekTrend] = useState<number[]>([0, 0, 0, 0, 0, 0, 0]);
  const [weekDayLabels, setWeekDayLabels] = useState<string[]>(['M', 'T', 'W', 'T', 'F', 'S', 'S']);
  const [hypoAlert, setHypoAlert] = useState<number | null>(null);

  const load = useCallback(() => {
    const rows = safeRead(
      () =>
        db.getAllSync<DbReading>('SELECT * FROM glucose_readings ORDER BY logged_at DESC LIMIT 50'),
      [] as DbReading[],
    );
    setReadings(rows.map(toReading));
    const { trend, labels } = computeWeekTrend(rows);
    setWeekTrend(trend);
    setWeekDayLabels(labels);
  }, []);

  useEffect(() => {
    load();
    // Web: the SQLite worker may not be ready on first mount — re-load once it is.
    ensureDbReady().then(load);
  }, [load]);

  const logReading = useCallback(
    (value: number) => {
      safeRun(() => db.runSync(`INSERT INTO glucose_readings (value) VALUES (?)`, value));
      if (value < HYPO_THRESHOLD) setHypoAlert(value);
      load();
    },
    [load],
  );

  const dismissHypo = useCallback(() => setHypoAlert(null), []);
  const triggerHypoAlert = useCallback((value: number) => setHypoAlert(value), []);

  const latest = readings[0] ?? null;

  return { readings, latest, weekTrend, weekDayLabels, logReading, hypoAlert, dismissHypo, triggerHypoAlert };
}
