import { useCallback, useEffect, useState } from 'react';
import { db, ensureDbReady, safeRead, safeRun } from './schema';
import type { Medication, MedicationStatus } from '../data/content';
import { formatLoggedAt } from './useGlucose';

type DbMedication = {
  id: string;
  name: string;
  schedule: string;
  status: MedicationStatus;
  gradient_from: string;
  gradient_to: string;
  icon: string;
  tag?: string;
  interaction_note?: string;
};

function toMedication(row: DbMedication): Medication {
  return {
    id: row.id,
    name: row.name,
    schedule: row.schedule,
    status: row.status,
    gradient: [row.gradient_from, row.gradient_to],
    icon: row.icon,
    tag: row.tag,
    interactionNote: row.interaction_note,
  };
}

export type DoseLog = {
  id: number;
  medicationName: string;
  loggedAt: string;
  rawDate: string;
};

export function useMedications() {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [doseHistory, setDoseHistory] = useState<DoseLog[]>([]);

  const loadHistory = useCallback(() => {
    const rows = safeRead(
      () =>
        db.getAllSync<{ id: number; name: string; logged_at: string }>(
          `SELECT dl.id, m.name, dl.logged_at
       FROM dose_logs dl
       JOIN medications m ON dl.medication_id = m.id
       ORDER BY dl.logged_at DESC LIMIT 30`,
        ),
      [] as { id: number; name: string; logged_at: string }[],
    );
    setDoseHistory(rows.map((r) => ({
      id: r.id,
      medicationName: r.name,
      loggedAt: formatLoggedAt(r.logged_at),
      rawDate: r.logged_at.slice(0, 10),
    })));
  }, []);

  const load = useCallback(() => {
    const rows = safeRead(
      () => db.getAllSync<DbMedication>('SELECT * FROM medications WHERE active = 1 ORDER BY created_at ASC'),
      [] as DbMedication[],
    );
    setMedications(rows.map(toMedication));
  }, []);

  useEffect(() => {
    load();
    loadHistory();
    // Web: the SQLite worker may not be ready on first mount — re-load once it is.
    ensureDbReady().then(() => {
      load();
      loadHistory();
    });
  }, [load, loadHistory]);

  const logDose = useCallback(
    (medicationId: string) => {
      safeRun(() => {
        db.runSync(`INSERT INTO dose_logs (medication_id) VALUES (?)`, medicationId);
        db.runSync(`UPDATE medications SET status = 'taken' WHERE id = ?`, medicationId);
      });
      load();
      loadHistory();
    },
    [load, loadHistory],
  );

  const addMedication = useCallback(
    (med: Omit<Medication, 'status'>) => {
      safeRun(() =>
        db.runSync(
          `INSERT INTO medications (id, name, schedule, status, gradient_from, gradient_to, icon, tag, interaction_note)
         VALUES (?, ?, ?, 'upcoming', ?, ?, ?, ?, ?)`,
          med.id,
          med.name,
          med.schedule,
          med.gradient[0],
          med.gradient[1],
          med.icon,
          med.tag ?? null,
          med.interactionNote ?? null,
        ),
      );
      load();
    },
    [load],
  );

  const todayDoseCount = medications.filter((m) => m.status === 'taken').length;

  return { medications, logDose, addMedication, reload: load, todayDoseCount, doseHistory };
}
