import { useCallback, useEffect, useState } from 'react';
import * as Crypto from 'expo-crypto';
import { db, ensureDbReady, safeRead, safeRun } from './schema';

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
    const row = safeRead(
      () => db.getFirstSync<DbProfile>('SELECT * FROM user_profile WHERE id = 1'),
      null,
    );
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
    // Web: the SQLite worker may not be ready on first mount — re-load once it is.
    ensureDbReady().then(load);
  }, [load]);

  const updateProfile = useCallback(
    (patch: Partial<Omit<UserProfile, 'onboarded' | 'pinHash'>>) => {
      safeRun(() => {
        if (patch.displayName !== undefined) {
          db.runSync(`UPDATE user_profile SET display_name = ? WHERE id = 1`, patch.displayName);
        }
        if (patch.region !== undefined) {
          db.runSync(`UPDATE user_profile SET region = ? WHERE id = 1`, patch.region);
        }
        if (patch.unit !== undefined) {
          db.runSync(`UPDATE user_profile SET unit = ? WHERE id = 1`, patch.unit);
        }
      });
      load();
    },
    [load],
  );

  const completeOnboarding = useCallback(
    (name: string, region: string) => {
      safeRun(() =>
        db.runSync(
          `UPDATE user_profile SET display_name = ?, region = ?, onboarded = 1 WHERE id = 1`,
          name,
          region,
        ),
      );
      load();
    },
    [load],
  );

  const setPinHash = useCallback(
    async (raw: string) => {
      const hash = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, raw);
      safeRun(() => db.runSync(`UPDATE user_profile SET pin_hash = ? WHERE id = 1`, hash));
      load();
    },
    [load],
  );

  const verifyPin = useCallback(
    async (raw: string): Promise<boolean> => {
      if (!profile.pinHash) return false;
      const hash = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, raw);
      return hash === profile.pinHash;
    },
    [profile.pinHash],
  );

  const deleteAllData = useCallback(() => {
    safeRun(() => {
      db.execSync(`DELETE FROM food_items`);
      db.execSync(`DELETE FROM meals`);
      db.execSync(`DELETE FROM dose_logs`);
      db.execSync(`DELETE FROM glucose_readings`);
      db.execSync(`DELETE FROM medications`);
      db.runSync(
        `UPDATE user_profile SET display_name = ?, region = ?, unit = ?, pin_hash = NULL, onboarded = 0 WHERE id = 1`,
        'You', 'AU', 'mmol/L',
      );
    });
    load();
  }, [load]);

  return { profile, updateProfile, completeOnboarding, setPinHash, verifyPin, deleteAllData };
}
