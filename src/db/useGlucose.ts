import { useCallback, useEffect, useState } from 'react';
import { db } from './schema';
import type { GlucoseReading } from '../data/content';

type DbReading = {
  id: number;
  value: number;
  unit: string;
  logged_at: string;
  note?: string;
};

function toReading(row: DbReading): GlucoseReading & { id: number } {
  return {
    id: row.id,
    value: row.value,
    unit: 'mmol/L',
    loggedAt: row.logged_at,
    inRange: row.value >= 4.0 && row.value <= 7.0,
  };
}

export const HYPO_THRESHOLD = 3.9;

export function useGlucose() {
  const [readings, setReadings] = useState<(GlucoseReading & { id: number })[]>([]);
  const [hypoAlert, setHypoAlert] = useState<number | null>(null);

  const load = useCallback(() => {
    const rows = db.getAllSync<DbReading>(
      'SELECT * FROM glucose_readings ORDER BY logged_at DESC LIMIT 50',
    );
    setReadings(rows.map(toReading));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const logReading = useCallback(
    (value: number) => {
      db.runSync(
        `INSERT INTO glucose_readings (value) VALUES (?)`,
        value,
      );
      if (value < HYPO_THRESHOLD) {
        setHypoAlert(value);
      }
      load();
    },
    [load],
  );

  const dismissHypo = useCallback(() => setHypoAlert(null), []);

  const latest = readings[0] ?? null;

  const weekTrend = (() => {
    if (readings.length === 0) return [5.8, 5.4, 5.2, 4.9, 5.1, 5.2, 5.0];
    const last7 = readings.slice(0, 7).map((r) => r.value);
    while (last7.length < 7) last7.push(last7[last7.length - 1] ?? 5.0);
    return last7.reverse();
  })();

  return { readings, latest, weekTrend, logReading, hypoAlert, dismissHypo };
}
