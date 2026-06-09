import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { AppIcon } from './AppIcon';
import { colors } from '@/theme/colors';
import { fonts } from '@/theme/typography';

const STEPS = [
  { icon: 'candy', text: '15g fast-acting carbs (e.g. 4 glucose tablets, 150 mL juice)' },
  { icon: 'timer', text: 'Wait 15 minutes, then re-check your glucose' },
  { icon: 'repeat', text: 'If still below 4.0, repeat. If unwell, call emergency services' },
];

type Props = {
  value: number | null;
  onDismiss: () => void;
};

export function HypoModal({ value, onDismiss }: Props) {
  return (
    <Modal
      visible={value !== null}
      transparent
      animationType="fade"
      onRequestClose={onDismiss}
      accessibilityViewIsModal
    >
      <View style={styles.overlay}>
        <View style={styles.sheet} accessibilityLiveRegion="assertive">
          <View style={styles.header}>
            <View style={styles.icon}>
              <AppIcon name="warning" size={40} color={colors.badge} />
            </View>
            <Text style={styles.title}>Low glucose reading</Text>
            <Text style={styles.reading}>{value?.toFixed(1)} mmol/L</Text>
          </View>

          <Text style={styles.subtitle}>15-15 Rule</Text>
          {STEPS.map((step, i) => (
            <View key={i} style={styles.step}>
              <View style={styles.stepIcon}>
                <AppIcon name={step.icon} size={20} color={colors.teal} />
              </View>
              <Text style={styles.stepText}>{step.text}</Text>
            </View>
          ))}

          <View style={styles.emergency}>
            <Text style={styles.emergencyLabel}>Emergency services</Text>
            <Text style={styles.emergencyNumbers}>AU: 000 · NZ: 111 · UK: 999 · US: 911</Text>
          </View>

          <Text style={styles.disclaimer}>
            This is a wellness reminder only. Always follow your personalised care plan.
          </Text>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Dismiss hypo alert"
            style={styles.dismissBtn}
            onPress={onDismiss}
          >
            <Text style={styles.dismissText}>I understand, dismiss</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 28,
    paddingBottom: 40,
  },
  header: { alignItems: 'center', marginBottom: 24 },
  icon: { fontSize: 40, marginBottom: 10 },
  title: { fontFamily: fonts.display, fontSize: 22, color: colors.badge, marginBottom: 4 },
  reading: { fontFamily: fonts.bodyBold, fontSize: 28, color: colors.badge },
  subtitle: { fontFamily: fonts.bodyBold, fontSize: 13, letterSpacing: 1, color: colors.inkMuted, marginBottom: 14 },
  step: { flexDirection: 'row', gap: 12, marginBottom: 14, alignItems: 'flex-start' },
  stepIcon: { fontSize: 20, width: 28 },
  stepText: { flex: 1, fontFamily: fonts.body, fontSize: 14, lineHeight: 20, color: colors.ink },
  emergency: {
    backgroundColor: '#FCEEEA',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
    marginBottom: 16,
  },
  emergencyLabel: { fontFamily: fonts.bodyBold, fontSize: 12, color: colors.badge, marginBottom: 4 },
  emergencyNumbers: { fontFamily: fonts.bodyBold, fontSize: 14, color: colors.ink },
  disclaimer: {
    fontFamily: fonts.body,
    fontSize: 12,
    lineHeight: 16,
    color: colors.inkDim,
    textAlign: 'center',
    marginBottom: 20,
  },
  dismissBtn: {
    backgroundColor: colors.ink,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    minHeight: 52,
    justifyContent: 'center',
  },
  dismissText: { fontFamily: fonts.bodyBold, fontSize: 15, color: colors.white },
});
