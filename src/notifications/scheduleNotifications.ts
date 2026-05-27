import * as Notifications from 'expo-notifications';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowList: true,
  }),
});

export async function requestNotificationPermission(): Promise<boolean> {
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') return true;
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

type MedSchedule = {
  id: string;
  name: string;
  hour: number;
  minute: number;
};

export async function scheduleDoseReminder(med: MedSchedule) {
  await Notifications.cancelScheduledNotificationAsync(`med-${med.id}`).catch(() => {});

  await Notifications.scheduleNotificationAsync({
    identifier: `med-${med.id}`,
    content: {
      title: 'Time for your dose',
      body: `${med.name} is due now.`,
      data: { medicationId: med.id },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: med.hour,
      minute: med.minute,
    },
  });
}

export async function cancelDoseReminder(medicationId: string) {
  await Notifications.cancelScheduledNotificationAsync(`med-${medicationId}`).catch(() => {});
}

export async function cancelAllDoseReminders() {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  for (const n of scheduled) {
    if (n.identifier.startsWith('med-')) {
      await Notifications.cancelScheduledNotificationAsync(n.identifier);
    }
  }
}

const DEFAULT_SCHEDULES: Record<string, { hour: number; minute: number }> = {
  bictegravir: { hour: 8, minute: 0 },
  metformin: { hour: 12, minute: 30 },
  'evening-arv': { hour: 21, minute: 0 },
};

export async function scheduleDefaultReminders(medicationIds: string[], medicationNames: Record<string, string>) {
  const granted = await requestNotificationPermission();
  if (!granted) return;

  for (const id of medicationIds) {
    const schedule = DEFAULT_SCHEDULES[id] ?? { hour: 9, minute: 0 };
    await scheduleDoseReminder({
      id,
      name: medicationNames[id] ?? id,
      ...schedule,
    });
  }
}
