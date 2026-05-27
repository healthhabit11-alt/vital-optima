import * as SQLite from 'expo-sqlite';

export const db = SQLite.openDatabaseSync('vital_optima.db');

export function initDb() {
  db.execSync(`
    PRAGMA journal_mode = WAL;

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
      icon TEXT NOT NULL DEFAULT '💊',
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
      ('bictegravir', 'Bictegravir combo', 'Morning · with food', 'taken', '#1A6B64', '#3D9B8F', '💊'),
      ('metformin', 'Metformin', 'With lunch', 'taken', '#0D4F4A', '#2E7D5A', '💊'),
      ('evening-arv', 'Evening regimen', '9:00 PM', 'upcoming', '#C45C4A', '#E89A6F', '💊');
  `);
}
