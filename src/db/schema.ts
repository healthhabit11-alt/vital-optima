import * as SQLite from 'expo-sqlite';
import { Platform } from 'react-native';

let _db: SQLite.SQLiteDatabase | null = null;

function lazyDb(): SQLite.SQLiteDatabase {
  if (!_db) {
    _db = SQLite.openDatabaseSync('vital_optima.db');
  }
  return _db;
}

// Proxy defers openDatabaseSync until the first actual DB call,
// giving the COI service worker time to enable SharedArrayBuffer on web.
export const db: SQLite.SQLiteDatabase = new Proxy({} as SQLite.SQLiteDatabase, {
  get(_t, prop) {
    const instance = lazyDb();
    const val = (instance as any)[prop];
    return typeof val === 'function' ? val.bind(instance) : val;
  },
  set(_t, prop, value) {
    (lazyDb() as any)[prop] = value;
    return true;
  },
});

export function initDb() {
  db.execSync(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS user_profile (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      display_name TEXT NOT NULL DEFAULT 'You',
      region TEXT NOT NULL DEFAULT 'AU',
      unit TEXT NOT NULL DEFAULT 'mmol/L',
      pin_hash TEXT,
      onboarded INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS medications (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      schedule TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'upcoming',
      gradient_from TEXT NOT NULL DEFAULT '#1A6B64',
      gradient_to TEXT NOT NULL DEFAULT '#3D9B8F',
      icon TEXT NOT NULL DEFAULT 'med',
      tag TEXT,
      interaction_note TEXT,
      active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS dose_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      medication_id TEXT NOT NULL REFERENCES medications(id),
      logged_at TEXT NOT NULL DEFAULT (datetime('now')),
      note TEXT
    );

    CREATE TABLE IF NOT EXISTS glucose_readings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      value REAL NOT NULL,
      unit TEXT NOT NULL DEFAULT 'mmol/L',
      logged_at TEXT NOT NULL DEFAULT (datetime('now')),
      note TEXT
    );

    CREATE TABLE IF NOT EXISTS meals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      meal_type TEXT NOT NULL DEFAULT 'snack',
      logged_at TEXT NOT NULL DEFAULT (datetime('now')),
      note TEXT
    );

    CREATE TABLE IF NOT EXISTS food_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      meal_id INTEGER NOT NULL REFERENCES meals(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      calories INTEGER NOT NULL DEFAULT 0,
      carbs_g REAL NOT NULL DEFAULT 0,
      protein_g REAL NOT NULL DEFAULT 0,
      fat_g REAL NOT NULL DEFAULT 0
    );
  `);

  const profile = db.getFirstSync<{ id: number }>('SELECT id FROM user_profile WHERE id = 1');
  if (!profile) {
    db.runSync(`INSERT INTO user_profile (id) VALUES (1)`);
  }

  seedDefaultMedications();
  resetDailyStatuses();
}

function resetDailyStatuses() {
  // Reset any medication marked 'taken' where the last dose log is not from today
  db.execSync(`
    UPDATE medications
    SET status = 'upcoming'
    WHERE status = 'taken'
      AND id NOT IN (
        SELECT DISTINCT medication_id FROM dose_logs
        WHERE date(logged_at) = date('now', 'localtime')
      );
  `);
}

function seedDefaultMedications() {
  const count = db.getFirstSync<{ n: number }>('SELECT COUNT(*) as n FROM medications');
  if (count && count.n > 0) return;

  db.execSync(`
    INSERT INTO medications (id, name, schedule, status, gradient_from, gradient_to, icon) VALUES
      ('bictegravir', 'Bictegravir combo', 'Morning · with food', 'taken', '#1B4332', '#2D6A4F', 'med'),
      ('metformin', 'Metformin', 'With lunch', 'taken', '#225C44', '#3E8E63', 'med'),
      ('evening-arv', 'Evening regimen', '9:00 PM', 'upcoming', '#3E8E63', '#74C043', 'med');
  `);
}

let _readyPromise: Promise<void> | null = null;

/**
 * On the web, expo-sqlite runs in a Web Worker that is NOT ready for the first
 * *synchronous* call right after openDatabaseSync — synchronous reads fired on
 * mount can throw ("invokeWorkerSync") before the worker + WASM have loaded.
 * Awaiting an async open warms that worker up; we then (re)run initDb so the
 * schema exists. On native, SQLite is synchronous so this just runs initDb.
 * Call ensureDbReady().then(load) from a hook's mount effect to re-read once
 * the worker is live.
 */
export function ensureDbReady(): Promise<void> {
  if (!_readyPromise) {
    _readyPromise = (async () => {
      try {
        if (Platform.OS === 'web') {
          await SQLite.openDatabaseAsync('vital_optima.db');
        }
      } catch (err) {
        if (__DEV__) console.warn('[VitalOptima] DB warmup failed:', err);
      }
      try {
        initDb();
      } catch (err) {
        if (__DEV__) console.warn('[VitalOptima] initDb after warmup failed:', err);
      }
    })();
  }
  return _readyPromise;
}

/** Run a DB read, returning `fallback` if the (web) worker isn't ready or fails. */
export function safeRead<T>(read: () => T, fallback: T): T {
  try {
    return read();
  } catch (err) {
    if (__DEV__) console.warn('[VitalOptima] DB read failed:', err);
    return fallback;
  }
}

/** Run a DB write, swallowing failures (e.g. web worker not ready) instead of crashing. */
export function safeRun(run: () => void): void {
  try {
    run();
  } catch (err) {
    if (__DEV__) console.warn('[VitalOptima] DB write failed:', err);
  }
}
