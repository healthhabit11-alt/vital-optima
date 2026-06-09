import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { Platform, StyleSheet } from 'react-native';

import { useTheme } from '@/theme/ThemeContext';
import { fonts } from '@/theme/typography';

export default function TabLayout() {
  const { colors } = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.teal,
        tabBarInactiveTintColor: colors.inkDim,
        tabBarLabelStyle: styles.label,
        tabBarStyle: {
          backgroundColor: colors.white,
          borderTopColor: colors.border,
          borderTopWidth: StyleSheet.hairlineWidth,
          height: Platform.OS === 'ios' ? 88 : 64,
          paddingTop: 8,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? 'home' : 'home-outline'} size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="meds"
        options={{
          title: 'Meds',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? 'medkit' : 'medkit-outline'} size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="glucose"
        options={{
          title: 'Glucose',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? 'pulse' : 'pulse-outline'} size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="nutrition"
        options={{
          title: 'Nutrition',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? 'restaurant' : 'restaurant-outline'} size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="companion"
        options={{
          title: 'Vita',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? 'sparkles' : 'sparkles-outline'} size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? 'settings' : 'settings-outline'} size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  label: { fontFamily: fonts.bodyMedium, fontSize: 11 },
});
