import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Colors, FontSize, Spacing, BorderRadius } from '../constants/theme';
import { mockCurrentHRV } from '../constants/mockData';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const goals = [
  { key: 'calm', label: 'Calm', icon: 'leaf-outline' as const, freq: '4 Hz Alpha' },
  { key: 'focus', label: 'Focus', icon: 'flash-outline' as const, freq: '14 Hz Beta' },
  { key: 'sleep', label: 'Sleep Prep', icon: 'moon-outline' as const, freq: '2 Hz Delta' },
  { key: 'recovery', label: 'Recovery', icon: 'fitness-outline' as const, freq: '8 Hz Alpha' },
];

const durations = [5, 10, 15, 20, 30];

type SessionPhase = 'setup' | 'active' | 'complete';

function WaveformAnimation({ isPlaying }: { isPlaying: boolean }) {
  const bars = useRef(
    Array.from({ length: 20 }, () => new Animated.Value(0.3))
  ).current;

  useEffect(() => {
    if (isPlaying) {
      bars.forEach((bar, i) => {
        const animate = () => {
          Animated.sequence([
            Animated.timing(bar, {
              toValue: 0.3 + Math.random() * 0.7,
              duration: 300 + Math.random() * 400,
              useNativeDriver: true,
            }),
            Animated.timing(bar, {
              toValue: 0.3,
              duration: 300 + Math.random() * 400,
              useNativeDriver: true,
            }),
          ]).start(animate);
        };
        setTimeout(animate, i * 50);
      });
    }
  }, [isPlaying]);

  return (
    <View style={styles.waveform}>
      {bars.map((bar, i) => (
        <Animated.View
          key={i}
          style={[
            styles.waveBar,
            {
              transform: [{ scaleY: bar }],
              backgroundColor: i % 2 === 0 ? Colors.accent : 'rgba(14, 168, 122, 0.5)',
            },
          ]}
        />
      ))}
    </View>
  );
}

