import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Animated,
  Linking,
  TextInput,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import GlassCard from '../../components/GlassCard';
import { Colors, FontSize, Spacing, BorderRadius, Shadows } from '../../constants/theme';
import { mockTrainingHistory, mockComboProtocols, mockCurrentHRV } from '../../constants/mockData';
import { getVerseOfTheDay, getVerseForState, scriptureVerses, ScriptureVerse } from '../../constants/scriptureData';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type SessionType = 'breathing' | 'bilateral' | 'humming' | 'binaural' | 'custom' | 'exercise';
type BreathingMode = 'box' | 'resonance' | '478' | 'custom';
type BilateralMode = 'butterfly' | 'tapping' | 'visual-tracking';
type HummingMode = 'om' | 'bhramari' | 'gargling' | 'bowl';
type ExerciseMode = 'zone2-walk' | 'cold-exposure' | 'rucking' | 'mobility' | 'interval-walking' | 'swimming';

interface ActiveSession {
  type: SessionType;
  mode: string;
  startTime: number;
  durationSeconds: number;
  currentRmssd: number;
}

const SESSION_TYPES = [
  {
    key: 'breathing' as SessionType,
    title: 'Adaptive Breathing',
    subtitle: 'AI-guided breathing that adapts to your HRV in real time',
    icon: 'leaf-outline' as const,
    gradientColors: ['rgba(14,168,122,0.3)', 'rgba(14,168,122,0.05)'] as [string, string],
    borderColor: '#0ea87a',
  },
  {
    key: 'bilateral' as SessionType,
    title: 'Bilateral Stimulation',
    subtitle: 'Alternating left-right activation for nervous system regulation',
    icon: 'hand-left-outline' as const,
    gradientColors: ['rgba(108,92,231,0.3)', 'rgba(108,92,231,0.05)'] as [string, string],
    borderColor: '#6C5CE7',
  },
  {
    key: 'humming' as SessionType,
    title: 'Humming / Vagal Toning',
    subtitle: 'Stimulate the vagus nerve through vocalization',
    icon: 'musical-note-outline' as const,
    gradientColors: ['rgba(245,158,11,0.3)', 'rgba(245,158,11,0.05)'] as [string, string],
    borderColor: '#f59e0b',
  },
  {
    key: 'binaural' as SessionType,
    title: 'Binaural Beats',
    subtitle: 'Calm, Focus, Sleep Prep, Recovery',
    icon: 'headset-outline' as const,
    gradientColors: ['rgba(59,130,246,0.3)', 'rgba(59,130,246,0.05)'] as [string, string],
    borderColor: '#3b82f6',
  },
  {
    key: 'custom' as SessionType,
    title: 'Custom / Other Device',
    subtitle: 'Track any device or therapy with HRV',
    icon: 'build-outline' as const,
    gradientColors: ['rgba(142,142,147,0.3)', 'rgba(142,142,147,0.05)'] as [string, string],
    borderColor: '#8e8e93',
  },
  {
    key: 'exercise' as SessionType,
    title: 'HRV Exercise',
    subtitle: 'Movement protocols proven to boost HRV',
    icon: 'bicycle-outline' as const,
    gradientColors: ['rgba(0,214,143,0.3)', 'rgba(0,214,143,0.05)'] as [string, string],
    borderColor: '#00d68f',
  },
];

const BREATHING_MODES = [
  { key: 'box' as BreathingMode, label: 'Box Breathing', desc: '4-4-4-4', pattern: [4, 4, 4, 4], howItWorks: 'Inhale 4 seconds, hold 4, exhale 4, hold 4. Follow the expanding circle. Activates parasympathetic nervous system.' },
  { key: 'resonance' as BreathingMode, label: 'Resonance', desc: '5.5s in/out', pattern: [5.5, 5.5], howItWorks: 'Slow, even breathing at 5.5 seconds in, 5.5 out. This frequency maximizes heart-lung synchronization (coherence).' },
  { key: '478' as BreathingMode, label: '4-7-8 Sleep', desc: '4-7-8', pattern: [4, 7, 8], howItWorks: 'Inhale 4 seconds, hold 7, exhale 8. Developed by Dr. Andrew Weil. Powerful for falling asleep.' },
  { key: 'custom' as BreathingMode, label: 'Custom', desc: 'Set your own', pattern: [4, 4, 4, 4], howItWorks: 'Set your own inhale, hold, exhale timing.' },
];

const BILATERAL_MODES = [
  { key: 'butterfly' as BilateralMode, label: 'Butterfly Hug', desc: 'Alternating arm cross-tap', howItWorks: 'Cross arms over chest, alternately tap left and right shoulders. Used in PTSD therapy. Calms the amygdala by engaging both brain hemispheres.' },
  { key: 'tapping' as BilateralMode, label: 'Bilateral Tapping', desc: 'Left/right tap with haptic', howItWorks: 'Alternate tapping left and right knees, hands, or surfaces. Follow the visual indicator. Rhythmic bilateral input calms the nervous system.' },
  { key: 'visual-tracking' as BilateralMode, label: 'Visual Tracking', desc: 'Bilateral visual dot tracking', howItWorks: 'Follow the dot as it moves left to right across the screen. This bilateral visual stimulation helps process stress and calm the nervous system. Speed adapts based on your HRV response.' },
];

const HUMMING_MODES = [
  { key: 'om' as HummingMode, label: 'Om / Humming', desc: 'Sustained tone guide', howItWorks: 'Produce a steady humming sound. The vibration stimulates the vagus nerve directly through the throat. Hum for the full exhale, then inhale and repeat.' },
  { key: 'bhramari' as HummingMode, label: 'Bee Breath (Bhramari)', desc: 'Bhramari pranayama', howItWorks: 'Cover ears with thumbs, close eyes. Inhale deeply, then exhale while making a buzzing/humming sound like a bee. The vibration + ear coverage amplifies vagal stimulation.' },
  { key: 'gargling' as HummingMode, label: 'Gargling', desc: 'Vagal nerve activation', howItWorks: 'Gargle water vigorously for 30-60 seconds. This activates the muscles at the back of the throat connected to the vagus nerve. Simple but effective.' },
  { key: 'bowl' as HummingMode, label: 'Singing Bowl', desc: 'Play tone, hum along', howItWorks: 'Listen to the tone and hum along at the same pitch. Matching the frequency creates resonance in your chest cavity that stimulates vagal tone.' },
];

const EXERCISE_MODES: { key: ExerciseMode; label: string; desc: string; icon: string; howItWorks: string; durations: number[]; hrTarget?: string }[] = [
  { key: 'zone2-walk', label: 'Zone 2 Walk', desc: 'Low-intensity aerobic walk', icon: 'leaf-outline', howItWorks: 'Walk at a comfortable pace where you can hold a conversation. Keep HR under 65% of max. The #1 exercise for HRV improvement — parasympathetic boost during and after.', durations: [900, 1200, 1800, 2700, 3600], hrTarget: 'Keep HR under 120 bpm' },
  { key: 'cold-exposure', label: 'Cold Exposure', desc: 'Dive reflex vagal activation', icon: 'snow-outline', howItWorks: 'Cold shower, plunge, or face immersion. Activates the dive reflex — one of the most powerful acute vagal stimulators. Start with 30 seconds, build to 2-3 minutes.', durations: [60, 120, 180, 300], hrTarget: 'Any pace' },
  { key: 'rucking', label: 'Rucking / Weighted Walk', desc: 'Weighted vest or backpack walk', icon: 'barbell-outline', howItWorks: 'Walk with a weighted vest or backpack (10-20% body weight). Increases cardiovascular load while staying in Zone 2. Studies show improved HRV and metabolic health. Start with 10-15 lbs.', durations: [900, 1200, 1800, 2700] },
  { key: 'mobility', label: 'Mobility / Stretching', desc: 'Reduce sympathetic tension', icon: 'resize-outline', howItWorks: 'Gentle stretching and foam rolling. Reduces muscle tension signaling to the brain, lowering sympathetic tone. Focus on hip flexors, thoracic spine, and neck.', durations: [300, 600, 900, 1200] },
  { key: 'interval-walking', label: 'Interval Walking', desc: '3 min brisk / 3 min slow', icon: 'walk-outline', howItWorks: 'Alternate 3 minutes brisk walking with 3 minutes slow walking. Norwegian study showed this improved HRV more than continuous moderate walking in older adults.', durations: [900, 1200, 1800] },
  { key: 'swimming', label: 'Swimming / Water Immersion', desc: 'Dive reflex + easy movement', icon: 'water-outline', howItWorks: 'Water immersion activates the mammalian dive reflex, boosting parasympathetic tone. Even floating in cool water improves HRV. Swimming at easy pace combines cold + movement.', durations: [600, 900, 1200, 1800] },
];

