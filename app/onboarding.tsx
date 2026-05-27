import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useRef, useState } from 'react';
import {
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PrimaryButton } from '@/components/PrimaryButton';
import { useUserProfile } from '@/db/useUserProfile';
import { useMedications } from '@/db/useMedications';
import { scheduleDefaultReminders } from '@/notifications/scheduleNotifications';
import { colors } from '@/theme/colors';
import { fonts } from '@/theme/typography';

const { width } = Dimensions.get('window');

const REGIONS = ['AU', 'NZ', 'UK', 'US', 'CA', 'ZA', 'Other'];

type Step = 'welcome' | 'profile' | 'pin';

export default function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  const { completeOnboarding, setPinHash } = useUserProfile();
  const { medications } = useMedications();

  const [step, setStep] = useState<Step>('welcome');
  const [name, setName] = useState('');
  const [region, setRegion] = useState('AU');
  const [pin, setPin] = useState('');
  const [pinConfirm, setPinConfirm] = useState('');
  const [pinError, setPinError] = useState('');

  const pinRef = useRef<TextInput>(null);
  const confirmRef = useRef<TextInput>(null);

  const handleProfile = () => {
    if (!name.trim()) return;
    setStep('pin');
  };

  const finish = (withPin?: string) => {
    completeOnboarding(name.trim(), region);
    if (withPin) setPinHash(withPin);
    const names = Object.fromEntries(medications.map((m) => [m.id, m.name]));
    scheduleDefaultReminders(medications.map((m) => m.id), names);
    router.replace('/(tabs)');
  };

  const handlePin = () => {
    if (pin.length < 4) { setPinError('PIN must be at least 4 digits'); return; }
    if (pin !== pinConfirm) { setPinError('PINs do not match'); return; }
    finish(pin);
  };

  const skipPin = () => finish();

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {step === 'welcome' && (
        <LinearGradient colors={[colors.teal, '#1A6B64', '#3D9B8F']} style={styles.full}>
          <View style={styles.orb} />
          <View style={styles.orbSmall} />
          <View style={styles.welcomeContent}>
            <Text style={styles.wordmark}>VitalOptima</Text>
            <Text style={styles.welcomeTitle}>Your health,{'\n'}on your terms.</Text>
            <Text style={styles.welcomeBody}>
              Track medications, glucose, and adherence — all stored locally on your device. No account required.
            </Text>
          </View>
          <View style={[styles.welcomeFooter, { paddingBottom: insets.bottom + 32 }]}>
            <PrimaryButton
              label="GET STARTED"
              variant="terracotta"
              onPress={() => setStep('profile')}
              style={styles.getStarted}
            />
            <Text style={styles.welcomeNote}>No data leaves your phone without your action.</Text>
          </View>
        </LinearGradient>
      )}

      {step === 'profile' && (
        <KeyboardAvoidingView
          style={styles.full}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ScrollView
            contentContainerStyle={[styles.formScroll, { paddingBottom: insets.bottom + 32 }]}
            keyboardShouldPersistTaps="handled"
          >
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Back"
              style={styles.backBtn}
              onPress={() => setStep('welcome')}
            >
              <Ionicons name="chevron-back" size={22} color={colors.teal} />
            </Pressable>

            <Text style={styles.stepLabel}>STEP 1 OF 2</Text>
            <Text style={styles.stepTitle}>About you</Text>
            <Text style={styles.stepHint}>Used only to personalise the app on this device.</Text>

            <Text style={styles.fieldLabel}>YOUR NAME</Text>
            <TextInput
              accessibilityLabel="Your display name"
              placeholder="e.g. Alex"
              placeholderTextColor={colors.inkDim}
              value={name}
              onChangeText={setName}
              style={styles.input}
              autoFocus
              returnKeyType="done"
              onSubmitEditing={handleProfile}
            />

            <Text style={styles.fieldLabel}>REGION</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.regionRow}>
              {REGIONS.map((r) => (
                <Pressable
                  key={r}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: region === r }}
                  style={[styles.regionChip, region === r && styles.regionChipActive]}
                  onPress={() => setRegion(r)}
                >
                  <Text style={[styles.regionChipText, region === r && styles.regionChipTextActive]}>
                    {r}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>

            <Text style={styles.fieldNote}>
              Region sets your glucose unit (mmol/L for AU/NZ/UK, adjustable in Settings).
            </Text>

            <PrimaryButton
              label="CONTINUE"
              onPress={handleProfile}
              style={styles.continueBtn}
            />
          </ScrollView>
        </KeyboardAvoidingView>
      )}

      {step === 'pin' && (
        <KeyboardAvoidingView
          style={styles.full}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ScrollView
            contentContainerStyle={[styles.formScroll, { paddingBottom: insets.bottom + 32 }]}
            keyboardShouldPersistTaps="handled"
          >
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Back"
              style={styles.backBtn}
              onPress={() => setStep('profile')}
            >
              <Ionicons name="chevron-back" size={22} color={colors.teal} />
            </Pressable>

            <Text style={styles.stepLabel}>STEP 2 OF 2</Text>
            <Text style={styles.stepTitle}>Secure your data</Text>
            <Text style={styles.stepHint}>
              Set a 4-digit PIN to protect your health information. You can skip this and add it later in Settings.
            </Text>

            <Text style={styles.fieldLabel}>CREATE PIN</Text>
            <TextInput
              ref={pinRef}
              accessibilityLabel="Create a PIN"
              placeholder="4+ digits"
              placeholderTextColor={colors.inkDim}
              value={pin}
              onChangeText={(v) => { setPin(v); setPinError(''); }}
              style={styles.input}
              keyboardType="number-pad"
              secureTextEntry
              maxLength={8}
              returnKeyType="next"
              onSubmitEditing={() => confirmRef.current?.focus()}
            />

            <Text style={styles.fieldLabel}>CONFIRM PIN</Text>
            <TextInput
              ref={confirmRef}
              accessibilityLabel="Confirm your PIN"
              placeholder="Repeat PIN"
              placeholderTextColor={colors.inkDim}
              value={pinConfirm}
              onChangeText={(v) => { setPinConfirm(v); setPinError(''); }}
              style={styles.input}
              keyboardType="number-pad"
              secureTextEntry
              maxLength={8}
              returnKeyType="done"
              onSubmitEditing={handlePin}
            />

            {pinError ? <Text style={styles.error}>{pinError}</Text> : null}

            <PrimaryButton label="SET PIN & FINISH" onPress={handlePin} style={styles.continueBtn} />

            <Pressable
              accessibilityRole="button"
              style={styles.skipBtn}
              onPress={skipPin}
            >
              <Text style={styles.skipText}>Skip for now</Text>
            </Pressable>
          </ScrollView>
        </KeyboardAvoidingView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.teal },
  full: { flex: 1 },
  orb: {
    position: 'absolute',
    top: -80,
    right: -60,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: 'rgba(255,255,255,0.07)',
  },
  orbSmall: {
    position: 'absolute',
    bottom: 120,
    left: -40,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  welcomeContent: { flex: 1, paddingHorizontal: 32, paddingTop: 60, justifyContent: 'center' },
  wordmark: { fontFamily: fonts.bodyBold, fontSize: 13, letterSpacing: 2, color: 'rgba(255,255,255,0.6)', marginBottom: 24 },
  welcomeTitle: { fontFamily: fonts.display, fontSize: 44, lineHeight: 50, color: colors.white, marginBottom: 20 },
  welcomeBody: { fontFamily: fonts.body, fontSize: 16, lineHeight: 24, color: 'rgba(255,255,255,0.85)' },
  welcomeFooter: { paddingHorizontal: 32, paddingTop: 24 },
  getStarted: { marginBottom: 16 },
  welcomeNote: { fontFamily: fonts.body, fontSize: 12, color: 'rgba(255,255,255,0.55)', textAlign: 'center' },

  formScroll: { paddingHorizontal: 28, paddingTop: 20, backgroundColor: colors.cream, flexGrow: 1 },
  backBtn: { width: 44, height: 44, justifyContent: 'center', marginBottom: 8 },
  stepLabel: { fontFamily: fonts.bodyBold, fontSize: 11, letterSpacing: 1.5, color: colors.inkDim, marginBottom: 8 },
  stepTitle: { fontFamily: fonts.display, fontSize: 32, color: colors.ink, marginBottom: 10 },
  stepHint: { fontFamily: fonts.body, fontSize: 14, lineHeight: 20, color: colors.inkMuted, marginBottom: 32 },

  fieldLabel: { fontFamily: fonts.bodyBold, fontSize: 11, letterSpacing: 1.2, color: colors.inkDim, marginBottom: 8 },
  input: {
    fontFamily: fonts.body,
    fontSize: 17,
    color: colors.ink,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: colors.white,
    marginBottom: 24,
  },
  regionRow: { marginBottom: 8 },
  regionChip: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    marginRight: 8,
  },
  regionChipActive: { backgroundColor: colors.teal, borderColor: colors.teal },
  regionChipText: { fontFamily: fonts.bodyBold, fontSize: 14, color: colors.ink },
  regionChipTextActive: { color: colors.white },
  fieldNote: { fontFamily: fonts.body, fontSize: 12, color: colors.inkDim, marginBottom: 32, lineHeight: 18 },

  error: { fontFamily: fonts.body, fontSize: 13, color: colors.terracotta, marginBottom: 12, marginTop: -16 },
  continueBtn: { marginTop: 8, marginBottom: 16 },
  skipBtn: { alignItems: 'center', paddingVertical: 12, minHeight: 44, justifyContent: 'center' },
  skipText: { fontFamily: fonts.bodyBold, fontSize: 14, color: colors.inkDim },
});