export default function SessionScreen() {
  const [phase, setPhase] = useState<SessionPhase>('setup');
  const [selectedGoal, setSelectedGoal] = useState('calm');
  const [selectedDuration, setSelectedDuration] = useState(10);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [sessionPhaseLabel, setSessionPhaseLabel] = useState('Meet');

  const preRmssd = mockCurrentHRV.rmssd;
  const postRmssd = preRmssd + 8.4 + Math.random() * 6;
  const changePercent = ((postRmssd - preRmssd) / preRmssd * 100).toFixed(1);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startSession = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setPhase('active');
    setTimeRemaining(selectedDuration * 60);
    setIsPlaying(true);

    intervalRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current!);
          setIsPlaying(false);
          setPhase('complete');
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          return 0;
        }

        const elapsed = selectedDuration * 60 - prev;
        const totalSeconds = selectedDuration * 60;
        if (elapsed < totalSeconds * 0.2) setSessionPhaseLabel('Meet');
        else if (elapsed < totalSeconds * 0.5) setSessionPhaseLabel('Descend');
        else if (elapsed < totalSeconds * 0.8) setSessionPhaseLabel('Hold');
        else setSessionPhaseLabel('Return');

        return prev - 1;
      });
    }, 1000);
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const currentGoal = goals.find((g) => g.key === selectedGoal)!;

  if (phase === 'complete') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.completeContainer}>
          <TouchableOpacity style={styles.closeBtn} onPress={() => router.back()}>
            <Ionicons name="close" size={24} color={Colors.textMuted} />
          </TouchableOpacity>

          <Ionicons name="checkmark-circle" size={72} color={Colors.accent} />
          <Text style={styles.completeTitle}>Session Complete</Text>

          <View style={styles.comparisonRow}>
            <View style={styles.comparisonItem}>
              <Text style={styles.comparisonLabel}>Before</Text>
              <Text style={styles.comparisonValue}>{preRmssd.toFixed(1)}</Text>
              <Text style={styles.comparisonUnit}>ms RMSSD</Text>
            </View>
            <Ionicons name="arrow-forward" size={24} color={Colors.accent} />
            <View style={styles.comparisonItem}>
              <Text style={styles.comparisonLabel}>After</Text>
              <Text style={[styles.comparisonValue, { color: Colors.accent }]}>
                {postRmssd.toFixed(1)}
              </Text>
              <Text style={styles.comparisonUnit}>ms RMSSD</Text>
            </View>
          </View>

          <View style={styles.changeBadge}>
            <Ionicons name="trending-up" size={18} color={Colors.accent} />
            <Text style={styles.changeText}>+{changePercent}% improvement</Text>
          </View>

          <TouchableOpacity style={styles.logSessionButton} onPress={() => router.back()}>
            <Text style={styles.logSessionText}>Log as Intervention</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.dismissButton} onPress={() => router.back()}>
            <Text style={styles.dismissText}>Done</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (phase === 'active') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.activeContainer}>
          <TouchableOpacity
            style={styles.closeBtn}
            onPress={() => {
              if (intervalRef.current) clearInterval(intervalRef.current);
              setIsPlaying(false);
              router.back();
            }}
          >
            <Ionicons name="close" size={24} color={Colors.textMuted} />
          </TouchableOpacity>

          <Text style={styles.activeGoal}>{currentGoal.label}</Text>
          <Text style={styles.activeFreq}>{currentGoal.freq}</Text>

          {/* Live RMSSD */}
          <Text style={styles.liveRmssd}>{mockCurrentHRV.rmssd}</Text>
          <Text style={styles.liveRmssdUnit}>ms RMSSD</Text>

          {/* Waveform */}
          <WaveformAnimation isPlaying={isPlaying} />

          {/* Phase */}
          <View style={styles.phaseContainer}>
            <View style={styles.phaseDot} />
            <Text style={styles.phaseText}>{sessionPhaseLabel}</Text>
          </View>

          {/* Timer */}
          <Text style={styles.timer}>{formatTime(timeRemaining)}</Text>

          {/* Pause button */}
          <TouchableOpacity
            style={styles.pauseButton}
            onPress={() => {
              if (isPlaying) {
                if (intervalRef.current) clearInterval(intervalRef.current);
              } else {
                startSession();
              }
              setIsPlaying(!isPlaying);
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
          >
            <Ionicons
              name={isPlaying ? 'pause' : 'play'}
              size={32}
              color={Colors.white}
            />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Setup phase
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.setupContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>Binaural Beat Session</Text>
          <TouchableOpacity style={styles.closeBtn} onPress={() => router.back()}>
            <Ionicons name="close" size={24} color={Colors.textMuted} />
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>Goal</Text>
        <View style={styles.goalGrid}>
          {goals.map((goal) => (
            <TouchableOpacity
              key={goal.key}
              style={[
                styles.goalCard,
                selectedGoal === goal.key && styles.goalCardSelected,
              ]}
              onPress={() => {
                setSelectedGoal(goal.key);
                Haptics.selectionAsync();
              }}
            >
              <Ionicons
                name={goal.icon}
                size={28}
                color={selectedGoal === goal.key ? Colors.accent : Colors.textMuted}
              />
              <Text
                style={[
                  styles.goalLabel,
                  selectedGoal === goal.key && styles.goalLabelSelected,
                ]}
              >
                {goal.label}
              </Text>
              <Text style={styles.goalFreq}>{goal.freq}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Duration</Text>
        <View style={styles.durationRow}>
          {durations.map((d) => (
            <TouchableOpacity
              key={d}
              style={[
                styles.durationChip,
                selectedDuration === d && styles.durationChipSelected,
              ]}
              onPress={() => {
                setSelectedDuration(d);
                Haptics.selectionAsync();
              }}
            >
              <Text
                style={[
                  styles.durationText,
                  selectedDuration === d && styles.durationTextSelected,
                ]}
              >
                {d} min
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.hrvContext}>
          <Ionicons name="pulse" size={16} color={Colors.accent} />
          <Text style={styles.hrvContextText}>
            Starting RMSSD: <Text style={styles.hrvContextValue}>{mockCurrentHRV.rmssd}ms</Text>
          </Text>
        </View>

        <TouchableOpacity style={styles.startButton} onPress={startSession} activeOpacity={0.8}>
          <LinearGradient
            colors={[Colors.accent, Colors.accentDark]}
            style={styles.startGradient}
          >
            <Ionicons name="play" size={24} color={Colors.white} />
            <Text style={styles.startText}>Begin Session</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  setupContainer: {
    flex: 1,
    padding: Spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  title: {
    fontFamily: 'Inter_700Bold',
    fontSize: FontSize.xxl,
    color: Colors.text,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: Spacing.md,
  },
  goalGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  goalCard: {
    width: (SCREEN_WIDTH - Spacing.lg * 2 - Spacing.sm) / 2,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    padding: Spacing.md,
    alignItems: 'center',
    gap: Spacing.xs,
  },
  goalCardSelected: {
    borderColor: Colors.accent,
    backgroundColor: Colors.accentLight,
  },
  goalLabel: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: FontSize.md,
    color: Colors.textMuted,
  },
  goalLabelSelected: {
    color: Colors.accent,
  },
  goalFreq: {
    fontFamily: 'Inter_400Regular',
    fontSize: FontSize.xs,
    color: Colors.textDim,
  },
  durationRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  durationChip: {
    flex: 1,
    paddingVertical: Spacing.sm + 2,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    alignItems: 'center',
  },
  durationChipSelected: {
    borderColor: Colors.accent,
    backgroundColor: Colors.accentLight,
  },
  durationText: {
    fontFamily: 'Inter_500Medium',
    fontSize: FontSize.sm,
    color: Colors.textMuted,
  },
  durationTextSelected: {
    color: Colors.accent,
  },
  hrvContext: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.accentLight,
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.xl,
  },
  hrvContextText: {
    fontFamily: 'Inter_400Regular',
    fontSize: FontSize.sm,
    color: Colors.textMuted,
  },
  hrvContextValue: {
    fontFamily: 'Inter_600SemiBold',
    color: Colors.text,
  },
  startButton: {
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  startGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md + 2,
    gap: Spacing.sm,
  },
  startText: {
    fontFamily: 'Inter_700Bold',
    fontSize: FontSize.lg,
    color: Colors.white,
  },
  // Active session
  activeContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.lg,
  },
  activeGoal: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: FontSize.xl,
    color: Colors.text,
    marginTop: Spacing.xl,
  },
  activeFreq: {
    fontFamily: 'Inter_400Regular',
    fontSize: FontSize.sm,
    color: Colors.accent,
    marginTop: 2,
    marginBottom: Spacing.xxl,
  },
  liveRmssd: {
    fontFamily: 'Inter_700Bold',
    fontSize: 72,
    color: Colors.text,
    letterSpacing: -2,
  },
  liveRmssdUnit: {
    fontFamily: 'Inter_500Medium',
    fontSize: FontSize.md,
    color: Colors.textMuted,
    marginBottom: Spacing.xl,
  },
  waveform: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 60,
    gap: 3,
    marginBottom: Spacing.xl,
  },
  waveBar: {
    width: 4,
    height: 60,
    borderRadius: 2,
  },
  phaseContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  phaseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.accent,
  },
  phaseText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: FontSize.md,
    color: Colors.accent,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  timer: {
    fontFamily: 'Inter_700Bold',
    fontSize: 48,
    color: Colors.text,
    letterSpacing: -1,
    marginBottom: Spacing.xl,
  },
  pauseButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Complete
  completeContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  completeTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: FontSize.xxl,
    color: Colors.text,
    marginTop: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  comparisonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  comparisonItem: {
    alignItems: 'center',
  },
  comparisonLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  comparisonValue: {
    fontFamily: 'Inter_700Bold',
    fontSize: 36,
    color: Colors.text,
  },
  comparisonUnit: {
    fontFamily: 'Inter_400Regular',
    fontSize: FontSize.xs,
    color: Colors.textDim,
  },
  changeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.accentLight,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm + 2,
    borderRadius: BorderRadius.full,
    marginBottom: Spacing.xxl,
  },
  changeText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: FontSize.md,
    color: Colors.accent,
  },
  logSessionButton: {
    backgroundColor: Colors.accent,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xxl,
    borderRadius: BorderRadius.xl,
    marginBottom: Spacing.md,
    width: '100%',
    alignItems: 'center',
  },
  logSessionText: {
    fontFamily: 'Inter_700Bold',
    fontSize: FontSize.md,
    color: Colors.background,
  },
  dismissButton: {
    paddingVertical: Spacing.md,
  },
  dismissText: {
    fontFamily: 'Inter_500Medium',
    fontSize: FontSize.md,
    color: Colors.textMuted,
  },
});