function BreathingCircle({ phase, progress }: { phase: string; progress: number }) {
  const scaleAnim = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    const targetScale = phase === 'inhale' ? 1 : phase === 'exhale' ? 0.6 : 0.8;
    Animated.timing(scaleAnim, {
      toValue: targetScale,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, [phase]);

  return (
    <View style={sessionStyles.breathCircleContainer}>
      <Animated.View
        style={[
          sessionStyles.breathCircle,
          { transform: [{ scale: scaleAnim }] },
        ]}
      >
        <LinearGradient
          colors={['rgba(14,168,122,0.4)', 'rgba(14,168,122,0.1)']}
          style={sessionStyles.breathCircleGradient}
        >
          <Text style={sessionStyles.breathPhaseText}>{phase}</Text>
        </LinearGradient>
      </Animated.View>
    </View>
  );
}

function BilateralDot({ side }: { side: 'left' | 'right' }) {
  return (
    <View style={sessionStyles.bilateralContainer}>
      <View style={[sessionStyles.bilateralSide, side === 'left' && sessionStyles.bilateralActive]}>
        <View style={[sessionStyles.bilateralDot, side === 'left' && sessionStyles.bilateralDotActive]} />
        <Text style={sessionStyles.bilateralLabel}>L</Text>
      </View>
      <View style={sessionStyles.bilateralDivider} />
      <View style={[sessionStyles.bilateralSide, side === 'right' && sessionStyles.bilateralActive]}>
        <View style={[sessionStyles.bilateralDot, side === 'right' && sessionStyles.bilateralDotActive]} />
        <Text style={sessionStyles.bilateralLabel}>R</Text>
      </View>
    </View>
  );
}

function WaveAnimation() {
  return (
    <View style={sessionStyles.waveContainer}>
      {[0, 1, 2, 3, 4].map((i) => (
        <View
          key={i}
          style={[
            sessionStyles.waveBar,
            { height: 20 + Math.sin(Date.now() / 300 + i) * 15, backgroundColor: `rgba(245,158,11,${0.3 + i * 0.15})` },
          ]}
        />
      ))}
    </View>
  );
}

type ScriptureCategory = 'today' | 'forMyState' | 'peace' | 'healing' | 'strength' | 'sleep' | 'gratitude' | 'jehovah-rapha';

const SCRIPTURE_CATEGORIES: { key: ScriptureCategory; label: string; icon: string }[] = [
  { key: 'today', label: "Today's Verse", icon: 'sunny-outline' },
  { key: 'forMyState', label: 'For My State', icon: 'pulse-outline' },
  { key: 'peace', label: 'Peace', icon: 'leaf-outline' },
  { key: 'healing', label: 'Healing', icon: 'heart-outline' },
  { key: 'strength', label: 'Strength', icon: 'fitness-outline' },
  { key: 'sleep', label: 'Sleep', icon: 'moon-outline' },
  { key: 'gratitude', label: 'Gratitude', icon: 'happy-outline' },
  { key: 'jehovah-rapha', label: 'Jehovah Rapha', icon: 'medkit-outline' },
];

function getVersesForCategory(category: ScriptureCategory): ScriptureVerse[] {
  if (category === 'today') return [getVerseOfTheDay()];
  if (category === 'forMyState') return [getVerseForState(mockCurrentHRV.autonomicState)];
  const tagMap: Record<string, string[]> = {
    peace: ['peace', 'stillness', 'rest', 'calm'],
    healing: ['healing', 'wounds', 'comfort'],
    strength: ['strength', 'power', 'ability'],
    sleep: ['sleep', 'rest', 'safety'],
    gratitude: ['thankfulness', 'gratitude', 'joy'],
    'jehovah-rapha': ['healing', 'jehovah-rapha', 'wholeness'],
  };
  const tags = tagMap[category] || [];
  return scriptureVerses.filter(v => v.tags.some(t => tags.includes(t)));
}

export default function TrainScreen() {
  const [activeSession, setActiveSession] = useState<ActiveSession | null>(null);
  const [selectedType, setSelectedType] = useState<SessionType | null>(null);
  const [selectedBreathingMode, setSelectedBreathingMode] = useState<BreathingMode>('box');
  const [selectedBilateralMode, setSelectedBilateralMode] = useState<BilateralMode>('butterfly');
  const [selectedHummingMode, setSelectedHummingMode] = useState<HummingMode>('om');
  const [sessionDuration, setSessionDuration] = useState(300); // 5 min default
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [breathPhase, setBreathPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
  const [bilateralSide, setBilateralSide] = useState<'left' | 'right'>('left');
  const [sessionRmssd, setSessionRmssd] = useState(mockCurrentHRV.rmssd);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Scripture meditation state
  const [showScriptureMeditation, setShowScriptureMeditation] = useState(false);
  const [scriptureCategory, setScriptureCategory] = useState<ScriptureCategory>('today');
  const [selectedVerse, setSelectedVerse] = useState<ScriptureVerse>(getVerseOfTheDay());
  const [scriptureDuration, setScriptureDuration] = useState(300);
  const [scriptureSessionActive, setScriptureSessionActive] = useState(false);
  const [scriptureElapsed, setScriptureElapsed] = useState(0);
  const [scriptureRmssd, setScriptureRmssd] = useState(mockCurrentHRV.rmssd);
  const [scriptureSessionComplete, setScriptureSessionComplete] = useState(false);
  const [scriptureStartRmssd, setScriptureStartRmssd] = useState(mockCurrentHRV.rmssd);
  const scriptureIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  // Custom device state
  const [showCustomSetup, setShowCustomSetup] = useState(false);
  const [customDeviceName, setCustomDeviceName] = useState('');
  const [customCategory, setCustomCategory] = useState('Other');
  const [customNotes, setCustomNotes] = useState('');
  const [customTags, setCustomTags] = useState('');
  const [customDuration, setCustomDuration] = useState(600);
  const [customSessionActive, setCustomSessionActive] = useState(false);
  const [customElapsed, setCustomElapsed] = useState(0);
  const [customRmssd, setCustomRmssd] = useState(mockCurrentHRV.rmssd);
  const [customStartRmssd, setCustomStartRmssd] = useState(mockCurrentHRV.rmssd);
  const [customSessionComplete, setCustomSessionComplete] = useState(false);
  const [customMarkedEvents, setCustomMarkedEvents] = useState<{ time: number; note: string }[]>([]);
  const customIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // HRV Exercise state
  const [showExerciseSetup, setShowExerciseSetup] = useState(false);
  const [selectedExerciseMode, setSelectedExerciseMode] = useState<ExerciseMode>('zone2-walk');
  const [exerciseDuration, setExerciseDuration] = useState(1800);
  const [exerciseSessionActive, setExerciseSessionActive] = useState(false);
  const [exerciseElapsed, setExerciseElapsed] = useState(0);
  const [exerciseRmssd, setExerciseRmssd] = useState(mockCurrentHRV.rmssd);
  const [exerciseStartRmssd, setExerciseStartRmssd] = useState(mockCurrentHRV.rmssd);
  const [exerciseSessionComplete, setExerciseSessionComplete] = useState(false);
  const exerciseIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const breathAnimRef = useRef(new Animated.Value(0.7)).current;

  useEffect(() => {
    if (activeSession) {
      intervalRef.current = setInterval(() => {
        setElapsedSeconds((prev) => {
          if (prev + 1 >= activeSession.durationSeconds) {
            stopSession();
            return prev;
          }
          return prev + 1;
        });
        // Simulate HRV improvement
        setSessionRmssd((prev) => prev + (Math.random() * 0.4 - 0.1));
        // Cycle breath phases
        setBreathPhase((prev) => prev === 'inhale' ? 'hold' : prev === 'hold' ? 'exhale' : 'inhale');
        // Alternate bilateral sides
        setBilateralSide((prev) => prev === 'left' ? 'right' : 'left');
      }, 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [activeSession]);

  // Scripture meditation session timer
  useEffect(() => {
    if (scriptureSessionActive) {
      // Breathing animation loop
      const breathLoop = () => {
        Animated.sequence([
          Animated.timing(breathAnimRef, { toValue: 1, duration: 4000, useNativeDriver: true }),
          Animated.timing(breathAnimRef, { toValue: 0.7, duration: 4000, useNativeDriver: true }),
        ]).start(() => { if (scriptureSessionActive) breathLoop(); });
      };
      breathLoop();

      scriptureIntervalRef.current = setInterval(() => {
        setScriptureElapsed((prev) => {
          if (prev + 1 >= scriptureDuration) {
            stopScriptureSession();
            return prev;
          }
          return prev + 1;
        });
        setScriptureRmssd((prev) => prev + (Math.random() * 0.5 - 0.05));
      }, 1000);
    }
    return () => {
      if (scriptureIntervalRef.current) clearInterval(scriptureIntervalRef.current);
    };
  }, [scriptureSessionActive]);

  const startScriptureSession = () => {
    setScriptureStartRmssd(mockCurrentHRV.rmssd);
    setScriptureRmssd(mockCurrentHRV.rmssd);
    setScriptureElapsed(0);
    setScriptureSessionActive(true);
    setScriptureSessionComplete(false);
  };

  const stopScriptureSession = () => {
    if (scriptureIntervalRef.current) clearInterval(scriptureIntervalRef.current);
    setScriptureSessionActive(false);
    setScriptureSessionComplete(true);
  };

  const resetScriptureMeditation = () => {
    setShowScriptureMeditation(false);
    setScriptureSessionActive(false);
    setScriptureSessionComplete(false);
    setScriptureElapsed(0);
    setScriptureCategory('today');
    setSelectedVerse(getVerseOfTheDay());
  };

  // Custom device session timer
  useEffect(() => {
    if (customSessionActive) {
      customIntervalRef.current = setInterval(() => {
        setCustomElapsed((prev) => {
          if (prev + 1 >= customDuration) {
            stopCustomSession();
            return prev;
          }
          return prev + 1;
        });
        setCustomRmssd((prev) => prev + (Math.random() * 0.4 - 0.1));
      }, 1000);
    }
    return () => {
      if (customIntervalRef.current) clearInterval(customIntervalRef.current);
    };
  }, [customSessionActive]);

  const startCustomSession = () => {
    setCustomStartRmssd(mockCurrentHRV.rmssd);
    setCustomRmssd(mockCurrentHRV.rmssd);
    setCustomElapsed(0);
    setCustomMarkedEvents([]);
    setCustomSessionActive(true);
    setCustomSessionComplete(false);
  };

  const stopCustomSession = () => {
    if (customIntervalRef.current) clearInterval(customIntervalRef.current);
    setCustomSessionActive(false);
    setCustomSessionComplete(true);
  };

  const resetCustomSession = () => {
    setShowCustomSetup(false);
    setCustomSessionActive(false);
    setCustomSessionComplete(false);
    setCustomElapsed(0);
    setCustomDeviceName('');
    setCustomCategory('Other');
    setCustomNotes('');
    setCustomTags('');
    setCustomMarkedEvents([]);
  };

  const markCustomEvent = () => {
    const note = `Event at ${formatTime(customElapsed)}`;
    setCustomMarkedEvents((prev) => [...prev, { time: customElapsed, note }]);
  };

  // HRV Exercise session timer
  useEffect(() => {
    if (exerciseSessionActive) {
      exerciseIntervalRef.current = setInterval(() => {
        setExerciseElapsed((prev) => {
          if (prev + 1 >= exerciseDuration) {
            stopExerciseSession();
            return prev;
          }
          return prev + 1;
        });
        setExerciseRmssd((prev) => prev + (Math.random() * 0.5 - 0.05));
      }, 1000);
    }
    return () => {
      if (exerciseIntervalRef.current) clearInterval(exerciseIntervalRef.current);
    };
  }, [exerciseSessionActive]);

  const startExerciseSession = () => {
    setExerciseStartRmssd(mockCurrentHRV.rmssd);
    setExerciseRmssd(mockCurrentHRV.rmssd);
    setExerciseElapsed(0);
    setExerciseSessionActive(true);
    setExerciseSessionComplete(false);
  };

  const stopExerciseSession = () => {
    if (exerciseIntervalRef.current) clearInterval(exerciseIntervalRef.current);
    setExerciseSessionActive(false);
    setExerciseSessionComplete(true);
  };

  const resetExerciseSession = () => {
    setShowExerciseSetup(false);
    setExerciseSessionActive(false);
    setExerciseSessionComplete(false);
    setExerciseElapsed(0);
    setSelectedExerciseMode('zone2-walk');
  };

  const CUSTOM_CATEGORIES = ['Frequency Device', 'Neurostimulator', 'Light Therapy', 'Sound Therapy', 'Neurofeedback', 'PEMF', 'Other'];

  const startSession = (type: SessionType, mode: string) => {
    setActiveSession({
      type,
      mode,
      startTime: Date.now(),
      durationSeconds: sessionDuration,
      currentRmssd: mockCurrentHRV.rmssd,
    });
    setElapsedSeconds(0);
    setSessionRmssd(mockCurrentHRV.rmssd);
    setSelectedType(null);
  };

  const stopSession = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setActiveSession(null);
    setElapsedSeconds(0);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const remainingSeconds = activeSession ? activeSession.durationSeconds - elapsedSeconds : 0;

  const getModeLabel = (session: ActiveSession) => {
    if (session.type === 'breathing') return BREATHING_MODES.find((m) => m.key === session.mode)?.label || session.mode;
    if (session.type === 'bilateral') return BILATERAL_MODES.find((m) => m.key === session.mode)?.label || session.mode;
    if (session.type === 'humming') return HUMMING_MODES.find((m) => m.key === session.mode)?.label || session.mode;
    return 'Binaural Beats';
  };

  // Mode selection modal content
  const renderModeSelection = () => {
    if (!selectedType) return null;

    if (selectedType === 'binaural') {
      router.push('/session');
      setSelectedType(null);
      return null;
    }

    const modes = selectedType === 'breathing' ? BREATHING_MODES
      : selectedType === 'bilateral' ? BILATERAL_MODES
      : HUMMING_MODES;

    const selectedMode = selectedType === 'breathing' ? selectedBreathingMode
      : selectedType === 'bilateral' ? selectedBilateralMode
      : selectedHummingMode;

    const typeInfo = SESSION_TYPES.find((t) => t.key === selectedType)!;

    return (
      <View style={styles.modeOverlay}>
        <GlassCard style={styles.modeCard}>
          <View style={styles.modeHeader}>
            <Ionicons name={typeInfo.icon} size={20} color={typeInfo.borderColor} />
            <Text style={styles.modeTitle}>{typeInfo.title}</Text>
            <TouchableOpacity onPress={() => setSelectedType(null)} style={styles.modeClose}>
              <Ionicons name="close" size={20} color={Colors.textMuted} />
            </TouchableOpacity>
          </View>

          <Text style={styles.modeSubtitle}>Select Mode</Text>
          {modes.map((mode) => (
            <TouchableOpacity
              key={mode.key}
              style={[
                styles.modeOption,
                selectedMode === mode.key && { borderColor: typeInfo.borderColor, backgroundColor: `${typeInfo.borderColor}10` },
              ]}
              onPress={() => {
                if (selectedType === 'breathing') setSelectedBreathingMode(mode.key as BreathingMode);
                else if (selectedType === 'bilateral') setSelectedBilateralMode(mode.key as BilateralMode);
                else setSelectedHummingMode(mode.key as HummingMode);
              }}
            >
              <Text style={styles.modeOptionLabel}>{mode.label}</Text>
              <Text style={styles.modeOptionDesc}>{mode.desc}</Text>
              {selectedMode === mode.key && 'howItWorks' in mode && (
                <Text style={styles.modeHowItWorks}>{(mode as any).howItWorks}</Text>
              )}
            </TouchableOpacity>
          ))}

          <Text style={styles.durationLabel}>Duration</Text>
          <View style={styles.durationRow}>
            {[180, 300, 600, 900].map((d) => (
              <TouchableOpacity
                key={d}
                style={[styles.durationPill, sessionDuration === d && { backgroundColor: typeInfo.borderColor }]}
                onPress={() => setSessionDuration(d)}
              >
                <Text style={[styles.durationPillText, sessionDuration === d && { color: Colors.white }]}>
                  {d / 60}m
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            style={[styles.startButton, { backgroundColor: typeInfo.borderColor }]}
            onPress={() => startSession(selectedType, selectedMode)}
          >
            <Ionicons name="play" size={18} color={Colors.white} />
            <Text style={styles.startButtonText}>Start Session</Text>
          </TouchableOpacity>
        </GlassCard>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.pageTitle}>Train</Text>
          <Text style={styles.pageSubtitle}>Adaptive Nervous System Training</Text>
        </View>

        {/* Active Session Banner */}
        {activeSession && (
          <GlassCard style={styles.activeBanner} glowColor={SESSION_TYPES.find((t) => t.key === activeSession.type)?.borderColor}>
            <View style={styles.activeBannerHeader}>
              <View style={styles.activePulse} />
              <Text style={styles.activeBannerTitle}>
                {getModeLabel(activeSession)} — {formatTime(remainingSeconds)} remaining
              </Text>
            </View>

            {/* Session Visualization */}
            {activeSession.type === 'breathing' && (
              <BreathingCircle phase={breathPhase} progress={elapsedSeconds / activeSession.durationSeconds} />
            )}
            {activeSession.type === 'bilateral' && (
              <BilateralDot side={bilateralSide} />
            )}
            {activeSession.type === 'humming' && (
              <WaveAnimation />
            )}

            <View style={styles.activeBannerStats}>
              <View style={styles.activeStat}>
                <Text style={styles.activeStatLabel}>Live RMSSD</Text>
                <Text style={styles.activeStatValue}>{sessionRmssd.toFixed(1)} ms</Text>
              </View>
              <View style={styles.activeStat}>
                <Text style={styles.activeStatLabel}>Change</Text>
                <Text style={[styles.activeStatValue, { color: Colors.accent }]}>
                  +{(sessionRmssd - mockCurrentHRV.rmssd).toFixed(1)} ms
                </Text>
              </View>
            </View>

            <TouchableOpacity style={styles.stopButton} onPress={stopSession}>
              <Ionicons name="stop-circle" size={18} color="#ef4444" />
              <Text style={styles.stopButtonText}>Stop</Text>
            </TouchableOpacity>
          </GlassCard>
        )}

        {/* Scripture Meditation Featured Card */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => setShowScriptureMeditation(true)}
          style={styles.scriptureFeaturedWrapper}
        >
          <LinearGradient
            colors={['rgba(212,165,116,0.2)', 'rgba(212,165,116,0.05)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.scriptureFeaturedGradient}
          >
            <View style={styles.scriptureFeaturedHeader}>
              <Ionicons name="book-outline" size={24} color="#d4a574" />
              <View style={styles.scriptureFeaturedInfo}>
                <Text style={styles.scriptureFeaturedTitle}>Scripture Meditation</Text>
                <Text style={styles.scriptureFeaturedSubtitle}>Meditate on Scripture with real-time HRV tracking</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#d4a574" />
            </View>
            <TouchableOpacity
              style={styles.scriptureFeaturedPreview}
              onPress={(e) => { e.stopPropagation(); Linking.openURL(getVerseOfTheDay().youversionUrl); }}
              activeOpacity={0.7}
            >
              <View style={styles.verseListRefRow}>
                <Text style={styles.scriptureFeaturedVerse} numberOfLines={1}>
                  {getVerseOfTheDay().reference} — {getVerseOfTheDay().text.substring(0, 40)}...
                </Text>
                <Ionicons name="book-outline" size={12} color="#d4a574" />
              </View>
            </TouchableOpacity>
          </LinearGradient>
        </TouchableOpacity>

        {/* Quick Start Grid */}
        <Text style={styles.sectionTitle}>Quick Start</Text>
        <View style={styles.quickStartGrid}>
          {SESSION_TYPES.map((type) => (
            <TouchableOpacity
              key={type.key}
              style={styles.sessionTypeCard}
              activeOpacity={0.7}
              onPress={() => {
                if (type.key === 'binaural') {
                  router.push('/session');
                } else if (type.key === 'custom') {
                  setShowCustomSetup(true);
                } else if (type.key === 'exercise') {
                  setShowExerciseSetup(true);
                } else {
                  setSelectedType(type.key);
                }
              }}
            >
              <LinearGradient
                colors={type.gradientColors}
                style={[styles.sessionTypeGradient, { borderColor: type.borderColor + '40' }]}
              >
                <Ionicons name={type.icon} size={28} color={type.borderColor} />
                <Text style={styles.sessionTypeTitle}>{type.title}</Text>
                <Text style={styles.sessionTypeSubtitle} numberOfLines={2}>{type.subtitle}</Text>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </View>

        {/* Combo Sessions */}
        <View style={styles.comboSection}>
          <View style={styles.comboHeaderRow}>
            <Text style={styles.sectionTitle}>Combo Protocols</Text>
            <TouchableOpacity>
              <Ionicons name="information-circle-outline" size={18} color={Colors.textMuted} />
            </TouchableOpacity>
          </View>

          {mockComboProtocols.map((combo) => (
            <TouchableOpacity key={combo.name} activeOpacity={0.7}>
              <GlassCard style={styles.comboCard}>
                <View style={styles.comboTop}>
                  <View style={styles.comboInfo}>
                    <Text style={styles.comboName}>{combo.name}</Text>
                    <Text style={styles.comboDuration}>{combo.duration}</Text>
                  </View>
                  <Ionicons name="play-circle" size={32} color={Colors.accent} />
                </View>

                <View style={styles.comboIconsRow}>
                  {combo.icons.map((icon, i) => (
                    <View key={i} style={styles.comboIconPill}>
                      <Ionicons name={icon as any} size={12} color={Colors.textMuted} />
                    </View>
                  ))}
                </View>

                <View style={styles.comboStepsRow}>
                  {combo.steps.map((step, i) => (
                    <Text key={i} style={styles.comboStep}>
                      {i + 1}. {step}
                    </Text>
                  ))}
                </View>

                <Text style={styles.comboCommunity}>
                  {combo.users} users, avg +{combo.avgImprovement}ms
                </Text>
              </GlassCard>
            </TouchableOpacity>
          ))}
        </View>

        {/* Training History */}
        <View style={styles.historySection}>
          <Text style={styles.sectionTitle}>Training History</Text>
          <GlassCard>
            <View style={styles.historyGrid}>
              <View style={styles.historyItem}>
                <Text style={styles.historyLabel}>This Week</Text>
                <Text style={styles.historyValue}>{mockTrainingHistory.thisWeek.sessions} sessions</Text>
                <Text style={styles.historyMeta}>{mockTrainingHistory.thisWeek.minutes} min, avg +{mockTrainingHistory.thisWeek.avgImprovement}ms</Text>
              </View>
              <View style={styles.historyItem}>
                <Text style={styles.historyLabel}>Streak</Text>
                <View style={styles.streakRow}>
                  <Ionicons name="flame" size={18} color="#f59e0b" />
                  <Text style={styles.streakValue}>{mockTrainingHistory.streak} days</Text>
                </View>
              </View>
              <View style={styles.historyItem}>
                <Text style={styles.historyLabel}>Best Session</Text>
                <Text style={styles.historyValue}>{mockTrainingHistory.bestSession.name}</Text>
                <Text style={styles.historyMeta}>{mockTrainingHistory.bestSession.day}, +{mockTrainingHistory.bestSession.improvement}ms</Text>
              </View>
            </View>
          </GlassCard>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Mode Selection Overlay */}
      {selectedType && selectedType !== 'binaural' && renderModeSelection()}

      {/* Custom Device Overlay */}
      {showCustomSetup && (
        <View style={styles.modeOverlay}>
          <ScrollView contentContainerStyle={styles.scriptureOverlayScroll}>
            <GlassCard style={styles.scriptureModal}>
              {/* Header */}
              <View style={styles.modeHeader}>
                <Ionicons name="build-outline" size={20} color="#8e8e93" />
                <Text style={styles.modeTitle}>Custom / Other Device</Text>
                <TouchableOpacity onPress={resetCustomSession} style={styles.modeClose}>
                  <Ionicons name="close" size={20} color={Colors.textMuted} />
                </TouchableOpacity>
              </View>

              {!customSessionActive && !customSessionComplete && (
                <>
                  <Text style={styles.modeHowItWorks}>
                    Use this to test and track any modality — frequency generators, neurofeedback, PEMF, vagus nerve stimulators, or anything else.
                  </Text>

                  {/* Device Name */}
                  <Text style={[styles.durationLabel, { marginTop: Spacing.md }]}>Device / Modality Name</Text>
                  <View style={styles.customInputContainer}>
                    <TextInput
                      style={styles.customInput}
                      placeholder="e.g., GB4000, Pulsetto, Apollo, FSM, rTMS..."
                      placeholderTextColor={Colors.textDim}
                      value={customDeviceName}
                      onChangeText={setCustomDeviceName}
                      maxLength={100}
                    />
                  </View>

                  {/* Category */}
                  <Text style={styles.durationLabel}>Category</Text>
                  <View style={styles.customCategoryRow}>
                    {CUSTOM_CATEGORIES.map((cat) => (
                      <TouchableOpacity
                        key={cat}
                        style={[styles.customCategoryPill, customCategory === cat && styles.customCategoryPillActive]}
                        onPress={() => setCustomCategory(cat)}
                      >
                        <Text style={[styles.customCategoryText, customCategory === cat && styles.customCategoryTextActive]}>{cat}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  {/* Notes */}
                  <Text style={styles.durationLabel}>Notes (optional)</Text>
                  <View style={styles.customInputContainer}>
                    <TextInput
                      style={[styles.customInput, { minHeight: 50 }]}
                      placeholder="e.g., 528 Hz, channel 3, 20 min protocol"
                      placeholderTextColor={Colors.textDim}
                      value={customNotes}
                      onChangeText={setCustomNotes}
                      multiline
                      maxLength={300}
                    />
                  </View>

                  {/* Tags */}
                  <Text style={styles.durationLabel}>Tags (optional)</Text>
                  <View style={styles.customInputContainer}>
                    <TextInput
                      style={styles.customInput}
                      placeholder="e.g., frequency, vagus, recovery"
                      placeholderTextColor={Colors.textDim}
                      value={customTags}
                      onChangeText={setCustomTags}
                      maxLength={200}
                    />
                  </View>

                  {/* Duration */}
                  <Text style={styles.durationLabel}>Duration</Text>
                  <View style={styles.durationRow}>
                    {[300, 600, 900, 1200, 1800, 3600].map((d) => (
                      <TouchableOpacity
                        key={d}
                        style={[styles.durationPill, customDuration === d && { backgroundColor: '#8e8e93' }]}
                        onPress={() => setCustomDuration(d)}
                      >
                        <Text style={[styles.durationPillText, customDuration === d && { color: Colors.white }]}>
                          {d / 60}m
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  {/* Start Button */}
                  <TouchableOpacity
                    style={[styles.startButton, { backgroundColor: Colors.accent }, !customDeviceName.trim() && { opacity: 0.5 }]}
                    onPress={startCustomSession}
                    disabled={!customDeviceName.trim()}
                  >
                    <Ionicons name="play" size={18} color={Colors.white} />
                    <Text style={styles.startButtonText}>Start Tracking</Text>
                  </TouchableOpacity>
                </>
              )}

              {/* Active Custom Session */}
              {customSessionActive && (
                <View style={styles.scriptureActiveSession}>
                  <Text style={styles.customDeviceTitle}>{customDeviceName}</Text>
                  <Text style={styles.customDeviceCategory}>{customCategory}</Text>

                  {/* Large RMSSD */}
                  <View style={styles.customRmssdContainer}>
                    <Text style={styles.customRmssdValue}>{customRmssd.toFixed(1)}</Text>
                    <Text style={styles.customRmssdUnit}>ms RMSSD</Text>
                  </View>

                  {/* Timer */}
                  <Text style={styles.customTimerText}>{formatTime(customDuration - customElapsed)} remaining</Text>

                  {/* Editable Notes */}
                  <View style={[styles.customInputContainer, { marginTop: Spacing.md }]}>
                    <TextInput
                      style={[styles.customInput, { minHeight: 40 }]}
                      placeholder="Jot observations..."
                      placeholderTextColor={Colors.textDim}
                      value={customNotes}
                      onChangeText={setCustomNotes}
                      multiline
                    />
                  </View>

                  {/* Mark Event */}
                  <TouchableOpacity style={styles.customMarkEventButton} onPress={markCustomEvent}>
                    <Ionicons name="flag-outline" size={16} color={Colors.accent} />
                    <Text style={styles.customMarkEventText}>Mark Event</Text>
                  </TouchableOpacity>

                  {/* Marked Events */}
                  {customMarkedEvents.length > 0 && (
                    <View style={styles.customEventsContainer}>
                      {customMarkedEvents.map((evt, i) => (
                        <View key={i} style={styles.customEventItem}>
                          <View style={styles.customEventDot} />
                          <Text style={styles.customEventText}>{evt.note}</Text>
                        </View>
                      ))}
                    </View>
                  )}

                  {/* Stats */}
                  <View style={[styles.scriptureActiveStats, { marginTop: Spacing.md }]}>
                    <View style={styles.activeStat}>
                      <Text style={styles.activeStatLabel}>Change</Text>
                      <Text style={[styles.activeStatValue, { color: Colors.accent }]}>
                        {(customRmssd - customStartRmssd) >= 0 ? '+' : ''}{(customRmssd - customStartRmssd).toFixed(1)} ms
                      </Text>
                    </View>
                    <View style={styles.activeStat}>
                      <Text style={styles.activeStatLabel}>Elapsed</Text>
                      <Text style={styles.activeStatValue}>{formatTime(customElapsed)}</Text>
                    </View>
                  </View>

                  <TouchableOpacity style={styles.stopButton} onPress={stopCustomSession}>
                    <Ionicons name="stop-circle" size={18} color="#ef4444" />
                    <Text style={styles.stopButtonText}>Stop</Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* Post-Session Summary */}
              {customSessionComplete && (
                <View style={styles.scripturePostSession}>
                  <Ionicons name="checkmark-circle" size={48} color={Colors.accent} />
                  <Text style={styles.scripturePostTitle}>Session Complete</Text>
                  <Text style={styles.customDeviceTitle}>{customDeviceName}</Text>
                  <Text style={styles.customDeviceCategory}>{customCategory}</Text>

                  <View style={styles.scripturePostStats}>
                    <View style={styles.scripturePostStatItem}>
                      <Text style={styles.scripturePostStatLabel}>Before</Text>
                      <Text style={styles.scripturePostStatValue}>{customStartRmssd.toFixed(1)} ms</Text>
                    </View>
                    <View style={styles.scripturePostStatItem}>
                      <Text style={styles.scripturePostStatLabel}>After</Text>
                      <Text style={styles.scripturePostStatValue}>{customRmssd.toFixed(1)} ms</Text>
                    </View>
                    <View style={styles.scripturePostStatItem}>
                      <Text style={styles.scripturePostStatLabel}>Delta</Text>
                      <Text style={[styles.scripturePostStatValue, { color: Colors.accent }]}>
                        {(customRmssd - customStartRmssd) >= 0 ? '+' : ''}{(customRmssd - customStartRmssd).toFixed(1)} ms
                      </Text>
                    </View>
                  </View>

                  <View style={styles.scripturePostStats}>
                    <View style={styles.scripturePostStatItem}>
                      <Text style={styles.scripturePostStatLabel}>Duration</Text>
                      <Text style={styles.scripturePostStatValue}>{formatTime(customElapsed)}</Text>
                    </View>
                    <View style={styles.scripturePostStatItem}>
                      <Text style={styles.scripturePostStatLabel}>Events</Text>
                      <Text style={styles.scripturePostStatValue}>{customMarkedEvents.length}</Text>
                    </View>
                  </View>

                  {/* Mini Timeline of Events */}
                  {customMarkedEvents.length > 0 && (
                    <View style={styles.customEventsContainer}>
                      <Text style={[styles.durationLabel, { marginTop: 0 }]}>Marked Events</Text>
                      {customMarkedEvents.map((evt, i) => (
                        <View key={i} style={styles.customEventItem}>
                          <View style={styles.customEventDot} />
                          <Text style={styles.customEventText}>{evt.note}</Text>
                        </View>
                      ))}
                    </View>
                  )}

                  <TouchableOpacity
                    style={[styles.startButton, { backgroundColor: Colors.accent, marginTop: Spacing.md }]}
                    onPress={resetCustomSession}
                  >
                    <Ionicons name="save-outline" size={18} color={Colors.white} />
                    <Text style={styles.startButtonText}>Save to Interventions</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.stopButton, { marginTop: Spacing.sm }]}
                    onPress={resetCustomSession}
                  >
                    <Text style={styles.stopButtonText}>Done</Text>
                  </TouchableOpacity>
                </View>
              )}
            </GlassCard>
          </ScrollView>
        </View>
      )}

      {/* HRV Exercise Overlay */}
      {showExerciseSetup && (
        <View style={styles.modeOverlay}>
          <ScrollView contentContainerStyle={styles.scriptureOverlayScroll}>
            <GlassCard style={styles.scriptureModal}>
              {/* Header */}
              <View style={styles.modeHeader}>
                <Ionicons name="bicycle-outline" size={20} color="#00d68f" />
                <Text style={styles.modeTitle}>HRV Exercise</Text>
                <TouchableOpacity onPress={resetExerciseSession} style={styles.modeClose}>
                  <Ionicons name="close" size={20} color={Colors.textMuted} />
                </TouchableOpacity>
              </View>

              {!exerciseSessionActive && !exerciseSessionComplete && (
                <>
                  <Text style={styles.modeHowItWorks}>
                    Evidence-based movement protocols proven to boost HRV. Select an exercise, set your duration, and track your real-time HRV response.
                  </Text>

                  <Text style={[styles.modeSubtitle, { marginTop: Spacing.md }]}>Select Protocol</Text>
                  {EXERCISE_MODES.map((mode) => (
                    <TouchableOpacity
                      key={mode.key}
                      style={[
                        styles.modeOption,
                        selectedExerciseMode === mode.key && { borderColor: '#00d68f', backgroundColor: 'rgba(0,214,143,0.08)' },
                      ]}
                      onPress={() => {
                        setSelectedExerciseMode(mode.key);
                        setExerciseDuration(mode.durations[Math.floor(mode.durations.length / 2)]);
                      }}
                    >
                      <View style={styles.exerciseModeHeader}>
                        <Ionicons name={mode.icon as any} size={18} color={selectedExerciseMode === mode.key ? '#00d68f' : Colors.textMuted} />
                        <View style={{ flex: 1 }}>
                          <Text style={styles.modeOptionLabel}>{mode.label}</Text>
                          <Text style={styles.modeOptionDesc}>{mode.desc}</Text>
                        </View>
                      </View>
                      {selectedExerciseMode === mode.key && (
                        <Text style={styles.modeHowItWorks}>{mode.howItWorks}</Text>
                      )}
                    </TouchableOpacity>
                  ))}

                  {/* Duration */}
                  <Text style={styles.durationLabel}>Duration</Text>
                  <View style={styles.durationRow}>
                    {(EXERCISE_MODES.find(m => m.key === selectedExerciseMode)?.durations || []).map((d) => (
                      <TouchableOpacity
                        key={d}
                        style={[styles.durationPill, exerciseDuration === d && { backgroundColor: '#00d68f' }]}
                        onPress={() => setExerciseDuration(d)}
                      >
                        <Text style={[styles.durationPillText, exerciseDuration === d && { color: Colors.white }]}>
                          {d >= 60 ? `${d / 60}m` : `${d}s`}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  {/* Start Button */}
                  <TouchableOpacity
                    style={[styles.startButton, { backgroundColor: '#00d68f' }]}
                    onPress={startExerciseSession}
                  >
                    <Ionicons name="play" size={18} color={Colors.white} />
                    <Text style={styles.startButtonText}>Start Session</Text>
                  </TouchableOpacity>
                </>
              )}

              {/* Active Exercise Session */}
              {exerciseSessionActive && (() => {
                const currentMode = EXERCISE_MODES.find(m => m.key === selectedExerciseMode);
                return (
                  <View style={styles.scriptureActiveSession}>
                    <Ionicons name={currentMode?.icon as any || 'fitness-outline'} size={32} color="#00d68f" />
                    <Text style={styles.customDeviceTitle}>{currentMode?.label}</Text>

                    {/* Large RMSSD */}
                    <View style={styles.customRmssdContainer}>
                      <Text style={styles.customRmssdValue}>{exerciseRmssd.toFixed(1)}</Text>
                      <Text style={styles.customRmssdUnit}>ms RMSSD</Text>
                      <Text style={[styles.exerciseTrend, { color: (exerciseRmssd - exerciseStartRmssd) >= 0 ? '#00d68f' : '#ef4444' }]}>
                        {(exerciseRmssd - exerciseStartRmssd) >= 0 ? '↑' : '↓'} {Math.abs(exerciseRmssd - exerciseStartRmssd).toFixed(1)} ms
                      </Text>
                    </View>

                    {/* Timer */}
                    <Text style={styles.customTimerText}>{formatTime(exerciseDuration - exerciseElapsed)} remaining</Text>

                    {/* HR Target Zone */}
                    {currentMode?.hrTarget && (
                      <View style={styles.exerciseHrTarget}>
                        <Ionicons name="heart-outline" size={14} color="#00d68f" />
                        <Text style={styles.exerciseHrTargetText}>{currentMode.hrTarget}</Text>
                      </View>
                    )}

                    {/* Stats */}
                    <View style={[styles.scriptureActiveStats, { marginTop: Spacing.md }]}>
                      <View style={styles.activeStat}>
                        <Text style={styles.activeStatLabel}>Change</Text>
                        <Text style={[styles.activeStatValue, { color: '#00d68f' }]}>
                          {(exerciseRmssd - exerciseStartRmssd) >= 0 ? '+' : ''}{(exerciseRmssd - exerciseStartRmssd).toFixed(1)} ms
                        </Text>
                      </View>
                      <View style={styles.activeStat}>
                        <Text style={styles.activeStatLabel}>Elapsed</Text>
                        <Text style={styles.activeStatValue}>{formatTime(exerciseElapsed)}</Text>
                      </View>
                    </View>

                    <TouchableOpacity style={styles.stopButton} onPress={stopExerciseSession}>
                      <Ionicons name="stop-circle" size={18} color="#ef4444" />
                      <Text style={styles.stopButtonText}>Stop</Text>
                    </TouchableOpacity>
                  </View>
                );
              })()}

              {/* Post-Session Summary */}
              {exerciseSessionComplete && (() => {
                const currentMode = EXERCISE_MODES.find(m => m.key === selectedExerciseMode);
                const delta = exerciseRmssd - exerciseStartRmssd;
                return (
                  <View style={styles.scripturePostSession}>
                    <Ionicons name="checkmark-circle" size={48} color="#00d68f" />
                    <Text style={styles.scripturePostTitle}>Session Complete</Text>
                    <Text style={styles.exercisePostModeName}>{currentMode?.label}</Text>

                    <View style={styles.scripturePostStats}>
                      <View style={styles.scripturePostStatItem}>
                        <Text style={styles.scripturePostStatLabel}>Before</Text>
                        <Text style={styles.scripturePostStatValue}>{exerciseStartRmssd.toFixed(1)} ms</Text>
                      </View>
                      <View style={styles.scripturePostStatItem}>
                        <Text style={styles.scripturePostStatLabel}>After</Text>
                        <Text style={styles.scripturePostStatValue}>{exerciseRmssd.toFixed(1)} ms</Text>
                      </View>
                      <View style={styles.scripturePostStatItem}>
                        <Text style={styles.scripturePostStatLabel}>Delta</Text>
                        <Text style={[styles.scripturePostStatValue, { color: '#00d68f' }]}>
                          {delta >= 0 ? '+' : ''}{delta.toFixed(1)} ms
                        </Text>
                      </View>
                    </View>

                    <View style={styles.scripturePostStats}>
                      <View style={styles.scripturePostStatItem}>
                        <Text style={styles.scripturePostStatLabel}>Duration</Text>
                        <Text style={styles.scripturePostStatValue}>{formatTime(exerciseElapsed)}</Text>
                      </View>
                    </View>

                    <Text style={styles.scripturePostInsight}>
                      {currentMode?.label} is your 2nd best HRV exercise, averaging +7.2ms across 8 sessions.
                    </Text>

                    <TouchableOpacity
                      style={[styles.startButton, { backgroundColor: '#00d68f', marginTop: Spacing.sm }]}
                      onPress={resetExerciseSession}
                    >
                      <Ionicons name="save-outline" size={18} color={Colors.white} />
                      <Text style={styles.startButtonText}>Save</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.stopButton, { marginTop: Spacing.sm }]}
                      onPress={resetExerciseSession}
                    >
                      <Text style={styles.stopButtonText}>Done</Text>
                    </TouchableOpacity>
                  </View>
                );
              })()}
            </GlassCard>
          </ScrollView>
        </View>
      )}

      {/* Scripture Meditation Overlay */}
      {showScriptureMeditation && (
        <View style={styles.modeOverlay}>
          <ScrollView contentContainerStyle={styles.scriptureOverlayScroll}>
            <GlassCard style={styles.scriptureModal}>
              {/* Header */}
              <View style={styles.modeHeader}>
                <Ionicons name="book-outline" size={20} color="#d4a574" />
                <Text style={styles.modeTitle}>Scripture Meditation</Text>
                <TouchableOpacity onPress={resetScriptureMeditation} style={styles.modeClose}>
                  <Ionicons name="close" size={20} color={Colors.textMuted} />
                </TouchableOpacity>
              </View>

              {!scriptureSessionActive && !scriptureSessionComplete && (
                <>
                  {/* How it works description */}
                  <Text style={styles.modeHowItWorks}>
                    Select a verse, read it slowly, and sit with it. Focus on the words and let them settle. The app tracks your HRV response — many users find Scripture meditation produces their strongest parasympathetic shifts.
                  </Text>

                  {/* Category Selection */}
                  <Text style={[styles.modeSubtitle, { marginTop: Spacing.md }]}>Choose a Verse</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scriptureCategoryScroll}>
                    <View style={styles.scriptureCategoryRow}>
                      {SCRIPTURE_CATEGORIES.map((cat) => (
                        <TouchableOpacity
                          key={cat.key}
                          style={[
                            styles.scriptureCategoryPill,
                            scriptureCategory === cat.key && styles.scriptureCategoryPillActive,
                          ]}
                          onPress={() => {
                            setScriptureCategory(cat.key);
                            const verses = getVersesForCategory(cat.key);
                            if (verses.length > 0) setSelectedVerse(verses[0]);
                          }}
                        >
                          <Ionicons name={cat.icon as any} size={12} color={scriptureCategory === cat.key ? '#d4a574' : Colors.textMuted} />
                          <Text style={[styles.scriptureCategoryText, scriptureCategory === cat.key && styles.scriptureCategoryTextActive]}>{cat.label}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </ScrollView>

                  {/* Verse List */}
                  {getVersesForCategory(scriptureCategory).length > 1 && (
                    <ScrollView style={styles.verseListScroll} nestedScrollEnabled>
                      {getVersesForCategory(scriptureCategory).map((verse, i) => (
                        <TouchableOpacity
                          key={`${verse.reference}-${i}`}
                          style={[styles.verseListItem, selectedVerse.reference === verse.reference && styles.verseListItemActive]}
                          onPress={() => setSelectedVerse(verse)}
                        >
                          <View style={styles.verseListRefRow}>
                            <Text style={styles.verseListRef}>{verse.reference}</Text>
                            <TouchableOpacity onPress={() => Linking.openURL(verse.youversionUrl)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                              <Ionicons name="book-outline" size={14} color="#d4a574" />
                            </TouchableOpacity>
                          </View>
                          <Text style={styles.verseListText} numberOfLines={2}>{verse.text}</Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  )}

                  {/* Selected Verse Display */}
                  <View style={styles.selectedVerseContainer}>
                    <Text style={styles.selectedVerseText}>"{selectedVerse.text}"</Text>
                    <View style={styles.verseListRefRow}>
                      <TouchableOpacity onPress={() => Linking.openURL(selectedVerse.youversionUrl)}>
                        <Text style={[styles.selectedVerseRef, { textDecorationLine: 'underline' }]}>{selectedVerse.reference} — {selectedVerse.translation}</Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => Linking.openURL(selectedVerse.youversionUrl)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                        <Ionicons name="book-outline" size={14} color="#d4a574" />
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Duration */}
                  <Text style={styles.durationLabel}>Duration</Text>
                  <View style={styles.durationRow}>
                    {[180, 300, 600].map((d) => (
                      <TouchableOpacity
                        key={d}
                        style={[styles.durationPill, scriptureDuration === d && { backgroundColor: '#d4a574' }]}
                        onPress={() => setScriptureDuration(d)}
                      >
                        <Text style={[styles.durationPillText, scriptureDuration === d && { color: Colors.white }]}>{d / 60}m</Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  {/* Start Button */}
                  <TouchableOpacity style={styles.scriptureStartButton} onPress={startScriptureSession}>
                    <Ionicons name="play" size={18} color={Colors.white} />
                    <Text style={styles.startButtonText}>Begin Meditation</Text>
                  </TouchableOpacity>
                </>
              )}

              {/* Active Scripture Session */}
              {scriptureSessionActive && (
                <View style={styles.scriptureActiveSession}>
                  <Text style={styles.scriptureActiveVerse}>"{selectedVerse.text}"</Text>
                  <TouchableOpacity onPress={() => Linking.openURL(selectedVerse.youversionUrl)}>
                    <Text style={[styles.scriptureActiveRef, { textDecorationLine: 'underline' }]}>{selectedVerse.reference}</Text>
                  </TouchableOpacity>

                  {/* Breathing Circle */}
                  <View style={styles.scriptureBreathContainer}>
                    <Animated.View style={[styles.scriptureBreathCircle, { transform: [{ scale: breathAnimRef }] }]}>
                      <LinearGradient
                        colors={['rgba(212,165,116,0.3)', 'rgba(212,165,116,0.08)']}
                        style={styles.scriptureBreathGradient}
                      >
                        <Text style={styles.scriptureBreathText}>breathe</Text>
                      </LinearGradient>
                    </Animated.View>
                  </View>

                  {/* Stats */}
                  <View style={styles.scriptureActiveStats}>
                    <View style={styles.activeStat}>
                      <Text style={styles.activeStatLabel}>Live RMSSD</Text>
                      <Text style={styles.activeStatValue}>{scriptureRmssd.toFixed(1)} ms</Text>
                    </View>
                    <View style={styles.activeStat}>
                      <Text style={styles.activeStatLabel}>Timer</Text>
                      <Text style={styles.activeStatValue}>{formatTime(scriptureDuration - scriptureElapsed)}</Text>
                    </View>
                  </View>

                  <TouchableOpacity style={styles.stopButton} onPress={stopScriptureSession}>
                    <Ionicons name="stop-circle" size={18} color="#ef4444" />
                    <Text style={styles.stopButtonText}>Stop</Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* Post-Session Summary */}
              {scriptureSessionComplete && (
                <View style={styles.scripturePostSession}>
                  <Ionicons name="checkmark-circle" size={48} color={Colors.accent} />
                  <Text style={styles.scripturePostTitle}>Session Complete</Text>
                  <Text style={styles.scripturePostVerse}>"{selectedVerse.reference}"</Text>

                  <View style={styles.scripturePostStats}>
                    <View style={styles.scripturePostStatItem}>
                      <Text style={styles.scripturePostStatLabel}>HRV Change</Text>
                      <Text style={[styles.scripturePostStatValue, { color: Colors.accent }]}>
                        +{(scriptureRmssd - scriptureStartRmssd).toFixed(1)} ms
                      </Text>
                    </View>
                    <View style={styles.scripturePostStatItem}>
                      <Text style={styles.scripturePostStatLabel}>Duration</Text>
                      <Text style={styles.scripturePostStatValue}>{formatTime(scriptureElapsed)}</Text>
                    </View>
                  </View>

                  <Text style={styles.scripturePostInsight}>
                    This verse produced a +{(scriptureRmssd - scriptureStartRmssd).toFixed(1)}ms shift in your HRV.
                  </Text>

                  <TouchableOpacity style={styles.scriptureStartButton} onPress={resetScriptureMeditation}>
                    <Text style={styles.startButtonText}>Done</Text>
                  </TouchableOpacity>
                </View>
              )}
            </GlassCard>
          </ScrollView>
        </View>
      )}
    </SafeAreaView>
  );
}

const sessionStyles = StyleSheet.create({
  breathCircleContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 140,
    marginVertical: Spacing.md,
  },
  breathCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: 'hidden',
  },
  breathCircleGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 60,
  },
  breathPhaseText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: FontSize.lg,
    color: Colors.accent,
    textTransform: 'capitalize',
  },
  bilateralContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 100,
    marginVertical: Spacing.md,
    gap: Spacing.xl,
  },
  bilateralSide: {
    alignItems: 'center',
    gap: Spacing.sm,
    opacity: 0.3,
  },
  bilateralActive: {
    opacity: 1,
  },
  bilateralDot: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(108,92,231,0.2)',
    borderWidth: 2,
    borderColor: 'rgba(108,92,231,0.3)',
  },
  bilateralDotActive: {
    backgroundColor: 'rgba(108,92,231,0.6)',
    borderColor: '#6C5CE7',
  },
  bilateralDivider: {
    width: 1,
    height: 60,
    backgroundColor: Colors.surfaceBorder,
  },
  bilateralLabel: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: FontSize.sm,
    color: Colors.textMuted,
  },
  waveContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 80,
    marginVertical: Spacing.md,
    gap: 6,
  },
  waveBar: {
    width: 8,
    borderRadius: 4,
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: Spacing.md,
    paddingTop: Spacing.md,
  },
  header: {
    marginBottom: Spacing.lg,
    paddingHorizontal: Spacing.xs,
  },
  pageTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: FontSize.xxl,
    color: Colors.text,
  },
  pageSubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    marginTop: 4,
  },
  sectionTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: FontSize.md,
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  // Active Session Banner
  activeBanner: {
    marginBottom: Spacing.md,
  },
  activeBannerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  activePulse: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.accent,
  },
  activeBannerTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: FontSize.md,
    color: Colors.text,
    flex: 1,
  },
  activeBannerStats: {
    flexDirection: 'row',
    gap: Spacing.xl,
    marginBottom: Spacing.md,
  },
  activeStat: {
    gap: 2,
  },
  activeStatLabel: {
    fontFamily: 'Inter_400Regular',
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },
  activeStatValue: {
    fontFamily: 'Inter_700Bold',
    fontSize: FontSize.lg,
    color: Colors.text,
  },
  stopButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    paddingVertical: Spacing.sm + 2,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  stopButtonText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: FontSize.sm,
    color: '#ef4444',
  },
  // Quick Start Grid
  quickStartGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  sessionTypeCard: {
    width: (SCREEN_WIDTH - Spacing.md * 2 - Spacing.sm) / 2,
  },
  sessionTypeGradient: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    minHeight: 140,
    justifyContent: 'flex-start',
    gap: Spacing.sm,
  },
  sessionTypeTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: FontSize.sm,
    color: Colors.text,
  },
  sessionTypeSubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    lineHeight: 16,
  },
  // Combo Section
  comboSection: {
    marginBottom: Spacing.lg,
  },
  comboHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  comboCard: {
    marginBottom: Spacing.sm,
  },
  comboTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  comboInfo: {
    flex: 1,
  },
  comboName: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: FontSize.md,
    color: Colors.text,
  },
  comboDuration: {
    fontFamily: 'Inter_400Regular',
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    marginTop: 2,
  },
  comboIconsRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: Spacing.sm,
  },
  comboIconPill: {
    backgroundColor: Colors.surfaceLight,
    borderRadius: BorderRadius.full,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  comboStepsRow: {
    marginBottom: Spacing.sm,
  },
  comboStep: {
    fontFamily: 'Inter_400Regular',
    fontSize: FontSize.xs,
    color: Colors.textDim,
    lineHeight: 18,
  },
  comboCommunity: {
    fontFamily: 'Inter_500Medium',
    fontSize: FontSize.xs,
    color: Colors.accent,
  },
  // Training History
  historySection: {
    marginBottom: Spacing.md,
  },
  historyGrid: {
    gap: Spacing.md,
  },
  historyItem: {
    gap: 2,
  },
  historyLabel: {
    fontFamily: 'Inter_400Regular',
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },
  historyValue: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: FontSize.md,
    color: Colors.text,
  },
  historyMeta: {
    fontFamily: 'Inter_400Regular',
    fontSize: FontSize.xs,
    color: Colors.accent,
  },
  streakRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  streakValue: {
    fontFamily: 'Inter_700Bold',
    fontSize: FontSize.xl,
    color: '#f59e0b',
  },
  // Mode Selection Overlay
  modeOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    padding: Spacing.lg,
  },
  modeCard: {
    maxHeight: '80%',
  },
  modeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  modeTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: FontSize.lg,
    color: Colors.text,
    flex: 1,
  },
  modeClose: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modeSubtitle: {
    fontFamily: 'Inter_500Medium',
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    marginBottom: Spacing.sm,
  },
  modeOption: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    marginBottom: Spacing.sm,
  },
  modeOptionLabel: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: FontSize.sm,
    color: Colors.text,
  },
  modeOptionDesc: {
    fontFamily: 'Inter_400Regular',
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    marginTop: 2,
  },
  modeHowItWorks: {
    fontFamily: 'Inter_400Regular',
    fontSize: FontSize.xs,
    color: Colors.textDim,
    marginTop: 6,
    lineHeight: 16,
    fontStyle: 'italic',
  },
  durationLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    marginTop: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  durationRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  durationPill: {
    flex: 1,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    alignItems: 'center',
  },
  durationPillText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: FontSize.sm,
    color: Colors.textMuted,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.xl,
  },
  startButtonText: {
    fontFamily: 'Inter_700Bold',
    fontSize: FontSize.md,
    color: Colors.white,
  },
  // Scripture Meditation Featured Card
  scriptureFeaturedWrapper: {
    marginBottom: Spacing.lg,
  },
  scriptureFeaturedGradient: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(212,165,116,0.3)',
    padding: Spacing.md,
  },
  scriptureFeaturedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  scriptureFeaturedInfo: {
    flex: 1,
  },
  scriptureFeaturedTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: FontSize.md,
    color: Colors.text,
  },
  scriptureFeaturedSubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    marginTop: 2,
  },
  scriptureFeaturedPreview: {
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(212,165,116,0.15)',
  },
  scriptureFeaturedVerse: {
    fontFamily: 'Inter_400Regular',
    fontSize: FontSize.xs,
    color: '#d4a574',
    fontStyle: 'italic',
  },
  // Scripture Meditation Overlay
  scriptureOverlayScroll: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: Spacing.lg,
  },
  scriptureModal: {
    maxHeight: undefined,
  },
  scriptureCategoryScroll: {
    marginBottom: Spacing.md,
    marginHorizontal: -Spacing.md,
  },
  scriptureCategoryRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
  scriptureCategoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  scriptureCategoryPillActive: {
    borderColor: '#d4a574',
    backgroundColor: 'rgba(212,165,116,0.12)',
  },
  scriptureCategoryText: {
    fontFamily: 'Inter_500Medium',
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },
  scriptureCategoryTextActive: {
    color: '#d4a574',
  },
  verseListScroll: {
    maxHeight: 140,
    marginBottom: Spacing.md,
  },
  verseListItem: {
    padding: Spacing.sm + 2,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    marginBottom: Spacing.xs,
  },
  verseListItemActive: {
    borderColor: '#d4a574',
    backgroundColor: 'rgba(212,165,116,0.08)',
  },
  verseListRefRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  verseListRef: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: FontSize.xs,
    color: '#d4a574',
  },
  verseListText: {
    fontFamily: 'Inter_400Regular',
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    lineHeight: 16,
  },
  selectedVerseContainer: {
    backgroundColor: 'rgba(212,165,116,0.06)',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderLeftWidth: 3,
    borderLeftColor: '#d4a574',
    marginBottom: Spacing.md,
  },
  selectedVerseText: {
    fontFamily: 'Inter_400Regular',
    fontSize: FontSize.md,
    color: Colors.text,
    fontStyle: 'italic',
    lineHeight: 22,
    marginBottom: Spacing.sm,
  },
  selectedVerseRef: {
    fontFamily: 'Inter_500Medium',
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },
  // Custom Device Styles
  customInputContainer: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    marginBottom: Spacing.sm,
  },
  customInput: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
    fontFamily: 'Inter_400Regular',
    fontSize: FontSize.sm,
    color: Colors.text,
    textAlignVertical: 'top',
  },
  customCategoryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
    marginBottom: Spacing.md,
  },
  customCategoryPill: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  customCategoryPillActive: {
    borderColor: '#8e8e93',
    backgroundColor: 'rgba(142,142,147,0.15)',
  },
  customCategoryText: {
    fontFamily: 'Inter_500Medium',
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },
  customCategoryTextActive: {
    color: Colors.text,
  },
  customDeviceTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: FontSize.lg,
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 4,
  },
  customDeviceCategory: {
    fontFamily: 'Inter_500Medium',
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  customRmssdContainer: {
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  customRmssdValue: {
    fontFamily: 'Inter_700Bold',
    fontSize: 48,
    color: Colors.text,
    letterSpacing: -2,
  },
  customRmssdUnit: {
    fontFamily: 'Inter_400Regular',
    fontSize: FontSize.sm,
    color: Colors.textMuted,
  },
  customTimerText: {
    fontFamily: 'Inter_500Medium',
    fontSize: FontSize.md,
    color: Colors.textMuted,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  customMarkEventButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    alignSelf: 'center',
    backgroundColor: 'rgba(14,168,122,0.12)',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(14,168,122,0.3)',
    marginTop: Spacing.sm,
  },
  customMarkEventText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: FontSize.xs,
    color: Colors.accent,
  },
  customEventsContainer: {
    marginTop: Spacing.sm,
    width: '100%',
  },
  customEventItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: 4,
  },
  customEventDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.accent,
  },
  customEventText: {
    fontFamily: 'Inter_400Regular',
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },
  scriptureStartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.xl,
    backgroundColor: '#d4a574',
  },
  // Active Scripture Session
  scriptureActiveSession: {
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  scriptureActiveVerse: {
    fontFamily: 'Inter_400Regular',
    fontSize: FontSize.lg,
    color: Colors.text,
    fontStyle: 'italic',
    lineHeight: 26,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  scriptureActiveRef: {
    fontFamily: 'Inter_500Medium',
    fontSize: FontSize.sm,
    color: '#d4a574',
    marginBottom: Spacing.lg,
  },
  scriptureBreathContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 130,
    marginBottom: Spacing.md,
  },
  scriptureBreathCircle: {
    width: 110,
    height: 110,
    borderRadius: 55,
    overflow: 'hidden',
  },
  scriptureBreathGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 55,
  },
  scriptureBreathText: {
    fontFamily: 'Inter_500Medium',
    fontSize: FontSize.sm,
    color: '#d4a574',
  },
  scriptureActiveStats: {
    flexDirection: 'row',
    gap: Spacing.xl,
    marginBottom: Spacing.lg,
  },
  // Post Session
  scripturePostSession: {
    alignItems: 'center',
    paddingVertical: Spacing.lg,
  },
  scripturePostTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: FontSize.xl,
    color: Colors.text,
    marginTop: Spacing.md,
    marginBottom: Spacing.xs,
  },
  scripturePostVerse: {
    fontFamily: 'Inter_500Medium',
    fontSize: FontSize.sm,
    color: '#d4a574',
    marginBottom: Spacing.lg,
  },
  scripturePostStats: {
    flexDirection: 'row',
    gap: Spacing.xl,
    marginBottom: Spacing.lg,
  },
  scripturePostStatItem: {
    alignItems: 'center',
    gap: 4,
  },
  scripturePostStatLabel: {
    fontFamily: 'Inter_400Regular',
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },
  scripturePostStatValue: {
    fontFamily: 'Inter_700Bold',
    fontSize: FontSize.xl,
    color: Colors.text,
  },
  scripturePostInsight: {
    fontFamily: 'Inter_400Regular',
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: Spacing.lg,
  },
  // HRV Exercise Styles
  exerciseModeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  exerciseTrend: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: FontSize.sm,
    marginTop: 4,
  },
  exerciseHrTarget: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: 'rgba(0,214,143,0.1)',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(0,214,143,0.25)',
    marginTop: Spacing.sm,
  },
  exerciseHrTargetText: {
    fontFamily: 'Inter_500Medium',
    fontSize: FontSize.xs,
    color: '#00d68f',
  },
  exercisePostModeName: {
    fontFamily: 'Inter_500Medium',
    fontSize: FontSize.sm,
    color: '#00d68f',
    marginBottom: Spacing.lg,
  },
});
