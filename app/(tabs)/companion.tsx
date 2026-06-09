import { Ionicons } from '@expo/vector-icons';
import { useCallback, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useGlucose } from '@/db/useGlucose';
import { useMedications } from '@/db/useMedications';
import { useNutrition } from '@/db/useNutrition';
import { useTheme } from '@/theme/ThemeContext';
import { useThemedStyles } from '@/theme/useThemedStyles';
import { fonts } from '@/theme/typography';

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
};

// The Anthropic key, model, system prompt, and history trimming now live
// server-side in app/api/chat+api.ts. The client only knows this endpoint.
const CHAT_ENDPOINT = '/api/chat';

// Vita's chat is gated until the Anthropic account backing /api/chat has API
// credits. Until then we show a friendly "coming soon" screen so the rest of
// the app is fully shippable. To turn Vita on: fund the Anthropic account, then
// set EXPO_PUBLIC_VITA_ENABLED=true in .env (and as an EAS env var for builds).
const VITA_ENABLED = process.env.EXPO_PUBLIC_VITA_ENABLED === 'true';

export default function CompanionScreen() {
  return VITA_ENABLED ? <VitaChat /> : <VitaComingSoon />;
}

function VitaChat() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        "Hi! I'm Vita, your health companion. How are you feeling today? I can help with your medications, glucose readings, or nutrition.",
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const listRef = useRef<FlatList<Message>>(null);

  const { readings } = useGlucose();
  const { medications, todayDoseCount } = useMedications();
  const { dailyTotals } = useNutrition();

  const buildContext = useCallback(() => {
    const latest = readings[0];
    const glucose = latest
      ? `Glucose: latest ${latest.value} ${latest.unit} (${latest.inRange ? 'in range' : 'out of range'})`
      : 'Glucose: no readings logged today';
    const meds = `Medications: ${todayDoseCount} of ${medications.length} doses taken today`;
    const nutrition = `Nutrition: ${dailyTotals.calories} kcal today — carbs ${dailyTotals.carbsG}g, protein ${dailyTotals.proteinG}g, fat ${dailyTotals.fatG}g`;
    return { glucose, meds, nutrition };
  }, [readings, medications.length, todayDoseCount, dailyTotals]);

  const send = useCallback(async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg: Message = { id: `u${Date.now()}`, role: 'user', content: text };
    const history = [...messages, userMsg];
    setMessages(history);
    setInput('');
    setLoading(true);

    const context = buildContext();

    try {
      const res = await fetch(CHAT_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          context,
          messages: history.map(({ role, content }) => ({ role, content })),
        }),
      });

      const data = (await res.json().catch(() => ({}))) as { reply?: string; error?: string };

      if (!res.ok || !data.reply) {
        throw new Error(data.error ?? `HTTP ${res.status}`);
      }

      setMessages((prev) => [...prev, { id: `a${Date.now()}`, role: 'assistant', content: data.reply! }]);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      setMessages((prev) => [
        ...prev,
        { id: `e${Date.now()}`, role: 'assistant', content: `Connection error: ${msg}` },
      ]);
    } finally {
      setLoading(false);
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 80);
    }
  }, [input, loading, messages, buildContext]);

  const renderItem = useCallback(
    ({ item }: { item: Message }) => {
      const isUser = item.role === 'user';
      return (
        <View style={[styles.row, isUser ? styles.rowUser : styles.rowAssistant]}>
          {!isUser && (
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>V</Text>
            </View>
          )}
          <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleAssistant]}>
            <Text style={[styles.bubbleText, isUser ? styles.bubbleTextUser : styles.bubbleTextAssistant]}>
              {item.content}
            </Text>
          </View>
        </View>
      );
    },
    [styles],
  );

  return (
    <KeyboardAvoidingView
      style={[styles.root, { backgroundColor: colors.cream }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <View style={styles.headerAvatar}>
          <Text style={styles.headerAvatarText}>V</Text>
        </View>
        <View>
          <Text style={styles.headerTitle}>Vita</Text>
          <Text style={styles.headerSub}>Your health companion</Text>
        </View>
      </View>

      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(m) => m.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
        showsVerticalScrollIndicator={false}
      />

      {loading && (
        <View style={styles.typingRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>V</Text>
          </View>
          <View style={[styles.bubble, styles.bubbleAssistant, styles.typingBubble]}>
            <ActivityIndicator size="small" color={colors.teal} />
          </View>
        </View>
      )}

      <View style={[styles.inputBar, { paddingBottom: insets.bottom + 12 }]}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="Ask Vita anything…"
          placeholderTextColor={colors.inkDim}
          multiline
          maxLength={500}
          returnKeyType="send"
          onSubmitEditing={send}
          blurOnSubmit
        />
        <Pressable
          onPress={send}
          disabled={!input.trim() || loading}
          style={({ pressed }) => [
            styles.sendBtn,
            { backgroundColor: !input.trim() || loading ? colors.border : colors.teal },
            pressed && { opacity: 0.8 },
          ]}
          accessibilityLabel="Send message"
          accessibilityRole="button"
        >
          <Ionicons name="arrow-up" size={18} color="#fff" />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const COMING_SOON_FEATURES = [
  { icon: 'medkit-outline', text: 'Medication adherence, timing & food interactions' },
  { icon: 'pulse-outline', text: 'Friendly help making sense of your glucose readings' },
  { icon: 'nutrition-outline', text: 'Low-GI, diabetes-friendly nutrition guidance' },
] as const;

function VitaComingSoon() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);

  return (
    <View
      style={[
        styles.csRoot,
        { backgroundColor: colors.cream, paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 },
      ]}
    >
      <View style={styles.csHero}>
        <View style={styles.csAvatar}>
          <Text style={styles.csAvatarText}>V</Text>
        </View>
        <View style={styles.csBadge}>
          <Text style={styles.csBadgeText}>Coming soon</Text>
        </View>
        <Text style={styles.csTitle}>Meet Vita</Text>
        <Text style={styles.csSubtitle}>
          Your warm, private health companion is almost ready. Vita will chat with you about your
          day and help you stay on track.
        </Text>
      </View>

      <View style={styles.csCard}>
        {COMING_SOON_FEATURES.map((f) => (
          <View key={f.text} style={styles.csFeatureRow}>
            <View style={styles.csFeatureIcon}>
              <Ionicons name={f.icon} size={18} color={colors.teal} />
            </View>
            <Text style={styles.csFeatureText}>{f.text}</Text>
          </View>
        ))}
      </View>

      <Text style={styles.csFootnote}>
        Keep logging your medications, glucose, and meals — it&apos;ll all be here when Vita arrives.
      </Text>
    </View>
  );
}

function makeStyles(c: import('@/theme/ThemeContext').ColorPalette) {
  return StyleSheet.create({
    root: { flex: 1 },

    header: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      paddingHorizontal: 20,
      paddingBottom: 14,
      backgroundColor: c.white,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: c.border,
    },
    headerAvatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: c.teal,
      alignItems: 'center',
      justifyContent: 'center',
    },
    headerAvatarText: { fontFamily: fonts.display, fontSize: 18, color: c.white },
    headerTitle: { fontFamily: fonts.display, fontSize: 18, color: c.ink, lineHeight: 22 },
    headerSub: { fontFamily: fonts.body, fontSize: 12, color: c.inkDim },

    list: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 },

    row: { flexDirection: 'row', marginBottom: 12, alignItems: 'flex-end' },
    rowUser: { justifyContent: 'flex-end' },
    rowAssistant: { justifyContent: 'flex-start' },

    avatar: {
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: c.tealLight,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 8,
      flexShrink: 0,
    },
    avatarText: { fontFamily: fonts.bodyBold, fontSize: 12, color: c.white },

    bubble: { maxWidth: '78%', borderRadius: 18, paddingHorizontal: 14, paddingVertical: 10 },
    bubbleUser: { backgroundColor: c.teal, borderBottomRightRadius: 4 },
    bubbleAssistant: {
      backgroundColor: c.white,
      borderWidth: 1,
      borderColor: c.border,
      borderBottomLeftRadius: 4,
    },
    bubbleText: { fontFamily: fonts.body, fontSize: 15, lineHeight: 21 },
    bubbleTextUser: { color: c.white },
    bubbleTextAssistant: { color: c.ink },

    typingRow: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      paddingHorizontal: 16,
      marginBottom: 8,
    },
    typingBubble: { paddingVertical: 12, paddingHorizontal: 16 },

    inputBar: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      gap: 10,
      paddingHorizontal: 16,
      paddingTop: 12,
      backgroundColor: c.white,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: c.border,
    },
    input: {
      flex: 1,
      fontFamily: fonts.body,
      fontSize: 15,
      color: c.ink,
      backgroundColor: c.cream,
      borderRadius: 20,
      paddingHorizontal: 16,
      paddingTop: 10,
      paddingBottom: 10,
      maxHeight: 100,
      borderWidth: 1,
      borderColor: c.border,
    },
    sendBtn: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    },

    // "Coming soon" state
    csRoot: { flex: 1, paddingHorizontal: 24, justifyContent: 'center', gap: 24 },
    csHero: { alignItems: 'center' },
    csAvatar: {
      width: 84,
      height: 84,
      borderRadius: 42,
      backgroundColor: c.teal,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 16,
    },
    csAvatarText: { fontFamily: fonts.display, fontSize: 38, color: c.white },
    csBadge: {
      backgroundColor: c.tealLight,
      borderRadius: 999,
      paddingHorizontal: 12,
      paddingVertical: 4,
      marginBottom: 14,
    },
    csBadgeText: {
      fontFamily: fonts.bodyBold,
      fontSize: 11,
      color: c.white,
      letterSpacing: 0.5,
      textTransform: 'uppercase',
    },
    csTitle: { fontFamily: fonts.display, fontSize: 28, color: c.ink, marginBottom: 8, textAlign: 'center' },
    csSubtitle: {
      fontFamily: fonts.body,
      fontSize: 15,
      lineHeight: 22,
      color: c.inkDim,
      textAlign: 'center',
      maxWidth: 320,
    },
    csCard: {
      backgroundColor: c.white,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: c.border,
      padding: 18,
      gap: 14,
    },
    csFeatureRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    csFeatureIcon: {
      width: 34,
      height: 34,
      borderRadius: 17,
      backgroundColor: c.cream,
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    },
    csFeatureText: { flex: 1, fontFamily: fonts.body, fontSize: 14, lineHeight: 20, color: c.ink },
    csFootnote: {
      fontFamily: fonts.body,
      fontSize: 13,
      lineHeight: 19,
      color: c.inkDim,
      textAlign: 'center',
      paddingHorizontal: 8,
    },
  });
}
