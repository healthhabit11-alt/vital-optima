import { useCallback, useEffect, useState } from 'react';
import { db } from './schema';
import type { Medication, MedicationStatus } from '../data/content';

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

export function useMedications() {
  const [medications, setMedications] = useState<Medication[]>([]);

  const load = useCallback(() => {
    const rows = db.getAllSync<DbMedication>(
      'SELECT * FROM medications WHERE active = 1 ORDER BY created_at ASC',
    );
    setMedications(rows.map(toMedication));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const logDose = useCallback(
    (medicationId: string) => {
      db.runSync(
        `INSERT INTO dose_logs (medication_id) VALUES (?)`,
        medicationId,
      );
      db.runSync(
        `UPDATE medications SET status = 'taken' WHERE id = ?`,
        medicationId,
      );
      load();
    },
    [load],
  );

  const addMedication = useCallback(
    (med: Omit<Medication, 'status'>) => {
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
      );
      load();
    },
    [load],
  );

  const todayDoseCount = medications.filter((m) => m.status === 'taken').length;

  return { medications, logDose, addMedication, reload: load, todayDoseCount };
}
