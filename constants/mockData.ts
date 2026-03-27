export const mockUser = {
  name: 'Steve Mesita',
  firstName: 'Steve',
  email: 'steve@ayanaretail.com',
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
  { label: 'Stress', value: '34', unit: '', icon: 'flash-outline' as const, color: '#0ea87a' },
  { label: 'Recovery', value: '87', unit: '%', icon: 'fitness-outline' as const, color: '#0ea87a' },
  { label: 'Breathing', value: '14.2', unit: 'rpm', icon: 'cloud-outline' as const, color: '#8e8e93' },
  { label: 'LF/HF', value: '1.4', unit: '', icon: 'pulse-outline' as const, color: '#ffd93d' },
  { label: 'Coherence', value: '72', unit: '%', icon: 'water-outline' as const, color: '#0ea87a' },
];

export const mockTodaySummary = {
  avgRmssd: 52.1,
  paraTime: '4h 12m',
  interventionCount: 5,
  bestIntervention: 'Magnesium',
  bestDelta: '+16ms',
};

export const mockRecentInterventions = [
  {
    id: '1',
    name: 'Magnesium Glycinate',
    category: 'supplement' as const,
    dose: '400mg',
    timestamp: '4:46 PM',
    rmssdDelta: 16,
    preRmssd: 42.1,
    postRmssd: 58.3,
  },
  {
    id: '2',
    name: 'Cold Plunge',
    category: 'therapy' as const,
    dose: '20 min',
    timestamp: '5:46 PM',
    rmssdDelta: 13,
    preRmssd: 38.8,
    postRmssd: 52.2,
  },
  {
    id: '3',
    name: 'Coffee',
    category: 'food' as const,
    dose: '8oz',
    timestamp: '6:46 PM',
    rmssdDelta: -9,
    preRmssd: 51.2,
    postRmssd: 41.9,
  },
  {
    id: '4',
    name: 'Prayer (Silent)',
    category: 'prayer' as const,
    dose: '15 min',
    timestamp: '7:15 PM',
    rmssdDelta: 22,
    preRmssd: 36.0,
    postRmssd: 58.0,
  },
  {
    id: '5',
    name: 'L-Theanine',
    category: 'supplement' as const,
    dose: '200mg',
    timestamp: '8:00 PM',
    rmssdDelta: 6.1,
    preRmssd: 46.4,
    postRmssd: 52.5,
  },
];

export const mockTopInterventions = [
  { name: 'Cold Plunge', avgDelta: 15.2, observations: 8, confidence: 0.72, category: 'therapy' },
  { name: 'Magnesium Glycinate', avgDelta: 12.5, observations: 14, confidence: 0.88, category: 'supplement' },
  { name: 'Morning Walk', avgDelta: 10.7, observations: 18, confidence: 0.91, category: 'activity' },
  { name: 'Box Breathing', avgDelta: 8.3, observations: 22, confidence: 0.94, category: 'therapy' },
  { name: 'L-Theanine', avgDelta: 6.1, observations: 6, confidence: 0.55, category: 'supplement' },
  { name: 'Coffee', avgDelta: -7.4, observations: 20, confidence: 0.89, category: 'food' },
];

export const mockSleepData = {
  lastNightRmssd: 52,
  sleepScore: 82,
  avgOvernightHr: 54,
  weeklyTrend: [62, 65, 70, 68, 72, 70, 82],
  weekLabels: ['T', 'F', 'S', 'S', 'M', 'T', 'W'],
};

export const mockWeeklyReport = {
  narrative: `Your autonomic nervous system showed significant improvement this week. Average RMSSD increased 11% compared to last week, driven primarily by consistent use of magnesium supplementation and cold exposure.`,
  topHelpers: [
    'Magnesium Glycinate remains your most reliable supplement (+12.5ms avg)',
    'Afternoon coffee consistently reduces HRV — consider switching to decaf after noon',
    'Sleep quality trending upward — overnight RMSSD improved 15%',
  ],
  thingsToAvoid: ['Afternoon coffee after 2pm (-9ms overnight)', 'Late workouts after 8pm (-6ms overnight)'],
  sleepTrend: 'Improving — sleep scores up 12% week-over-week',
  generatedDate: '3/25/2026',
};

export const mockChatMessages = [
  {
    id: '1',
    role: 'assistant' as const,
    content: `Noted! Your current RMSSD is 58.3ms. Let's see how this changes over the next half hour.`,
    timestamp: '8:48 PM',
  },
  {
    id: '2',
    role: 'user' as const,
    content: 'Does it have to be half hour I want to see instant impact as well',
    timestamp: '8:48 PM',
  },
  {
    id: '3',
    role: 'assistant' as const,
    content: `Not at all! I'm tracking continuously. You'll see live changes on your dashboard right now. Go to Settings to customize exactly which check-in times you want.`,
    timestamp: '8:48 PM',
  },
];

