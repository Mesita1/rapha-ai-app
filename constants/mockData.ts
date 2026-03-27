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
  {
    id: '6',
    role: 'assistant' as const,
    content: 'I noticed your HRV jumped +22ms during your prayer session \u2014 that\'s your strongest shift today. "He heals the brokenhearted and binds up their wounds" (Psalm 147:3). Your body responds deeply to these moments. Scripture meditation is consistently your top parasympathetic activator, averaging +19ms across 14 sessions.',
    timestamp: new Date(Date.now() - 0.5 * 60 * 60 * 1000).toISOString(),
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

// --- EXERCISE TRACKING DATA ---

export const mockExerciseData = {
  recentWorkouts: [
    { type: 'Running', distance: '5.2 mi', duration: '42:18', avgHR: 156, maxHR: 178, hrvBefore: 54, hrvAfter: 38, recovery: '3.5 hours', zones: { z1: 5, z2: 18, z3: 12, z4: 7, z5: 0 }, insight: 'Moderate impact. HRV recovered to baseline within 3.5 hours. Sweet spot for cardio benefit without overtraining.' },
    { type: 'Running', distance: '7.1 mi', duration: '58:42', avgHR: 162, maxHR: 184, hrvBefore: 52, hrvAfter: 31, recovery: '6.2 hours', zones: { z1: 3, z2: 15, z3: 20, z4: 15, z5: 5 }, insight: 'Heavy load. HRV dropped 40%. Recovery took 6+ hours. Next-day sleep score dropped 11%. Consider 5mi for similar cardio benefit with faster recovery.' },
    { type: 'Strength Training', subtype: 'Upper Body', duration: '55:00', avgHR: 132, maxHR: 165, hrvBefore: 56, hrvAfter: 41, recovery: '4.8 hours', sets: 24, volume: '12,400 lbs', insight: 'Moderate sympathetic activation. Good volume. HRV recovered by evening.' },
    { type: 'Strength Training', subtype: 'Legs', duration: '48:00', avgHR: 145, maxHR: 172, hrvBefore: 51, hrvAfter: 29, recovery: '8.1 hours', sets: 20, volume: '18,200 lbs', insight: 'Heavy leg day hits HRV hardest. 8+ hour recovery. Schedule early in the day when possible.' },
    { type: 'Zone 2 Walk', distance: '2.8 mi', duration: '38:00', avgHR: 108, maxHR: 118, hrvBefore: 48, hrvAfter: 55, recovery: 'Immediate', zones: { z1: 30, z2: 8, z3: 0, z4: 0, z5: 0 }, insight: 'Parasympathetic boost. HRV actually increased during walk. Best daily recovery exercise.' },
  ],
  weeklyExerciseSummary: {
    totalSessions: 5,
    totalMinutes: 242,
    avgRecoveryTime: '4.5 hours',
    bestType: 'Zone 2 Walk (+7ms avg)',
    worstType: 'Leg Day (-22ms acute)',
    recommendation: 'Your 7mi runs are costing 2x the recovery of 5mi runs for only 15% more cardio benefit. Consider capping runs at 5mi and adding a second Zone 2 walk instead.',
  },
};

// --- EXTENDED HEALTH METRICS ---

export const mockHealthMetrics = {
  bloodOxygen: { current: 98, trend: 'stable' as const, unit: '%', min24h: 94, avg24h: 97, insight: 'Normal range. Dipped to 94% during sleep — typical.', source: 'Apple Watch' },
  glucose: { current: 102, trend: 'rising' as const, unit: 'mg/dL', min24h: 78, max24h: 145, avg24h: 99, insight: 'Post-meal spike to 145 at 12:30pm. Returned to baseline in 2.1 hours — normal response. Morning fasting glucose trending 3% lower this week.', source: 'Dexcom G7' },
  restingHR: { current: 58, trend: 'down' as const, unit: 'bpm', weekAvg: 61, monthAvg: 63, insight: 'Improving. Down 5bpm from 30-day average — fitness adaptation working.', source: 'Apple Watch' },
  bodyTemp: { current: 97.8, trend: 'stable' as const, unit: '°F', deviation: -0.2, insight: 'Slightly below baseline. Could indicate early recovery phase.', source: 'Apple Watch' },
  respiratoryRate: { current: 14.2, trend: 'stable' as const, unit: 'brpm', sleepAvg: 12.8, insight: 'Normal. Sleep respiratory rate stable at 12.8 — no concerns.', source: 'Apple Watch' },
  steps: { current: 8420, goal: 10000, trend: 'up' as const, insight: 'On pace for 10K by evening. Zone 2 walk would close the gap and boost HRV.', source: 'Apple Watch' },
};

// --- TRAINING DATA ---

export const mockTrainingHistory = {
  thisWeek: { sessions: 4, minutes: 38, avgImprovement: 12 },
  streak: 5,
  bestSession: { name: 'Deep Calm', day: 'Tuesday', improvement: 18 },
};

export const mockComboProtocols = [
  { name: 'Vagal Reset', duration: '5 min', steps: ['Humming 1min', 'Bilateral tapping 2min', 'Resonance breathing 2min'], icons: ['musical-note-outline', 'hand-left-outline', 'leaf-outline'], users: 142, avgImprovement: 11 },
  { name: 'Deep Calm', duration: '10 min', steps: ['Binaural beats (theta) + Resonance breathing', 'Bilateral eye movement 3min'], icons: ['headset-outline', 'leaf-outline', 'eye-outline'], users: 98, avgImprovement: 16 },
  { name: 'Pre-Sleep Wind Down', duration: '15 min', steps: ['4-7-8 breathing 5min', 'Humming 3min', 'Binaural sleep prep 7min'], icons: ['leaf-outline', 'musical-note-outline', 'headset-outline'], users: 215, avgImprovement: 14 },
  { name: 'Crisis Calm', duration: '3 min', steps: ['Butterfly hug 1min', 'Box breathing 2min'], icons: ['hand-left-outline', 'leaf-outline'], users: 312, avgImprovement: 8 },
];

// --- ATHLETE & BIOHACKER EXPANSION ---

export const mockPopularSupplements = [
  { name: 'Creatine 5g', category: 'supplement' as const, avgDelta: +4.2, sleepImpact: -3.1, recoveryImpact: +8, observations: 312, users: 89, tags: ['strength', 'recovery'], insight: 'Boosts daytime HRV +4.2ms but reduces overnight RMSSD by 3.1ms. Best taken morning, not evening.' },
  { name: 'Ashwagandha KSM-66', category: 'supplement' as const, avgDelta: +11.3, sleepImpact: +6.8, recoveryImpact: +15, observations: 478, users: 134, tags: ['stress', 'sleep', 'recovery'], insight: 'Consistent parasympathetic boost. 134 users avg +11.3ms. Evening dose improves sleep score by 12%.' },
  { name: 'Tongkat Ali 400mg', category: 'supplement' as const, avgDelta: +2.1, sleepImpact: -1.4, recoveryImpact: +5, observations: 156, users: 47, tags: ['hormones', 'performance'], insight: 'Mild HRV benefit. Some users report disrupted sleep at higher doses.' },
  { name: 'L-Theanine 200mg', category: 'supplement' as const, avgDelta: +6.1, sleepImpact: +4.2, recoveryImpact: +9, observations: 523, users: 156, tags: ['focus', 'calm', 'sleep'], insight: 'One of the most reliable HRV boosters. Stacks well with caffeine — offsets the HRV dip.' },
  { name: 'Caffeine 200mg', category: 'supplement' as const, avgDelta: -7.8, sleepImpact: -12.3, recoveryImpact: -18, observations: 891, users: 267, tags: ['energy', 'focus'], insight: 'Strong sympathetic activator. HRV drops avg 7.8ms. After 2pm, sleep score drops 18%.' },
  { name: 'Cold Plunge 2-3min', category: 'therapy' as const, avgDelta: +15.2, sleepImpact: +3.4, recoveryImpact: +22, observations: 634, users: 189, tags: ['recovery', 'hormesis'], insight: 'Strongest acute HRV booster. 189 users avg +15.2ms. Morning cold > evening cold for sleep.' },
  { name: 'Sauna 15-20min', category: 'therapy' as const, avgDelta: +8.9, sleepImpact: +7.1, recoveryImpact: +14, observations: 298, users: 87, tags: ['recovery', 'sleep'], insight: 'Best 2-3 hours before bed. Evening sauna + cold plunge = +24ms combo.' },
  { name: 'Zone 2 Cardio 30min', category: 'activity' as const, avgDelta: +9.7, sleepImpact: +5.3, recoveryImpact: +16, observations: 445, users: 132, tags: ['cardio', 'endurance'], insight: 'Best HRV ROI for exercise. Keep HR under 65% max for parasympathetic benefit.' },
  { name: 'Heavy Lifting', category: 'activity' as const, avgDelta: -4.3, sleepImpact: -2.1, recoveryImpact: -8, observations: 367, users: 109, tags: ['strength'], insight: 'Acute HRV dip normal. Recovery within 4-6 hours. Avoid training when recovery score < 50%.' },
  { name: 'Breathwork (Wim Hof)', category: 'therapy' as const, avgDelta: +12.4, sleepImpact: +2.8, recoveryImpact: +11, observations: 234, users: 71, tags: ['breathing', 'hormesis'], insight: 'Powerful sympathetic-then-parasympathetic shift. 3 rounds optimal. More rounds = diminishing returns.' },
];

export const mockAthleteInsights = {
  preWorkout: { readiness: 87, recommendation: 'Green light for high intensity. Recovery score strong, HRV 14% above baseline.' },
  postWorkout: { recoveryEta: '4-6 hours', suggestion: 'Cold plunge within 30min will accelerate recovery by ~40%.' },
  sleepOptimization: { score: 82, insight: 'Your creatine timing is hurting sleep. Moving dose from 8pm to 7am could improve sleep score by 15%.' },
  stackAnalysis: [
    { stack: 'Creatine + L-Theanine', netDelta: +8.1, note: 'L-Theanine offsets creatine sleep disruption' },
    { stack: 'Cold Plunge + Sauna', netDelta: +24.1, note: 'Most powerful recovery combo across 87 users' },
    { stack: 'Caffeine + L-Theanine', netDelta: -1.7, note: 'L-Theanine reduces caffeine HRV hit by 78%' },
    { stack: 'Ashwagandha + Magnesium', netDelta: +22.4, note: 'Evening stack: sleep score improves 19%' },
  ],
};
