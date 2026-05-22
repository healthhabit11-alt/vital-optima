/** Mock data for MVP UI prototype. Aligns with VitalOptima PRD v2.0. */

export type MedicationStatus = 'due' | 'taken' | 'upcoming' | 'missed';

export type Medication = {
  id: string;
  name: string;
  schedule: string;
  status: MedicationStatus;
  gradient: [string, string];
  icon: string;
  tag?: string;
  interactionNote?: string;
};

export type MedicationComponent = {
  id: string;
  title: string;
  meta: string;
  flagged?: boolean;
  action: 'customize' | 'swap';
  icon: string;
};

export type TrackerCategory = {
  id: string;
  title: string;
  description: string;
  icon: string;
  tint: string;
};

export type GlucoseReading = {
  value: number;
  unit: 'mmol/L';
  loggedAt: string;
  inRange: boolean;
};

export const user = {
  displayName: 'Alex',
  region: 'AU',
  reminderCount: 1,
};

export const adherence = {
  streakDays: 12,
  dosesToday: 2,
  dosesTotal: 3,
};

export const dashboardInsight = {
  title: 'Stay on track today',
  body: 'You have one dose left this evening. Logging takes two taps. This app supports your routine; it does not replace your care team.',
  cta: 'View medications',
};

export const latestGlucose: GlucoseReading = {
  value: 5.2,
  unit: 'mmol/L',
  loggedAt: 'Today, 8:14 AM',
  inRange: true,
};

export const weekGlucoseTrend = [5.8, 5.4, 5.2, 4.9, 5.1, 5.2, 5.0];

export const todaysMedications: Medication[] = [
  {
    id: 'bictegravir',
    name: 'Bictegravir combo',
    schedule: 'Morning · with food',
    status: 'taken',
    gradient: ['#1A6B64', '#3D9B8F'],
    icon: '💊',
  },
  {
    id: 'metformin',
    name: 'Metformin',
    schedule: 'With lunch',
    status: 'taken',
    gradient: ['#0D4F4A', '#2E7D5A'],
    icon: '💊',
  },
  {
    id: 'evening-arv',
    name: 'Evening regimen',
    schedule: '9:00 PM',
    status: 'upcoming',
    gradient: ['#C45C4A', '#E89A6F'],
    icon: '💊',
  },
];

export const medicationCategories: TrackerCategory[] = [
  {
    id: 'daily',
    title: 'Daily medications',
    description: 'ARV and supporting meds with reminders',
    icon: '💊',
    tint: '#E8F2F1',
  },
  {
    id: 'interactions',
    title: 'Food and drug notes',
    description: 'Timing and meal guidance for your regimen',
    icon: '🍽️',
    tint: '#FFF8E6',
  },
  {
    id: 'history',
    title: 'Adherence history',
    description: 'Streaks, missed doses, and export-ready logs',
    icon: '📊',
    tint: '#FCEEEA',
  },
  {
    id: 'reminders',
    title: 'Reminders',
    description: 'Generic VitalOptima alerts only on lock screen',
    icon: '🔔',
    tint: '#E8F2F1',
  },
];

export type GlucoseQuickAction = {
  id: string;
  label: string;
  icon: string;
};

export const glucoseQuickActions: GlucoseQuickAction[] = [
  { id: 'log', label: 'Log reading', icon: '✏️' },
  { id: 'trend', label: '7-day trend', icon: '📈' },
  { id: 'hypo', label: 'Low reading help', icon: '⚠️' },
  { id: 'export', label: 'Export data', icon: '📤' },
];

export type MedicationDetail = Medication & { components: MedicationComponent[] };

export const medicationDetail: MedicationDetail = {
  id: 'evening-arv',
  name: 'Evening regimen',
  schedule: '9:00 PM · with light snack',
  status: 'upcoming',
  gradient: ['#C45C4A', '#E89A6F'],
  icon: '💊',
  components: [
    {
      id: 'dose',
      title: 'Standard evening dose',
      meta: 'As prescribed · log when taken',
      flagged: true,
      action: 'customize',
      icon: '💊',
    },
    {
      id: 'food',
      title: 'Take with food',
      meta: 'Logged lunch 12:40 PM',
      action: 'swap',
      icon: '🥗',
    },
    {
      id: 'interaction',
      title: 'Interaction check',
      meta: 'No new conflicts with today\'s log',
      action: 'customize',
      icon: '✓',
    },
  ],
};

export const wellnessResources = {
  title: 'Wellness resources',
  address: 'Local-first · no account required',
  summary: 'Guides and checklists · not medical advice',
  rating: 4.8,
  reviews: 128,
};

export const reportTimeSlots = [
  { time: '7 days', label: 'Summary' },
  { time: '30 days', label: 'Trends' },
  { time: '90 days', label: 'Clinic visit' },
];

const defaultComponents = (name: string): MedicationComponent[] => [
  {
    id: 'dose',
    title: `${name} dose`,
    meta: 'As prescribed · log when taken',
    flagged: true,
    action: 'customize',
    icon: '💊',
  },
  {
    id: 'food',
    title: 'Take with food',
    meta: 'Check timing with your care plan',
    action: 'swap',
    icon: '🥗',
  },
];

export const medicationDetailsById: Record<string, MedicationDetail> = {
  'evening-arv': medicationDetail,
  bictegravir: {
    ...todaysMedications[0],
    components: defaultComponents('Morning'),
  },
  metformin: {
    ...todaysMedications[1],
    components: defaultComponents('Lunch'),
  },
};

export function getMedicationDetail(id: string): MedicationDetail | undefined {
  return medicationDetailsById[id];
}
