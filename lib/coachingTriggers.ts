import AsyncStorage from '@react-native-async-storage/async-storage';

export interface CoachingTrigger {
  id: string;
  type: string;
  title: string;
  message: string;
  actionLabel?: string;
  actionRoute?: string;
  priority: 'high' | 'medium' | 'low';
  dismissible: boolean;
}

const DISMISSED_KEY = 'rapha_dismissed_triggers';

async function getDismissed(): Promise<string[]> {
  const raw = await AsyncStorage.getItem(DISMISSED_KEY);
  return raw ? JSON.parse(raw) : [];
}

export async function dismissTrigger(id: string): Promise<void> {
  const dismissed = await getDismissed();
  dismissed.push(id);
  await AsyncStorage.setItem(DISMISSED_KEY, JSON.stringify(dismissed));
}

// Check all triggers based on current state
export async function checkTriggers(context: {
  rmssd: number | null;
  heartRate: number | null;
  isConnected: boolean;
  interventions: any[];
  hourOfDay: number;
  dayOfWeek: number; // 0=Sun
  streakDays: number;
  lastSessionType?: string;
  conditions?: string[]; // user's selected conditions
}): Promise<CoachingTrigger[]> {
  const dismissed = await getDismissed();
  const triggers: CoachingTrigger[] = [];
  const today = new Date().toDateString();

  // --- POST-INTERVENTION TRIGGERS ---

  // After logging caffeine/coffee late in the day
  const recentCaffeine = context.interventions.find(i =>
    i.name?.toLowerCase().includes('coffee') || i.name?.toLowerCase().includes('caffeine')
  );
  if (recentCaffeine && context.hourOfDay >= 14) {
    const id = `caffeine_late_${today}`;
    if (!dismissed.includes(id)) {
      triggers.push({
        id, type: 'caffeine_warning', priority: 'medium', dismissible: true,
        title: 'Late Caffeine Alert',
        message: 'Caffeine after 2pm can reduce your sleep HRV by up to 18%. Consider L-Theanine to offset the impact.',
        actionLabel: 'Log L-Theanine', actionRoute: '/log-intervention',
      });
    }
  }

  // After a workout/exercise — recovery prompt
  const recentExercise = context.interventions.find(i =>
    i.category === 'activity' || i.category === 'exercise'
  );
  if (recentExercise) {
    const id = `post_workout_${today}`;
    if (!dismissed.includes(id)) {
      triggers.push({
        id, type: 'post_workout', priority: 'medium', dismissible: true,
        title: 'Recovery Check',
        message: 'Nice workout! Your body is recovering. A cold plunge or Zone 2 walk in the next hour could accelerate recovery by up to 40%.',
        actionLabel: 'Start Recovery Session', actionRoute: '/(tabs)/train',
      });
    }
  }

  // --- TIME-BASED TRIGGERS ---

  // Morning check-in (7-9am)
  if (context.hourOfDay >= 7 && context.hourOfDay <= 9) {
    const id = `morning_checkin_${today}`;
    if (!dismissed.includes(id)) {
      triggers.push({
        id, type: 'morning', priority: 'low', dismissible: true,
        title: 'Good Morning',
        message: context.isConnected && context.rmssd
          ? `Your morning RMSSD is ${context.rmssd}ms. ${context.rmssd > 50 ? 'Great recovery — green light for high intensity today.' : context.rmssd > 30 ? 'Moderate recovery — consider lighter activity.' : 'Low recovery — prioritize rest and gentle training today.'}`
          : 'Connect your device to see your morning readiness score. How are you feeling?',
        actionLabel: 'Quick Mood Check',
      });
    }
  }

  // Evening wind-down (9-10pm)
  if (context.hourOfDay >= 21 && context.hourOfDay <= 22) {
    const id = `evening_winddown_${today}`;
    if (!dismissed.includes(id)) {
      triggers.push({
        id, type: 'evening', priority: 'low', dismissible: true,
        title: 'Wind Down',
        message: 'Your body starts preparing for sleep now. A 10-minute Pre-Sleep session could improve tonight\'s sleep quality.',
        actionLabel: 'Start Pre-Sleep', actionRoute: '/(tabs)/train',
      });
    }
  }

  // --- HRV-BASED TRIGGERS ---

  // Sudden HRV drop (if connected and RMSSD drops below 20)
  if (context.isConnected && context.rmssd && context.rmssd < 20) {
    const id = `low_hrv_${today}`;
    if (!dismissed.includes(id)) {
      triggers.push({
        id, type: 'low_hrv', priority: 'high', dismissible: true,
        title: 'Low HRV Detected',
        message: `Your RMSSD is ${context.rmssd}ms — significantly below typical. Your nervous system is under stress. A breathing session could help right now.`,
        actionLabel: 'Quick Calm', actionRoute: '/(tabs)/train',
      });
    }
  }

  // High stress state
  if (context.isConnected && context.rmssd && context.rmssd < 30 && context.heartRate && context.heartRate > 80) {
    const id = `stress_state_${today}`;
    if (!dismissed.includes(id)) {
      triggers.push({
        id, type: 'stress', priority: 'high', dismissible: true,
        title: 'Stress Response Active',
        message: 'Your heart rate is elevated and HRV is low. Your sympathetic nervous system is dominant. Try 2 minutes of box breathing.',
        actionLabel: 'Start Breathing', actionRoute: '/(tabs)/train',
      });
    }
  }

  // --- STREAK/ENGAGEMENT TRIGGERS ---

  // Streak encouragement
  if (context.streakDays >= 3 && context.streakDays % 3 === 0) {
    const id = `streak_${context.streakDays}`;
    if (!dismissed.includes(id)) {
      triggers.push({
        id, type: 'streak', priority: 'low', dismissible: true,
        title: `${context.streakDays}-Day Streak!`,
        message: `You've trained ${context.streakDays} days in a row. Your consistency is building real nervous system resilience. Keep going!`,
      });
    }
  }

  // No session today (after 2pm)
  if (context.hourOfDay >= 14) {
    const todaysSessions = context.interventions.filter(i =>
      i.category === 'therapy' && new Date(i.timestamp).toDateString() === today
    );
    if (todaysSessions.length === 0) {
      const id = `no_session_${today}`;
      if (!dismissed.includes(id)) {
        triggers.push({
          id, type: 'nudge', priority: 'low', dismissible: true,
          title: 'Train Today?',
          message: 'You haven\'t done a training session today. Even 3 minutes of breathing can make a measurable difference.',
          actionLabel: 'Quick 3-Min Session', actionRoute: '/(tabs)/train',
        });
      }
    }
  }

  // --- CONDITION-SPECIFIC TRIGGERS ---

  // MCAS/POTS: HRV spike can also indicate a flare (not just drops)
  if (context.conditions?.some(c => ['POTS', 'MCAS', 'Dysautonomia', 'EDS'].includes(c))) {
    if (context.isConnected && context.rmssd && context.rmssd > 100) {
      const id = `hrv_spike_${today}`;
      if (!dismissed.includes(id)) {
        triggers.push({
          id, type: 'hrv_spike_warning', priority: 'medium', dismissible: true,
          title: 'Unusually High HRV',
          message: 'Your RMSSD is unusually high. For some people with autonomic conditions, HRV spikes can accompany flare-ups — not just drops. How are you feeling?',
          actionLabel: 'Quick Mood Check',
        });
      }
    }
  }

  // Sort by priority
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  triggers.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  // Max 2 triggers at a time to avoid overwhelming
  return triggers.slice(0, 2);
}
