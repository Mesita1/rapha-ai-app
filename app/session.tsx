import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Animated,
  Dimensions,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import GlassCard from '../components/GlassCard';
import { Colors, FontSize, Spacing, BorderRadius } from '../constants/theme';
import { mockCurrentHRV } from '../constants/mockData';

let Haptics: any = null;
try { Haptics = require('expo-haptics'); } catch {}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const goals = [
  { key: 'calm', label: 'Calm', icon: 'leaf-outline' as const, freq: '10 Hz Alpha → 7-8 Hz Theta', desc: 'Parasympathetic activation' },
  { key: 'focus', label: 'Focus', icon: 'flash-outline' as const, freq: '14-18 Hz Beta', desc: 'Low beta concentration' },
  { key: 'sleep', label: 'Sleep Prep', icon: 'moon-outline' as const, freq: '10 Hz → 4 Hz Delta', desc: 'Theta/delta transition' },
  { key: 'recovery', label: 'Recovery', icon: 'fitness-outline' as const, freq: '7-10 Hz Alpha/Theta', desc: 'Vagal tone boost' },
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
              backgroundColor: i % 2 === 0 ? Colors.purple : 'rgba(108, 92, 231, 0.4)',
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
  const [activeTab, setActiveTab] = useState<'builtin' | 'music'>('builtin');

  const preRmssd = mockCurrentHRV.rmssd;
  const postRmssd = preRmssd + 8.4 + Math.random() * 6;
  const changePercent = ((postRmssd - preRmssd) / preRmssd * 100).toFixed(1);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startSession = () => {
    try { Haptics?.impactAsync(Haptics.ImpactFeedbackStyle.Medium); } catch {}
    setPhase('active');
    setTimeRemaining(selectedDuration * 60);
    setIsPlaying(true);

    intervalRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current!);
          setIsPlaying(false);
          setPhase('complete');
          try { Haptics?.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch {}
          return 0;
        }
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
            <Text style={styles.logSessionText}>Done</Text>
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

          <Text style={styles.liveRmssd}>{mockCurrentHRV.rmssd}</Text>
          <Text style={styles.liveRmssdUnit}>ms RMSSD</Text>

          <WaveformAnimation isPlaying={isPlaying} />

          <Text style={styles.timer}>{formatTime(timeRemaining)}</Text>

          <TouchableOpacity
            style={styles.pauseButton}
            onPress={() => {
              if (isPlaying) {
                if (intervalRef.current) clearInterval(intervalRef.current);
              } else {
                startSession();
              }
              setIsPlaying(!isPlaying);
              try { Haptics?.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch {}
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

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.setupContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Audio Sessions</Text>
          <TouchableOpacity style={styles.closeBtn} onPress={() => router.back()}>
            <Ionicons name="close" size={24} color={Colors.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Tab: Built-in / Your Music */}
        <View style={styles.tabRow}>
          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'builtin' && styles.tabBtnActive]}
            onPress={() => setActiveTab('builtin')}
          >
            <Text style={[styles.tabText, activeTab === 'builtin' && styles.tabTextActive]}>Binaural Beats</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'music' && styles.tabBtnActive]}
            onPress={() => setActiveTab('music')}
          >
            <Text style={[styles.tabText, activeTab === 'music' && styles.tabTextActive]}>Your Music</Text>
            <View style={styles.proBadge}>
              <Text style={styles.proBadgeText}>Pro</Text>
            </View>
          </TouchableOpacity>
        </View>

        {activeTab === 'builtin' ? (
          <>
            <Text style={styles.label}>Select Goal</Text>
            <View style={styles.goalGrid}>
              {goals.map((goal) => (
                <TouchableOpacity
                  key={goal.key}
                  style={[styles.goalCard, selectedGoal === goal.key && styles.goalCardSelected]}
                  onPress={() => {
                    setSelectedGoal(goal.key);
                    try { Haptics?.selectionAsync(); } catch {}
                  }}
                >
                  <Ionicons
                    name={goal.icon}
                    size={28}
                    color={selectedGoal === goal.key ? Colors.purple : Colors.textMuted}
                  />
                  <Text style={[styles.goalLabel, selectedGoal === goal.key && styles.goalLabelSelected]}>
                    {goal.label}
                  </Text>
                  <Text style={styles.goalDesc}>{goal.desc}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Duration</Text>
            <View style={styles.durationRow}>
              {durations.map((d) => (
                <TouchableOpacity
                  key={d}
                  style={[styles.durationChip, selectedDuration === d && styles.durationChipSelected]}
                  onPress={() => {
                    setSelectedDuration(d);
                    try { Haptics?.selectionAsync(); } catch {}
                  }}
                >
                  <Text style={[styles.durationText, selectedDuration === d && styles.durationTextSelected]}>
                    {d} min
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity style={styles.startButton} onPress={startSession} activeOpacity={0.8}>
              <Ionicons name="play" size={22} color={Colors.white} />
              <Text style={styles.startText}>Begin Session</Text>
            </TouchableOpacity>
          </>
        ) : (
          <GlassCard style={styles.musicPlaceholder}>
            <Ionicons name="lock-closed-outline" size={36} color={Colors.purple} />
            <Text style={styles.musicTitle}>Pro Feature</Text>
            <Text style={styles.musicDesc}>
              Play your own music from YouTube, device library, or Spotify while tracking HRV response in real-time.
            </Text>
            <TouchableOpacity style={styles.upgradeBtn} onPress={() => router.push('/upgrade' as any)}>
              <Text style={styles.upgradeBtnText}>Upgrade to Pro</Text>
            </TouchableOpacity>
          </GlassCard>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  setupContent: {
    padding: Spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
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
  tabRow: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.full,
    padding: 3,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  tabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sm + 2,
    borderRadius: BorderRadius.full,
    gap: 6,
  },
  tabBtnActive: {
    backgroundColor: Colors.purple,
  },
  tabText: {
    fontFamily: 'Inter_500Medium',
    fontSize: FontSize.sm,
    color: Colors.textMuted,
  },
  tabTextActive: {
    color: Colors.white,
  },
  proBadge: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: BorderRadius.full,
  },
  proBadgeText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 9,
    color: Colors.white,
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
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    padding: Spacing.md,
    alignItems: 'center',
    gap: 4,
  },
  goalCardSelected: {
    borderColor: Colors.purple,
    backgroundColor: Colors.purpleLight,
  },
  goalLabel: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: FontSize.md,
    color: Colors.textMuted,
  },
  goalLabelSelected: {
    color: Colors.purple,
  },
  goalDesc: {
    fontFamily: 'Inter_400Regular',
    fontSize: FontSize.xs - 1,
    color: Colors.textDim,
    textAlign: 'center',
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
    borderColor: Colors.purple,
    backgroundColor: Colors.purpleLight,
  },
  durationText: {
    fontFamily: 'Inter_500Medium',
    fontSize: FontSize.sm,
    color: Colors.textMuted,
  },
  durationTextSelected: {
    color: Colors.purple,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.purple,
    paddingVertical: Spacing.md + 2,
    borderRadius: BorderRadius.lg,
    gap: Spacing.sm,
  },
  startText: {
    fontFamily: 'Inter_700Bold',
    fontSize: FontSize.lg,
    color: Colors.white,
  },
  musicPlaceholder: {
    alignItems: 'center',
    paddingVertical: Spacing.xxl,
    gap: Spacing.md,
  },
  musicTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: FontSize.lg,
    color: Colors.text,
  },
  musicDesc: {
    fontFamily: 'Inter_400Regular',
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: Spacing.md,
  },
  upgradeBtn: {
    backgroundColor: Colors.purple,
    paddingVertical: Spacing.sm + 4,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.lg,
    marginTop: Spacing.sm,
  },
  upgradeBtnText: {
    fontFamily: 'Inter_700Bold',
    fontSize: FontSize.md,
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
    color: Colors.purple,
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
    backgroundColor: Colors.purple,
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
    backgroundColor: Colors.purple,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xxl,
    borderRadius: BorderRadius.lg,
    width: '100%',
    alignItems: 'center',
  },
  logSessionText: {
    fontFamily: 'Inter_700Bold',
    fontSize: FontSize.md,
    color: Colors.white,
  },
});
