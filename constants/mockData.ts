export const mockUser = {
  name: 'Steve Mesita',
  firstName: 'Steve',
  email: 'steve@raphaai.com',
  age: 35,
  healthGoals: ['Autonomic Balance', 'Sleep Improvement', 'Stress Reduction'],
  conditions: 'Sympathetic dominance, MCAS',
  subscriptionTier: 'premium' as const,
};

export const mockCurrentHRV = {
  rmssd: 58.3,
  heartRate: 62,
  sdnn: 64.2,
  sd1: 41.3,
  autonomicState: 'parasympathetic' as const,
  trend: 'rising' as const,
  timestamp: new Date().toISOString(),
};

export const mockSparklineData = [
  42, 44, 43, 46, 48, 45, 47, 50, 49, 52,
  51, 53, 50, 52, 55, 54, 56, 53, 55, 57,
  56, 58, 55, 57, 59, 58, 57, 59, 58, 58.3,
];

export const mockMetrics = [
  { label: 'Stress', value: '28', unit: '', icon: 'flash-outline' as const, color: '#0ea87a' },
  { label: 'Recovery', value: '82', unit: '%', icon: 'fitness-outline' as const, color: '#0ea87a' },
  { label: 'Breathing', value: '14.2', unit: 'rpm', icon: 'cloud-outline' as const, color: '#a0a0b0' },
  { label: 'LF/HF', value: '1.4', unit: '', icon: 'pulse-outline' as const, color: '#f59e0b' },
  { label: 'Coherence', value: '72', unit: '%', icon: 'water-outline' as const, color: '#0ea87a' },
];

export const mockTodaySummary = {
  avgRmssd: 52.1,
  paraTime: '6h 24m',
  interventionCount: 5,
  bestIntervention: 'Magnesium Glycinate',
};

export const mockRecentInterventions = [
  {
    id: '1',
    name: 'Magnesium Glycinate',
    category: 'supplement' as const,
    dose: '400mg',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    rmssdDelta: 16.2,
    preRmssd: 42.1,
    postRmssd: 58.3,
  },
  {
    id: '2',
    name: 'Cold Plunge',
    category: 'therapy' as const,
    dose: '3 min',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    rmssdDelta: 13.4,
    preRmssd: 38.8,
    postRmssd: 52.2,
  },
  {
    id: '3',
    name: 'Box Breathing',
    category: 'therapy' as const,
    dose: '10 min',
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    rmssdDelta: 8.7,
    preRmssd: 44.1,
    postRmssd: 52.8,
  },
  {
    id: '4',
    name: 'Coffee',
    category: 'food' as const,
    dose: '2 cups',
    timestamp: new Date(Date.now() - 7 * 60 * 60 * 1000).toISOString(),
    rmssdDelta: -9.3,
    preRmssd: 51.2,
    postRmssd: 41.9,
  },
  {
    id: '5',
    name: 'Morning Walk',
    category: 'activity' as const,
    dose: '25 min',
    timestamp: new Date(Date.now() - 9 * 60 * 60 * 1000).toISOString(),
    rmssdDelta: 6.1,
    preRmssd: 36.4,
    postRmssd: 42.5,
  },
];

export const mockTopInterventions = [
  { name: 'ISF Neurofeedback', avgDelta: 34.1, observations: 3, confidence: 0.65, category: 'therapy' },
  { name: 'Copper Bisglycinate', avgDelta: 22.4, observations: 5, confidence: 0.82, category: 'supplement' },
  { name: 'Magnesium Glycinate', avgDelta: 16.2, observations: 8, confidence: 0.91, category: 'supplement' },
  { name: 'Cold Plunge', avgDelta: 13.4, observations: 6, confidence: 0.78, category: 'therapy' },
  { name: 'Box Breathing', avgDelta: 8.7, observations: 12, confidence: 0.94, category: 'therapy' },
  { name: 'Morning Walk', avgDelta: 6.1, observations: 15, confidence: 0.96, category: 'activity' },
  { name: 'Afternoon Coffee', avgDelta: -9.3, observations: 10, confidence: 0.88, category: 'food' },
  { name: 'Late Workout', avgDelta: -5.8, observations: 4, confidence: 0.62, category: 'activity' },
];

export const mockSleepData = {
  lastNightRmssd: 52.4,
  sleepScore: 82,
  avgOvernightHr: 54,
  weeklyTrend: [68, 72, 78, 74, 80, 76, 82],
  weekLabels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
};

export const mockWeeklyReport = {
  narrative: `This week showed steady improvement in your autonomic balance, Steve. Your average RMSSD increased from 44.2ms to 52.1ms — a 17.9% improvement. You spent significantly more time in parasympathetic states compared to last week.`,
  topHelpers: ['Magnesium Glycinate (+16ms avg)', 'Cold Plunge (+13ms avg)', 'ISF Neurofeedback (+34ms peak)'],
  thingsToAvoid: ['Afternoon coffee after 2pm (-9ms overnight)', 'Late workouts after 8pm (-6ms overnight)'],
  sleepTrend: 'Improving — sleep scores up 12% week-over-week',
  generatedDate: new Date().toISOString(),
};

export const mockChatMessages = [
  {
    id: '1',
    role: 'assistant' as const,
    content: `Good morning, Steve! 👋 Your overnight RMSSD was 52.4ms — that's 38% above your 30-day average. Your nervous system recovered beautifully last night. How are you feeling?`,
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '2',
    role: 'user' as const,
    content: 'Feeling great actually! Just took my morning magnesium.',
    timestamp: new Date(Date.now() - 2.9 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '3',
    role: 'assistant' as const,
    content: `Got it — magnesium glycinate logged at ${new Date(Date.now() - 2.9 * 60 * 60 * 1000).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}. Your current RMSSD is 42.1ms. Based on your previous 8 sessions with magnesium, you typically see a ↑16ms boost peaking around 45-60 minutes. I'll keep an eye on your numbers and follow up.`,
    timestamp: new Date(Date.now() - 2.85 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '4',
    role: 'user' as const,
    content: 'What\'s helping me most this week?',
    timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '5',
    role: 'assistant' as const,
    content: `Here's your top interventions this week, Steve:\n\n**Most effective:**\n1. **ISF Neurofeedback** → ↑34.1% avg RMSSD | 3 sessions | confidence: moderate\n2. **Copper Bisglycinate** → ↑22.4% avg | 5 observations | confidence: high\n3. **Magnesium Glycinate** → ↑16.2ms avg | 8 observations | confidence: very high\n\n**Working against you:**\n• Afternoon coffee → ↓9.3ms overnight RMSSD | high confidence\n\nYour magnesium + cold plunge combo in the morning is your strongest routine. Keep it going! 💪`,
    timestamp: new Date(Date.now() - 0.9 * 60 * 60 * 1000).toISOString(),
  },
];

export const interventionCategories = [
  { key: 'supplement', label: 'Supplement', icon: 'medical-outline' as const },
  { key: 'therapy', label: 'Therapy', icon: 'pulse-outline' as const },
  { key: 'activity', label: 'Activity', icon: 'walk-outline' as const },
  { key: 'food', label: 'Food', icon: 'restaurant-outline' as const },
  { key: 'prayer', label: 'Prayer', icon: 'heart-outline' as const },
  { key: 'other', label: 'Other', icon: 'ellipsis-horizontal-outline' as const },
];
