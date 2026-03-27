import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Animated,
  Dimensions,
  ScrollView,
  TextInput,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Circle } from 'react-native-svg';
import GlassCard from '../components/GlassCard';
import { Colors, FontSize, Spacing, BorderRadius } from '../constants/theme';
import { mockCurrentHRV } from '../constants/mockData';

let Haptics: any = null;
try { Haptics = require('expo-haptics'); } catch {}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type SessionPhase = 'selection' | 'active' | 'summary';

const modes = [
  {
    key: 'calm',
    label: 'Calm',
    icon: 'leaf-outline' as const,
    desc: 'Parasympathetic activation. Alpha \u2192 Theta. Best for stress relief.',
    gradient: ['#6C5CE7', '#3B82F6'] as [string, string],
    targetZone: 'Theta (4-8 Hz)',
    startFreq: 10,
    endFreq: 6,
  },
  {
    key: 'focus',
    label: 'Focus',
    icon: 'flash-outline' as const,
    desc: 'Beta wave entrainment. 14-18Hz. Sharpen concentration.',
    gradient: ['#f59e0b', '#ef4444'] as [string, string],
    targetZone: 'Beta (14-18 Hz)',
    startFreq: 12,
    endFreq: 16,
  },
  {
    key: 'sleep',
    label: 'Sleep Prep',
    icon: 'moon-outline' as const,
    desc: 'Alpha \u2192 Delta transition. Wind down for deep sleep.',
    gradient: ['#1e3a5f', '#3B82F6'] as [string, string],
    targetZone: 'Delta (1-4 Hz)',
    startFreq: 10,
    endFreq: 3,
  },
  {
    key: 'recovery',
    label: 'Recovery',
    icon: 'heart-outline' as const,
    desc: 'Vagal tone boost. RSA entrainment at 0.1Hz.',
    gradient: ['#0ea87a', '#00d68f'] as [string, string],
    targetZone: 'RSA (0.1 Hz)',
    startFreq: 8,
    endFreq: 7,
  },
];

const durations = [5, 10, 15, 20, 30];

function SineWaveViz({ progress }: { progress: number }) {
  const w = SCREEN_WIDTH - 64;
  const h = 100;
  const waves = [
    { amp: 30, freq: 2, phase: 0, opacity: 0.8, color: Colors.accent },
    { amp: 20, freq: 3, phase: 1.5, opacity: 0.4, color: Colors.purple },
    { amp: 15, freq: 4, phase: 3, opacity: 0.25, color: '#3B82F6' },
    { amp: 25, freq: 1.5, phase: progress * Math.PI * 2, opacity: 0.5, color: Colors.accent },
  ];

  return (
    <Svg width={w} height={h} style={{ marginVertical: Spacing.md }}>
      {waves.map((wave, wi) => {
        let d = `M 0 ${h / 2}`;
        for (let x = 0; x <= w; x += 2) {
          const y = h / 2 + wave.amp * Math.sin((x / w) * Math.PI * 2 * wave.freq + wave.phase + progress * 6);
          d += ` L ${x} ${y}`;
        }
        return (
          <Path key={wi} d={d} fill="none" stroke={wave.color} strokeWidth={2} opacity={wave.opacity} />
        );
      })}
    </Svg>
  );
}

