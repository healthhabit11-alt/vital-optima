import {
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_700Bold,
} from '@expo-google-fonts/dm-sans';
import {
  Fraunces_600SemiBold,
  Fraunces_700Bold,
  useFonts,
} from '@expo-google-fonts/fraunces';
import { Redirect, Stack, router } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useRef, useState } from 'react';
import { AppState, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as Notifications from 'expo-notifications';

import { ThemeProvider, useTheme } from '@/theme/ThemeContext';
import { initDb } from '@/db/schema';
import { useUserProfile } from '@/db/useUserProfile';
import { LockContext } from '@/lock/LockContext';

SplashScreen.preventAutoHideAsync();

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowList: true,
  }),
});

// Native initialises synchronously here. On web, expo-sqlite's worker isn't
// ready for a synchronous call at startup (it throws "Sync operation timeout"),
// so init is deferred to ensureDbReady() — called from the DB hooks — instead.
if (Platform.OS !== 'web') {
  try {
    initDb();
  } catch (err) {
    if (__DEV__) console.warn('[VitalOptima] DB init failed:', err);
  }
}

function RootStack() {
  const { resolved } = useTheme();
  const { profile } = useUserProfile();
  const [locked, setLocked] = useState(false);
  const appStateRef = useRef(AppState.currentState);
  const didInitLock = useRef(false);

  // Lock on cold start once profile is loaded and has a PIN
  useEffect(() => {
    if (!didInitLock.current && profile.onboarded) {
      didInitLock.current = true;
      if (profile.pinHash) setLocked(true);
    }
  }, [profile.onboarded, profile.pinHash]);

  // Re-lock when app returns from background
  useEffect(() => {
    const sub = AppState.addEventListener('change', (nextState) => {
      if (
        appStateRef.current === 'active' &&
        nextState.match(/background|inactive/) &&
        profile.pinHash
      ) {
        setLocked(true);
      }
      appStateRef.current = nextState;
    });
    return () => sub.remove();
  }, [profile.pinHash]);

  useEffect(() => {
    const sub = Notifications.addNotificationResponseReceivedListener((response) => {
      const medId = response.notification.request.content.data?.medicationId;
      if (typeof medId === 'string') {
        router.push(`/medication/${medId}`);
      }
    });
    return () => sub.remove();
  }, []);

  return (
    <LockContext.Provider value={{ unlock: () => setLocked(false) }}>
      <StatusBar style={resolved === 'dark' ? 'light' : 'dark'} />
      {!profile.onboarded && <Redirect href={'/onboarding' as never} />}
      {profile.onboarded && !!profile.pinHash && locked && <Redirect href={'/lock' as never} />}
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="lock" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="medication/[id]"
          options={{ presentation: 'card', animation: 'slide_from_right' }}
        />
        <Stack.Screen
          name="report"
          options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
        />
      </Stack>
    </LockContext.Provider>
  );
}

export default function RootLayout() {
  const [loaded] = useFonts({
    Fraunces_700Bold,
    Fraunces_600SemiBold,
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_700Bold,
  });

  useEffect(() => {
    if (loaded) SplashScreen.hideAsync();
  }, [loaded]);

  if (!loaded) return null;

  return (
    <ThemeProvider>
      <RootStack />
    </ThemeProvider>
  );
}
