// Server-side API route (Expo Router). Runs on the server, never bundled into
// the app. This is where the Anthropic key lives — the client only talks to
// this endpoint, never to api.anthropic.com directly.

const MODEL = 'claude-haiku-4-5';
const MAX_TOKENS = 512;
const MAX_HISTORY = 20;

type Role = 'user' | 'assistant';
type ChatMessage = { role: Role; content: string };
type HealthContext = { glucose: string; meds: string; nutrition: string };

function buildSystemPrompt({ glucose, meds, nutrition }: HealthContext): string {
  return `You are Vita, a compassionate health companion inside the Vital Optima app. The user lives with HIV on antiretroviral therapy (ARV) and manages type 2 diabetes.

Your role:
- Provide warm, practical support for medication adherence, glucose management, and nutrition
- Keep responses concise — this is a mobile chat, not a medical textbook
- Reference the user's health data below when relevant
- Redirect urgent or clinical decisions to their healthcare provider
- Never diagnose; always recommend professional consultation for clinical issues

Today's health snapshot:
${glucose}
${meds}
${nutrition}

Medication guidelines: emphasise ARV adherence (never skip doses), timing, food interactions.
Glucose guidelines: fasting target 3.9–7.8 mmol/L; flag readings outside range with care.
Nutrition guidelines: encourage low-GI foods, balanced macros for T2DM management.
Tone: warm, encouraging — living with HIV and T2DM takes real courage.`;
}

function sanitizeMessages(input: unknown): ChatMessage[] {
  if (!Array.isArray(input)) return [];
  const cleaned = input
    .filter(
      (m): m is ChatMessage =>
        !!m &&
        (m.role === 'user' || m.role === 'assistant') &&
        typeof m.content === 'string' &&
        m.content.trim().length > 0,
    )
    .map(({ role, content }) => ({ role, content }));

  // Anthropic requires the conversation to start with a user message.
  const firstUser = cleaned.findIndex((m) => m.role === 'user');
  if (firstUser === -1) return [];
  return cleaned.slice(firstUser).slice(-MAX_HISTORY);
}

function asContext(input: unknown): HealthContext {
  const c = (input ?? {}) as Partial<HealthContext>;
  return {
    glucose: typeof c.glucose === 'string' ? c.glucose : 'Glucose: not available',
    meds: typeof c.meds === 'string' ? c.meds : 'Medications: not available',
    nutrition: typeof c.nutrition === 'string' ? c.nutrition : 'Nutrition: not available',
  };
}

export async function POST(request: Request): Promise<Response> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return Response.json(
      { error: 'Vita is not configured on the server (missing ANTHROPIC_API_KEY).' },
      { status: 500 },
    );
  }

  let payload: { messages?: unknown; context?: unknown };
  try {
    payload = await request.json();
  } catch {
    return Response.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const messages = sanitizeMessages(payload.messages);
  if (messages.length === 0) {
    return Response.json({ error: 'No valid messages to send.' }, { status: 400 });
  }

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: MAX_TOKENS,
        system: buildSystemPrompt(asContext(payload.context)),
        messages,
      }),
    });

    if (!res.ok) {
      const err = (await res.json().catch(() => ({}))) as { error?: { message?: string } };
      // Log full detail server-side; return a generic message to the client.
      console.error('Anthropic API error', res.status, err);
      return Response.json(
        { error: 'Vita could not respond right now. Please try again.' },
        { status: 502 },
      );
    }

    const data = (await res.json()) as { content: { type: string; text: string }[] };
    const reply = data.content.find((b) => b.type === 'text')?.text ?? "Sorry, I couldn't respond.";
    return Response.json({ reply });
  } catch (err) {
    console.error('Chat route failure', err);
    return Response.json({ error: 'Connection error. Please try again.' }, { status: 502 });
  }
}
