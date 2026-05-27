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
import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import * as Notifications from 'expo-notifications';

import { ThemeProvider, useTheme } from '@/theme/ThemeContext';
import { initDb } from '@/db/schema';
import { useUserProfile } from '@/db/useUserProfile';

SplashScreen.preventAutoHideAsync();
initDb();

function RootStack() {
  const { resolved } = useTheme();
  const { profile } = useUserProfile();

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
    <>
      <StatusBar style={resolved === 'dark' ? 'light' : 'dark'} />
      {!profile.onboarded && <Redirect href={'/onboarding' as never} />}
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="onboarding" />
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
    </>
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