export const interventionCategories = [
  { key: 'supplement', label: 'Supplement', icon: 'medical-outline' as const },
  { key: 'therapy', label: 'Therapy', icon: 'pulse-outline' as const },
  { key: 'activity', label: 'Activity', icon: 'walk-outline' as const },
  { key: 'food', label: 'Food', icon: 'restaurant-outline' as const },
  { key: 'prayer', label: 'Prayer/Spiritual', icon: 'heart-outline' as const },
  { key: 'other', label: 'Other', icon: 'ellipsis-horizontal-outline' as const },
];

export const prayerSubcategories = [
  'Silent Prayer',
  'Worship Music',
  'Scripture Meditation',
  'Intercessory Prayer',
  'Gratitude Practice',
  'Breathwork + Prayer',
];

export const mockPricingTiers = [
  {
    name: 'Free',
    monthlyPrice: 0,
    annualPrice: 0,
    features: [
      'Live HRV + Heart Rate',
      'Manual intervention logging',
      'Basic metrics (RMSSD, HR, Stress)',
      '3 AI coach messages/day',
      'Single device connection',
    ],
  },
  {
    name: 'Plus',
    monthlyPrice: 9.99,
    annualPrice: 79.99,
    popular: true,
    features: [
      'Everything in Free',
      'Unlimited AI coach messages',
      'All HRV check intervals',
      'Unlimited binaural sessions',
      'Full advanced metrics',
      'Shareable Insight Cards',
      'Sleep analysis + Sleep Score',
      'Weekly AI reports',
      'Up to 3 device connections',
      'CSV data export',
    ],
  },
  {
    name: 'Pro',
    monthlyPrice: 19.99,
    annualPrice: 159.99,
    features: [
      'Everything in Plus',
      'Real-time HRV commentary',
      'Custom music in Audio Sessions',
      'Deep Metrics (Poincare, DFA)',
      'Unlimited device connections',
      'Share with Practitioner',
      'Priority AI coaching',
    ],
  },
  {
    name: 'Practitioner',
    monthlyPrice: 49.99,
    annualPrice: 399.99,
    features: [
      'Everything in Pro (personal)',
      'Patient Dashboard (50 patients)',
      'Patient Alerts & Protocols',
      'Clinical Reports (PDF)',
      'Revenue sharing (20%)',
      'Custom enterprise pricing',
    ],
    foundingPrice: 29.99,
    foundingRemaining: 73,
  },
];

export const mockPatients = [
  { id: '1', name: 'Sarah Johnson', status: 'good' as const, avgRmssd: 54.2, stressScore: 28, lastActive: '2 hours ago' },
  { id: '2', name: 'Michael Chen', status: 'declining' as const, avgRmssd: 38.1, stressScore: 62, lastActive: '30 min ago' },
  { id: '3', name: 'Emily Rodriguez', status: 'good' as const, avgRmssd: 61.7, stressScore: 19, lastActive: '1 hour ago' },
  { id: '4', name: 'David Kim', status: 'attention' as const, avgRmssd: 31.4, stressScore: 74, lastActive: '15 min ago' },
  { id: '5', name: 'Lisa Thompson', status: 'good' as const, avgRmssd: 48.9, stressScore: 35, lastActive: '4 hours ago' },
];

// --- V2 ADDITIONS ---

export const dayInReview = "Strong recovery day. HRV peaked after prayer (+22ms). Coffee was your only dip. Sleep score: 82.";

export const autonomicTimeline: { hour: number; state: 'sympathetic' | 'parasympathetic' | 'dorsal' }[] = [
  { hour: 0, state: 'parasympathetic' },
  { hour: 1, state: 'parasympathetic' },
  { hour: 2, state: 'parasympathetic' },
  { hour: 3, state: 'parasympathetic' },
  { hour: 4, state: 'parasympathetic' },
  { hour: 5, state: 'dorsal' },
  { hour: 6, state: 'sympathetic' },
  { hour: 7, state: 'sympathetic' },
  { hour: 8, state: 'sympathetic' },
  { hour: 9, state: 'parasympathetic' },
  { hour: 10, state: 'sympathetic' },
  { hour: 11, state: 'sympathetic' },
  { hour: 12, state: 'sympathetic' },
  { hour: 13, state: 'parasympathetic' },
  { hour: 14, state: 'parasympathetic' },
  { hour: 15, state: 'sympathetic' },
  { hour: 16, state: 'sympathetic' },
  { hour: 17, state: 'parasympathetic' },
  { hour: 18, state: 'parasympathetic' },
  { hour: 19, state: 'parasympathetic' },
  { hour: 20, state: 'sympathetic' },
  { hour: 21, state: 'parasympathetic' },
  { hour: 22, state: 'parasympathetic' },
  { hour: 23, state: 'parasympathetic' },
];