function HrvSparkline({ data }: { data: number[] }) {
  const w = SCREEN_WIDTH - 120;
  const h = 40;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  let d = '';
  data.forEach((val, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((val - min) / range) * h;
    d += i === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`;
  });

  return (
    <Svg width={w} height={h}>
      <Path d={d} fill="none" stroke={Colors.accent} strokeWidth={1.5} />
      {data.length > 0 && (
        <Circle
          cx={w}
          cy={h - ((data[data.length - 1] - min) / range) * h}
          r={3}
          fill={Colors.accent}
        />
      )}
    </Svg>
  );
}

export default function SessionScreen() {
  const [phase, setPhase] = useState<SessionPhase>('selection');
  const [selectedMode, setSelectedMode] = useState('calm');
  const [selectedDuration, setSelectedDuration] = useState(10);
  const [elapsed, setElapsed] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [feeling, setFeeling] = useState<string | null>(null);

  // Simulated HRV values during session
  const [currentRmssd, setCurrentRmssd] = useState(mockCurrentHRV.rmssd);
  const [currentFreq, setCurrentFreq] = useState(9.2);
  const [hrvHistory, setHrvHistory] = useState<number[]>([mockCurrentHRV.rmssd]);
  const startRmssd = useRef(mockCurrentHRV.rmssd);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const waveProgress = useRef(new Animated.Value(0)).current;

  const currentMode = modes.find((m) => m.key === selectedMode)!;
  const totalSeconds = selectedDuration * 60;
  const progress = totalSeconds > 0 ? elapsed / totalSeconds : 0;

  const startSession = () => {
    try { Haptics?.impactAsync(Haptics.ImpactFeedbackStyle.Medium); } catch {}
    setPhase('active');
    setElapsed(0);
    setIsPlaying(true);
    startRmssd.current = mockCurrentHRV.rmssd;
    setCurrentRmssd(mockCurrentHRV.rmssd);
    setHrvHistory([mockCurrentHRV.rmssd]);
    setCurrentFreq(currentMode.startFreq);

    intervalRef.current = setInterval(() => {
      setElapsed((prev) => {
        const next = prev + 1;
        if (next >= totalSeconds) {
          clearInterval(intervalRef.current!);
          setIsPlaying(false);
          setPhase('summary');
          try { Haptics?.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch {}
          return totalSeconds;
        }
        return next;
      });

      // Simulate HRV fluctuations — gradual improvement
      setCurrentRmssd((prev) => {
        const drift = 0.05 + Math.random() * 0.15;
        const noise = (Math.random() - 0.45) * 1.2;
        const newVal = prev + drift + noise;
        setHrvHistory((h) => [...h.slice(-30), newVal]);
        return newVal;
      });

      // Simulate frequency approaching target
      setCurrentFreq((prev) => {
        const target = currentMode.endFreq;
        const step = (target - prev) * 0.02;
        return prev + step + (Math.random() - 0.5) * 0.3;
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

  const endRmssd = currentRmssd;
  const changePercent = ((endRmssd - startRmssd.current) / startRmssd.current * 100).toFixed(1);

  // ==================== SUMMARY VIEW ====================
  if (phase === 'summary') {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.summaryContent}>
          <TouchableOpacity style={styles.closeBtn} onPress={() => router.back()}>
            <Ionicons name="close" size={24} color={Colors.textMuted} />
          </TouchableOpacity>

          <View style={styles.summaryHeader}>
            <Ionicons name="checkmark-circle" size={64} color={Colors.accent} />
            <Text style={styles.summaryTitle}>Session Complete</Text>
          </View>

          <GlassCard style={styles.summaryStats}>
            <View style={styles.statRow}>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Starting HRV</Text>
                <Text style={styles.statValue}>{startRmssd.current.toFixed(1)}</Text>
                <Text style={styles.statUnit}>ms</Text>
              </View>
              <Ionicons name="arrow-forward" size={20} color={Colors.accent} />
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Ending HRV</Text>
                <Text style={[styles.statValue, { color: Colors.accent }]}>{endRmssd.toFixed(1)}</Text>
                <Text style={styles.statUnit}>ms</Text>
              </View>
            </View>
            <View style={styles.summaryMetaRow}>
              <View style={styles.summaryMetaItem}>
                <Text style={styles.summaryMetaLabel}>Change</Text>
                <Text style={[styles.summaryMetaValue, { color: Colors.accent }]}>+{changePercent}%</Text>
              </View>
              <View style={styles.summaryMetaItem}>
                <Text style={styles.summaryMetaLabel}>Duration</Text>
                <Text style={styles.summaryMetaValue}>{selectedDuration} min</Text>
              </View>
              <View style={styles.summaryMetaItem}>
                <Text style={styles.summaryMetaLabel}>Mode</Text>
                <Text style={styles.summaryMetaValue}>{currentMode.label}</Text>
              </View>
            </View>
          </GlassCard>

          <GlassCard style={styles.comparisonCard}>
            <Ionicons name="analytics-outline" size={18} color={Colors.purple} />
            <Text style={styles.comparisonText}>
              12% better than your average {currentMode.label} session
            </Text>
          </GlassCard>

          <GlassCard style={styles.feelingCard}>
            <Text style={styles.feelingTitle}>How are you feeling?</Text>
            <View style={styles.feelingOptions}>
              {['Much Better', 'Better', 'Same', 'Worse'].map((opt) => (
                <TouchableOpacity
                  key={opt}
                  style={[styles.feelingBtn, feeling === opt && styles.feelingBtnSelected]}
                  onPress={() => setFeeling(opt)}
                >
                  <Text style={[styles.feelingBtnText, feeling === opt && styles.feelingBtnTextSelected]}>
                    {opt}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </GlassCard>

          <TouchableOpacity style={styles.saveCloseBtn} onPress={() => router.back()}>
            <Text style={styles.saveCloseText}>Save & Close</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ==================== ACTIVE SESSION VIEW ====================
  if (phase === 'active') {
    const freqArrow = currentFreq > currentMode.endFreq ? '\u2193' : '\u2191';

    // Circular progress ring
    const ringSize = 160;
    const ringStroke = 6;
    const ringRadius = (ringSize - ringStroke) / 2;
    const ringCircumference = 2 * Math.PI * ringRadius;
    const ringOffset = ringCircumference * (1 - progress);

    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.activeContainer}>
          <TouchableOpacity
            style={styles.closeBtnActive}
            onPress={() => {
              if (intervalRef.current) clearInterval(intervalRef.current);
              setIsPlaying(false);
              router.back();
            }}
          >
            <Ionicons name="close" size={24} color={Colors.textMuted} />
          </TouchableOpacity>

          {/* State badge */}
          <View style={styles.stateBadge}>
            <View style={styles.stateDot} />
            <Text style={styles.stateText}>
              {progress < 0.3 ? 'Entraining...' : progress < 0.7 ? `Transitioning to ${currentMode.targetZone.split(' ')[0]}...` : 'Deep state achieved'}
            </Text>
          </View>

          {/* Large RMSSD display */}
          <View style={styles.rmssdContainer}>
            <Svg width={ringSize} height={ringSize} style={styles.progressRing}>
              <Circle
                cx={ringSize / 2}
                cy={ringSize / 2}
                r={ringRadius}
                stroke="rgba(255,255,255,0.06)"
                strokeWidth={ringStroke}
                fill="none"
              />
              <Circle
                cx={ringSize / 2}
                cy={ringSize / 2}
                r={ringRadius}
                stroke={Colors.accent}
                strokeWidth={ringStroke}
                fill="none"
                strokeDasharray={`${ringCircumference}`}
                strokeDashoffset={ringOffset}
                strokeLinecap="round"
                rotation="-90"
                origin={`${ringSize / 2}, ${ringSize / 2}`}
              />
            </Svg>
            <View style={styles.rmssdOverlay}>
              <Text style={styles.rmssdBig}>{currentRmssd.toFixed(1)}</Text>
              <View style={styles.rmssdLabelRow}>
                <Text style={styles.rmssdUnit}>ms</Text>
                <View style={styles.liveDot} />
              </View>
            </View>
          </View>

          {/* Target zone */}
          <View style={styles.targetRow}>
            <Text style={styles.targetLabel}>Target: {currentMode.targetZone}</Text>
            <Text style={styles.freqText}>Current: {currentFreq.toFixed(1)} Hz {freqArrow}</Text>
          </View>

          {/* Waveform */}
          <SineWaveViz progress={progress} />

          {/* Timer */}
          <Text style={styles.timerText}>
            {formatTime(elapsed)} / {formatTime(totalSeconds)}
          </Text>

          {/* HRV sparkline */}
          <View style={styles.sparklineContainer}>
            <Text style={styles.sparklineLabel}>HRV Trend</Text>
            <HrvSparkline data={hrvHistory} />
          </View>

          {/* Controls */}
          <View style={styles.controlsRow}>
            <TouchableOpacity
              style={styles.controlBtn}
              onPress={() => {
                if (isPlaying) {
                  if (intervalRef.current) clearInterval(intervalRef.current);
                } else {
                  // Resume
                  intervalRef.current = setInterval(() => {
                    setElapsed((prev) => {
                      const next = prev + 1;
                      if (next >= totalSeconds) {
                        clearInterval(intervalRef.current!);
                        setIsPlaying(false);
                        setPhase('summary');
                        return totalSeconds;
                      }
                      return next;
                    });
                    setCurrentRmssd((prev) => {
                      const drift = 0.05 + Math.random() * 0.15;
                      const noise = (Math.random() - 0.45) * 1.2;
                      const newVal = prev + drift + noise;
                      setHrvHistory((h) => [...h.slice(-30), newVal]);
                      return newVal;
                    });
                    setCurrentFreq((prev) => {
                      const target = currentMode.endFreq;
                      const step = (target - prev) * 0.02;
                      return prev + step + (Math.random() - 0.5) * 0.3;
                    });
                  }, 1000);
                }
                setIsPlaying(!isPlaying);
                try { Haptics?.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch {}
              }}
            >
              <Ionicons name={isPlaying ? 'pause' : 'play'} size={28} color={Colors.white} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.controlBtn, styles.stopBtn]}
              onPress={() => {
                if (intervalRef.current) clearInterval(intervalRef.current);
                setIsPlaying(false);
                setPhase('summary');
              }}
            >
              <Ionicons name="stop" size={28} color={Colors.white} />
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // ==================== SELECTION VIEW ====================
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.selectionContent} showsVerticalScrollIndicator={false}>
        <View style={styles.selectionHeader}>
          <View style={styles.selectionTitleRow}>
            <Ionicons name="headset-outline" size={24} color={Colors.purple} />
            <Text style={styles.selectionTitle}>Audio Sessions</Text>
          </View>
          <TouchableOpacity style={styles.closeBtn} onPress={() => router.back()}>
            <Ionicons name="close" size={24} color={Colors.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Mode Cards — 2x2 Grid */}
        <Text style={styles.sectionLabel}>SELECT MODE</Text>
        <View style={styles.modeGrid}>
          {modes.map((mode) => {
            const selected = selectedMode === mode.key;
            return (
              <TouchableOpacity
                key={mode.key}
                style={[styles.modeCard, selected && styles.modeCardSelected]}
                onPress={() => {
                  setSelectedMode(mode.key);
                  try { Haptics?.selectionAsync(); } catch {}
                }}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={selected ? mode.gradient : ['rgba(255,255,255,0.03)', 'rgba(255,255,255,0.01)']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.modeGradient}
                >
                  <Ionicons
                    name={mode.icon}
                    size={28}
                    color={selected ? Colors.white : Colors.textMuted}
                  />
                  <Text style={[styles.modeLabel, selected && styles.modeLabelSelected]}>
                    {mode.label}
                  </Text>
                  <Text style={[styles.modeDesc, selected && styles.modeDescSelected]}>
                    {mode.desc}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Duration Selector */}
        <Text style={styles.sectionLabel}>DURATION</Text>
        <View style={styles.durationRow}>
          {durations.map((d) => (
            <TouchableOpacity
              key={d}
              style={[styles.durationPill, selectedDuration === d && styles.durationPillSelected]}
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

        {/* Your Music Section */}
        <View style={styles.musicSection}>
          <View style={styles.musicHeaderRow}>
            <Text style={styles.sectionLabel}>YOUR MUSIC</Text>
            <View style={styles.proBadge}>
              <Text style={styles.proBadgeText}>Pro</Text>
            </View>
          </View>
          <GlassCard style={styles.musicCard}>
            <View style={styles.youtubeRow}>
              <TextInput
                style={styles.youtubeInput}
                placeholder="Paste YouTube URL..."
                placeholderTextColor={Colors.textDim}
                value={youtubeUrl}
                onChangeText={setYoutubeUrl}
              />
              <TouchableOpacity style={styles.pasteBtn}>
                <Ionicons name="clipboard-outline" size={18} color={Colors.purple} />
              </TouchableOpacity>
            </View>
            <View style={styles.musicBtnRow}>
              <TouchableOpacity style={styles.musicOptionBtn}>
                <Ionicons name="phone-portrait-outline" size={16} color={Colors.textMuted} />
                <Text style={styles.musicOptionText}>Device Library</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.musicOptionBtn}>
                <Ionicons name="musical-notes-outline" size={16} color={Colors.textMuted} />
                <Text style={styles.musicOptionText}>Spotify / Apple Music</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.musicNote}>
              Rapha AI overlays subtle binaural beats and tracks HRV in real-time
            </Text>
          </GlassCard>
        </View>

        {/* Start Session Button */}
        <TouchableOpacity style={styles.startBtn} onPress={startSession} activeOpacity={0.8}>
          <LinearGradient
            colors={[Colors.accent, '#0b8a63']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.startGradient}
          >
            <Ionicons name="play" size={22} color={Colors.white} />
            <Text style={styles.startText}>Start Session</Text>
          </LinearGradient>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  // Selection View
  selectionContent: {
    padding: Spacing.lg,
  },
  selectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  selectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  selectionTitle: {
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
  sectionLabel: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: Spacing.md,
  },
  modeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  modeCard: {
    width: (SCREEN_WIDTH - Spacing.lg * 2 - Spacing.sm) / 2,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  modeCardSelected: {
    borderColor: 'rgba(108, 92, 231, 0.5)',
  },
  modeGradient: {
    padding: Spacing.md,
    alignItems: 'center',
    gap: 6,
    minHeight: 130,
    justifyContent: 'center',
  },
  modeLabel: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: FontSize.md,
    color: Colors.textMuted,
  },
  modeLabelSelected: {
    color: Colors.white,
  },
  modeDesc: {
    fontFamily: 'Inter_400Regular',
    fontSize: FontSize.xs - 1,
    color: Colors.textDim,
    textAlign: 'center',
    lineHeight: 15,
  },
  modeDescSelected: {
    color: 'rgba(255,255,255,0.75)',
  },
  durationRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  durationPill: {
    flex: 1,
    paddingVertical: Spacing.sm + 2,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    alignItems: 'center',
  },
  durationPillSelected: {
    borderColor: Colors.accent,
    backgroundColor: 'rgba(14, 168, 122, 0.15)',
  },
  durationText: {
    fontFamily: 'Inter_500Medium',
    fontSize: FontSize.sm,
    color: Colors.textMuted,
  },
  durationTextSelected: {
    color: Colors.accent,
  },
  // Music Section
  musicSection: {
    marginBottom: Spacing.xl,
  },
  musicHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  proBadge: {
    backgroundColor: Colors.purpleLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(108, 92, 231, 0.3)',
  },
  proBadgeText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 9,
    color: Colors.purple,
  },
  musicCard: {
    gap: Spacing.sm,
  },
  youtubeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  youtubeInput: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
    fontFamily: 'Inter_400Regular',
    fontSize: FontSize.sm,
    color: Colors.text,
  },
  pasteBtn: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.purpleLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(108, 92, 231, 0.2)',
  },
  musicBtnRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  musicOptionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: Spacing.sm + 2,
    borderRadius: BorderRadius.sm,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  musicOptionText: {
    fontFamily: 'Inter_500Medium',
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },
  musicNote: {
    fontFamily: 'Inter_400Regular',
    fontSize: FontSize.xs,
    color: Colors.textDim,
    textAlign: 'center',
    lineHeight: 17,
  },
  // Start Button
  startBtn: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  startGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md + 4,
    gap: Spacing.sm,
  },
  startText: {
    fontFamily: 'Inter_700Bold',
    fontSize: FontSize.lg,
    color: Colors.white,
  },
  // Active Session View
  activeContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.lg,
  },
  closeBtnActive: {
    position: 'absolute',
    top: Spacing.md,
    right: Spacing.lg,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  stateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(14, 168, 122, 0.12)',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    borderRadius: BorderRadius.full,
    marginBottom: Spacing.lg,
  },
  stateDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.accent,
  },
  stateText: {
    fontFamily: 'Inter_500Medium',
    fontSize: FontSize.xs,
    color: Colors.accent,
  },
  rmssdContainer: {
    width: 160,
    height: 160,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  progressRing: {
    position: 'absolute',
  },
  rmssdOverlay: {
    alignItems: 'center',
  },
  rmssdBig: {
    fontFamily: 'Inter_700Bold',
    fontSize: 42,
    color: Colors.text,
    letterSpacing: -1,
  },
  rmssdLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rmssdUnit: {
    fontFamily: 'Inter_500Medium',
    fontSize: FontSize.sm,
    color: Colors.textMuted,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.accent,
  },
  targetRow: {
    alignItems: 'center',
    gap: 2,
    marginBottom: Spacing.sm,
  },
  targetLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: FontSize.sm,
    color: Colors.purple,
  },
  freqText: {
    fontFamily: 'Inter_400Regular',
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },
  timerText: {
    fontFamily: 'Inter_700Bold',
    fontSize: FontSize.xxl,
    color: Colors.text,
    letterSpacing: -1,
    marginBottom: Spacing.sm,
  },
  sparklineContainer: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  sparklineLabel: {
    fontFamily: 'Inter_400Regular',
    fontSize: FontSize.xs,
    color: Colors.textDim,
    marginBottom: 4,
  },
  controlsRow: {
    flexDirection: 'row',
    gap: Spacing.lg,
  },
  controlBtn: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.purple,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stopBtn: {
    backgroundColor: 'rgba(239, 68, 68, 0.8)',
  },
  // Summary View
  summaryContent: {
    padding: Spacing.lg,
    paddingTop: Spacing.xl,
  },
  summaryHeader: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
    marginTop: Spacing.xl,
  },
  summaryTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: FontSize.xxl,
    color: Colors.text,
    marginTop: Spacing.md,
  },
  summaryStats: {
    marginBottom: Spacing.md,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xl,
    marginBottom: Spacing.lg,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  statValue: {
    fontFamily: 'Inter_700Bold',
    fontSize: 36,
    color: Colors.text,
  },
  statUnit: {
    fontFamily: 'Inter_400Regular',
    fontSize: FontSize.xs,
    color: Colors.textDim,
  },
  summaryMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: Spacing.md,
    borderTopWidth: 0.5,
    borderTopColor: Colors.surfaceBorder,
  },
  summaryMetaItem: {
    alignItems: 'center',
  },
  summaryMetaLabel: {
    fontFamily: 'Inter_400Regular',
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    marginBottom: 2,
  },
  summaryMetaValue: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: FontSize.md,
    color: Colors.text,
  },
  comparisonCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  comparisonText: {
    fontFamily: 'Inter_500Medium',
    fontSize: FontSize.sm,
    color: Colors.text,
    flex: 1,
  },
  feelingCard: {
    marginBottom: Spacing.xl,
  },
  feelingTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: FontSize.md,
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  feelingOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  feelingBtn: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  feelingBtnSelected: {
    borderColor: Colors.accent,
    backgroundColor: 'rgba(14, 168, 122, 0.15)',
  },
  feelingBtnText: {
    fontFamily: 'Inter_500Medium',
    fontSize: FontSize.sm,
    color: Colors.textMuted,
  },
  feelingBtnTextSelected: {
    color: Colors.accent,
  },
  saveCloseBtn: {
    backgroundColor: Colors.accent,
    paddingVertical: Spacing.md + 2,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
  },
  saveCloseText: {
    fontFamily: 'Inter_700Bold',
    fontSize: FontSize.lg,
    color: Colors.white,
  },
});
