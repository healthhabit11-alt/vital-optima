import { useCallback, useEffect, useState } from 'react';
import { db } from './schema';

export type UserProfile = {
  displayName: string;
  region: string;
  unit: 'mmol/L' | 'mg/dL';
  onboarded: boolean;
  pinHash: string | null;
};

type DbProfile = {
  display_name: string;
  region: string;
  unit: string;
  onboarded: number;
  pin_hash: string | null;
};

export function useUserProfile() {
  const [profile, setProfile] = useState<UserProfile>({
    displayName: 'You',
    region: 'AU',
    unit: 'mmol/L',
    onboarded: false,
    pinHash: null,
  });

  const load = useCallback(() => {
    const row = db.getFirstSync<DbProfile>('SELECT * FROM user_profile WHERE id = 1');
    if (row) {
      setProfile({
        displayName: row.display_name,
        region: row.region,
        unit: row.unit as 'mmol/L' | 'mg/dL',
        onboarded: row.onboarded === 1,
        pinHash: row.pin_hash,
      });
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const updateProfile = useCallback(
    (patch: Partial<Omit<UserProfile, 'onboarded' | 'pinHash'>>) => {
      if (patch.displayName !== undefined) {
        db.runSync(`UPDATE user_profile SET display_name = ? WHERE id = 1`, patch.displayName);
      }
      if (patch.region !== undefined) {
        db.runSync(`UPDATE user_profile SET region = ? WHERE id = 1`, patch.region);
      }
      if (patch.unit !== undefined) {
        db.runSync(`UPDATE user_profile SET unit = ? WHERE id = 1`, patch.unit);
      }
      load();
    },
    [load],
  );

  const completeOnboarding = useCallback(
    (name: string, region: string) => {
      db.runSync(
        `UPDATE user_profile SET display_name = ?, region = ?, onboarded = 1 WHERE id = 1`,
        name,
        region,
      );
      load();
    },
    [load],
  );

  const setPinHash = useCallback(
    (hash: string) => {
      db.runSync(`UPDATE user_profile SET pin_hash = ? WHERE id = 1`, hash);
      load();
    },
    [load],
  );

  return { profile, updateProfile, completeOnboarding, setPinHash };
}