export const bodyBattery: { hour: number; value: number }[] = [
  { hour: 6, value: 95 },
  { hour: 7, value: 92 },
  { hour: 8, value: 88 },
  { hour: 9, value: 85 },
  { hour: 10, value: 82 },
  { hour: 11, value: 78 },
  { hour: 12, value: 74 },
  { hour: 13, value: 76 },
  { hour: 14, value: 73 },
  { hour: 15, value: 70 },
  { hour: 16, value: 72 },
  { hour: 17, value: 69 },
  { hour: 18, value: 67 },
];

export const flareHistory = [
  { id: '1', date: '2026-03-22', duration: '47 min', lowestHrv: 22, trigger: 'Heat exposure', resolved: 'Box breathing + cold water', severity: 'moderate' as const },
  { id: '2', date: '2026-03-18', duration: '1h 12min', lowestHrv: 18, trigger: 'Food reaction (histamine)', resolved: 'Quercetin + rest', severity: 'severe' as const },
  { id: '3', date: '2026-03-12', duration: '25 min', lowestHrv: 31, trigger: 'Stress/argument', resolved: 'Prayer + L-Theanine', severity: 'mild' as const },
  { id: '4', date: '2026-03-05', duration: '38 min', lowestHrv: 26, trigger: 'Standing too long', resolved: 'Electrolytes + legs elevated', severity: 'moderate' as const },
];

export const communityDiscoveries = [
  { condition: 'POTS', intervention: 'Sodium loading', avgImprovement: 14, userCount: 23, trending: true },
  { condition: 'MCAS', intervention: 'Quercetin', avgImprovement: 11, userCount: 47, trending: true },
  { condition: 'PTSD', intervention: 'Prayer/Meditation', avgImprovement: 18, userCount: 31, trending: false },
  { condition: 'CFS/ME', intervention: 'Pacing + HRV monitoring', avgImprovement: 9, userCount: 19, trending: true },
  { condition: 'Long COVID', intervention: 'Cold exposure (gradual)', avgImprovement: 12, userCount: 15, trending: false },
];

export const interventionStacks = [
  { combo: ['Magnesium', 'Prayer'], combinedDelta: 31, individualSum: 17, synergyPercent: 78 },
  { combo: ['Cold Plunge', 'Box Breathing'], combinedDelta: 24, individualSum: 18, synergyPercent: 33 },
  { combo: ['L-Theanine', 'Worship Music'], combinedDelta: 19, individualSum: 14, synergyPercent: 36 },
];

export const achievements = [
  { name: '7-Day Streak', icon: 'flame-outline' as const, unlocked: true, description: 'Logged interventions 7 days in a row' },
  { name: 'First Prayer', icon: 'heart-outline' as const, unlocked: true, description: 'Tracked your first prayer session' },
  { name: '100 Interventions', icon: 'medal-outline' as const, unlocked: false, description: 'Log 100 total interventions' },
  { name: 'Sleep Champion', icon: 'moon-outline' as const, unlocked: true, description: 'Sleep score above 80 for 5 consecutive nights' },
  { name: 'Para Dominant', icon: 'leaf-outline' as const, unlocked: false, description: 'Parasympathetic dominant for 6+ hours in a day' },
  { name: 'Discovery Pioneer', icon: 'compass-outline' as const, unlocked: false, description: 'Discovered your #1 intervention' },
  { name: 'Community Hero', icon: 'people-outline' as const, unlocked: true, description: 'Shared your first Testimony Card' },
  { name: 'Early Adopter', icon: 'rocket-outline' as const, unlocked: true, description: 'Joined Rapha AI in the first month' },
];

export const trendArrows: Record<string, 'up' | 'down' | 'stable'> = {
  Stress: 'down',
  Recovery: 'up',
  Breathing: 'stable',
  'LF/HF': 'down',
  Coherence: 'up',
};

export const conditionsList = [
  'POTS',
  'MCAS',
  'Dysautonomia',
  'Fibromyalgia',
  'CFS/ME',
  'Long COVID',
  'Anxiety',
  'PTSD',
  'Autoimmune',
  'EDS',
  'TBI',
  'Insomnia',
  'Athletic',
  'General Wellness',
];

export const reasonOptions = [
  { key: 'chronic', label: 'Chronic Condition', icon: 'medkit-outline' as const },
  { key: 'athletic', label: 'Athletic Recovery', icon: 'fitness-outline' as const },
  { key: 'stress', label: 'Stress / Anxiety', icon: 'thunderstorm-outline' as const },
  { key: 'spiritual', label: 'Spiritual Journey', icon: 'heart-outline' as const },
  { key: 'practitioner', label: 'Practitioner Recommended', icon: 'person-outline' as const },
  { key: 'wellness', label: 'General Wellness', icon: 'leaf-outline' as const },
];
