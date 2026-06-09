import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PrimaryButton } from '@/components/PrimaryButton';
import { useUserProfile } from '@/db/useUserProfile';
import { useLockUnlock } from '@/lock/LockContext';
import { colors } from '@/theme/colors';
import { fonts } from '@/theme/typography';

export default function LockScreen() {
  const insets = useSafeAreaInsets();
  const { verifyPin } = useUserProfile();
  const unlock = useLockUnlock();

  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleUnlock = async () => {
    if (pin.length < 4) { setError('Enter your PIN'); return; }
    setLoading(true);
    const ok = await verifyPin(pin);
    setLoading(false);
    if (ok) {
      unlock();
    } else {
      setError('Incorrect PIN');
      setPin('');
    }
  };

  return (
    <LinearGradient colors={[colors.teal, '#1A6B64', '#3D9B8F']} style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.orb} />
      <View style={styles.orbSmall} />
      <KeyboardAvoidingView style={styles.inner} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={styles.content}>
          <Text style={styles.wordmark}>VitalOptima</Text>
          <Text style={styles.title}>Enter your PIN</Text>
          <Text style={styles.subtitle}>Your data is stored locally and protected.</Text>

          <TextInput
            accessibilityLabel="PIN entry"
            placeholder="PIN"
            placeholderTextColor="rgba(255,255,255,0.45)"
            value={pin}
            onChangeText={(v) => { setPin(v); setError(''); }}
            style={styles.input}
            keyboardType="number-pad"
            secureTextEntry
            maxLength={8}
            autoFocus
            returnKeyType="done"
            onSubmitEditing={handleUnlock}
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <PrimaryButton
            label={loading ? 'CHECKING…' : 'UNLOCK'}
            variant="terracotta"
            onPress={handleUnlock}
            style={styles.btn}
          />
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Forgot PIN"
          style={[styles.forgot, { paddingBottom: insets.bottom + 24 }]}
          onPress={() =>
            Alert.alert(
              'Forgot PIN',
              'To reset your PIN, go to your device Settings → Apps → Vital Optima → Clear Data. This will delete all locally stored health information.',
              [{ text: 'OK' }],
            )
          }
        >
          <Text style={styles.forgotText}>Forgot PIN?</Text>
        </Pressable>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
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
  inner: { flex: 1 },
  content: { flex: 1, paddingHorizontal: 32, justifyContent: 'center' },
  wordmark: {
    fontFamily: fonts.bodyBold,
    fontSize: 13,
    letterSpacing: 2,
    color: 'rgba(255,255,255,0.6)',
    marginBottom: 32,
  },
  title: { fontFamily: fonts.display, fontSize: 36, color: colors.white, marginBottom: 10 },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: 15,
    lineHeight: 22,
    color: 'rgba(255,255,255,0.75)',
    marginBottom: 40,
  },
  input: {
    fontFamily: fonts.bodyBold,
    fontSize: 24,
    letterSpacing: 8,
    color: colors.white,
    borderBottomWidth: 2,
    borderBottomColor: 'rgba(255,255,255,0.4)',
    paddingVertical: 12,
    marginBottom: 12,
    textAlign: 'center',
  },
  error: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: '#F9B89B',
    textAlign: 'center',
    marginBottom: 20,
  },
  btn: { marginTop: 12 },
  forgot: { alignItems: 'center', paddingVertical: 16 },
  forgotText: { fontFamily: fonts.bodyBold, fontSize: 14, color: 'rgba(255,255,255,0.55)' },
});
