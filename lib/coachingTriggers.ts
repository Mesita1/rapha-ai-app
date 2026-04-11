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
        title: 'Late Caffeine Noticed',
        message: 'Caffeine after 2pm may affect your sleep HRV. You may want to consider L-Theanine to help offset the impact. Wellness data only — not medical advice.',
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
        message: 'Nice workout! Your body is recovering. Some people find that a cold plunge or Zone 2 walk in the next hour may support recovery. Wellness data only — not medical advice.',
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
          ? `Your morning RMSSD is ${context.rmssd}ms. ${context.rmssd > 50 ? 'Your body appears well-recovered based on your data. May be a good day for higher intensity activity.' : context.rmssd > 30 ? 'Moderate recovery based on your data. Consider lighter activity today.' : 'Your HRV is below your typical range. Rest and gentle recovery may help.'} Wellness data only — not medical advice.`
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
        message: 'Your body starts preparing for sleep around this time. A 10-minute Pre-Sleep session may support tonight\'s sleep quality. Wellness data only — not medical advice.',
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
        title: 'Low HRV Noticed',
        message: `Your RMSSD is ${context.rmssd}ms — below your typical range. Based on your data, your nervous system may be under increased demand. A breathing session may help. Wellness data only — not medical advice.`,
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
        title: 'Elevated Stress Response Noticed',
        message: 'Your heart rate is elevated and HRV is low based on your data. Your sympathetic nervous system may be more active. Consider trying 2 minutes of box breathing. Wellness data only — not medical advice.',
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
          message: 'You haven\'t done a training session today. Even 3 minutes of breathing may make a noticeable difference in how you feel.',
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

  // --- POTS / CHRONIC CONDITION PACING ALERTS ---
  // Only for users who selected POTS, Dysautonomia, CFS/ME, or Long COVID
  if (context.conditions?.some(c => ['POTS', 'Dysautonomia', 'CFS/ME', 'Long COVID'].includes(c))) {

    // Sustained elevated HR (possible orthostatic stress)
    if (context.isConnected && context.heartRate && context.heartRate > 100 && context.rmssd && context.rmssd < 35) {
      const id = `pacing_elevated_hr_${Date.now().toString().slice(0, -5)}`; // throttle to ~every 30 min
      if (!dismissed.includes(id)) {
        triggers.push({
          id, type: 'pacing_hr', priority: 'medium', dismissible: true,
          title: 'Elevated Heart Rate Noticed',
          message: 'Your heart rate is above 100 bpm and your HRV is below your typical range. How are you feeling? Consider checking in with yourself — sitting down or hydrating may help if you\'re feeling symptomatic.',
        });
      }
    }

    // HRV dropping significantly — below typical range
    if (context.isConnected && context.rmssd && context.rmssd < 20) {
      const id = `pacing_low_hrv_${Date.now().toString().slice(0, -5)}`;
      if (!dismissed.includes(id)) {
        triggers.push({
          id, type: 'pacing_low_hrv', priority: 'medium', dismissible: true,
          title: 'HRV Below Typical Range',
          message: 'Your current HRV reading is lower than usual. This may indicate your nervous system is under increased demand. Consider resting if you\'re not feeling well. This is wellness data only — not a medical assessment.',
        });
      }
    }

    // Daily energy budgeting reminder (morning)
    if (context.hourOfDay >= 7 && context.hourOfDay <= 9) {
      const id = `pacing_morning_${today}`;
      if (!dismissed.includes(id)) {
        const readinessText = context.rmssd && context.rmssd > 0
          ? context.rmssd > 50
            ? 'Your morning HRV looks higher than usual — you may have more capacity today, but always listen to your body.'
            : context.rmssd > 30
            ? 'Your morning HRV is in your moderate range. Pacing your activities throughout the day may help you feel better this evening.'
            : 'Your morning HRV is on the lower side. Being gentle with yourself today and prioritizing rest between activities may be helpful.'
          : 'Connect your device to see your morning HRV reading.';

        triggers.push({
          id, type: 'pacing_morning', priority: 'low', dismissible: true,
          title: 'Morning Check-In',
          message: readinessText,
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
