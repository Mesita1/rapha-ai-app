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
  Linking,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Circle } from 'react-native-svg';
import GlassCard from '../components/GlassCard';
import { Colors, FontSize, Spacing, BorderRadius } from '../constants/theme';
import { startBinauralBeat, stopBinauralBeat, updateBeatFrequency } from '../lib/toneGenerator';
import { useBLE } from '../context/BLEContext';
import { useInterventions } from '../context/InterventionContext';

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

const durations = [5, 10, 15, 20, 30, 0]; // 0 = custom

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
  const { isConnected: bleConnected, rmssd: bleRmssd } = useBLE();
  const { addIntervention } = useInterventions();
  const [interventionLogged, setInterventionLogged] = useState(false);
  const [phase, setPhase] = useState<SessionPhase>('selection');
  const [selectedMode, setSelectedMode] = useState('calm');
  const [selectedDuration, setSelectedDuration] = useState(10);
  const [elapsed, setElapsed] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [musicMode, setMusicMode] = useState<'none' | 'own_music' | 'builtin'>('none');
  const [feeling, setFeeling] = useState<string | null>(null);
  const [showCustomDuration, setShowCustomDuration] = useState(false);
  const [customDurationInput, setCustomDurationInput] = useState('');

  // HRV values during session — use real BLE data when connected, show '--' otherwise
  const initialRmssd = bleConnected && bleRmssd > 0 ? bleRmssd : 0;
  const [currentRmssd, setCurrentRmssd] = useState(initialRmssd);
  const [currentFreq, setCurrentFreq] = useState(9.2);
  const [hrvHistory, setHrvHistory] = useState<number[]>(initialRmssd > 0 ? [initialRmssd] : []);
  const startRmssd = useRef(initialRmssd);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const freqShiftRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const sessionStartTime = useRef<number>(0);
  const waveProgress = useRef(new Animated.Value(0)).current;

  const currentMode = modes.find((m) => m.key === selectedMode)!;
  const totalSeconds = selectedDuration * 60;
  const progress = totalSeconds > 0 ? elapsed / totalSeconds : 0;

  const startSession = async () => {
    try { Haptics?.impactAsync(Haptics.ImpactFeedbackStyle.Medium); } catch {}
    setPhase('active');
    setElapsed(0);
    setIsPlaying(true);
    const startVal = bleConnected && bleRmssd > 0 ? bleRmssd : 0;
    startRmssd.current = startVal;
    setCurrentRmssd(startVal);
    setHrvHistory(startVal > 0 ? [startVal] : []);
    setCurrentFreq(currentMode.startFreq);
    sessionStartTime.current = Date.now();

    // Start binaural beat audio — use low volume for music overlay mode
    const beatVolume = musicMode === 'own_music' ? 0.1 : 0.3;
    try {
      await startBinauralBeat(200, currentMode.startFreq, beatVolume);
    } catch (e) {
      console.warn('Failed to start binaural beat:', e);
    }

    // Gradual frequency shift for Calm and Sleep Prep modes (every 30s, reduce by 0.5Hz)
    if (currentMode.key === 'calm' || currentMode.key === 'sleep') {
      freqShiftRef.current = setInterval(() => {
        setCurrentFreq((prev) => {
          const target = currentMode.endFreq;
          if (Math.abs(prev - target) < 0.5) return target;
          const newFreq = prev - 0.5;
          updateBeatFrequency(newFreq);
          return newFreq;
        });
      }, 30000);
    }

    intervalRef.current = setInterval(() => {
      setElapsed(() => {
        const actualElapsed = Math.floor((Date.now() - sessionStartTime.current) / 1000);
        if (actualElapsed >= totalSeconds) {
          clearInterval(intervalRef.current!);
          if (freqShiftRef.current) clearInterval(freqShiftRef.current);
          setIsPlaying(false);
          stopBinauralBeat();
          addIntervention({
            name: `Binaural Beats - ${currentMode.label}`,
            category: 'therapy',
            subcategory: currentMode.label,
            dose: `${selectedDuration} min`,
            preRmssd: startRmssd.current > 0 ? startRmssd.current : undefined,
            postRmssd: bleConnected && bleRmssd > 0 ? bleRmssd : undefined,
          });
          setInterventionLogged(true);
          setPhase('summary');
          try { Haptics?.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch {}
          return totalSeconds;
        }
        return actualElapsed;
      });

      // Use real BLE RMSSD if connected, otherwise keep at 0 (will show --)
      if (bleConnected && bleRmssd > 0) {
        setCurrentRmssd(bleRmssd);
        setHrvHistory((h) => [...h.slice(-30), bleRmssd]);
      }

      // Frequency approaching target (for focus/recovery modes)
      if (currentMode.key !== 'calm' && currentMode.key !== 'sleep') {
        setCurrentFreq((prev) => {
          const target = currentMode.endFreq;
          const step = (target - prev) * 0.02;
          return prev + step;
        });
      }
    }, 1000);
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (freqShiftRef.current) clearInterval(freqShiftRef.current);
      stopBinauralBeat();
    };
  }, []);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const endRmssd = currentRmssd;
  const changePercent = startRmssd.current > 0 ? ((endRmssd - startRmssd.current) / startRmssd.current * 100).toFixed(1) : '0.0';

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
            <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 16, color: Colors.accent, textAlign: 'center', marginTop: 8 }}>
              {['Way to go!', 'Great job!', 'You showed up \u2014 that matters!', 'Your nervous system thanks you!', 'Keep it up!', 'Progress, not perfection!', "You're doing amazing!", 'Every session counts!'][Math.floor(Math.random() * 8)]}
            </Text>
            <Text style={styles.summaryTitle}>Session Complete</Text>
          </View>

          <GlassCard style={styles.summaryStats}>
            <View style={styles.statRow}>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Starting HRV</Text>
                <Text style={styles.statValue}>{startRmssd.current > 0 ? startRmssd.current.toFixed(1) : '--'}</Text>
                <Text style={styles.statUnit}>ms</Text>
              </View>
              <Ionicons name="arrow-forward" size={20} color={Colors.accent} />
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Ending HRV</Text>
                <Text style={[styles.statValue, { color: Colors.accent }]}>{endRmssd > 0 ? endRmssd.toFixed(1) : '--'}</Text>
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
                <Text style={styles.summaryMetaValue}>{elapsed >= 60 ? `${Math.floor(elapsed / 60)}:${(elapsed % 60).toString().padStart(2, '0')}` : `${elapsed}s`}</Text>
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

          {interventionLogged && (
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 12 }}>
              <Ionicons name="checkmark-circle" size={16} color={Colors.accent} />
              <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 14, color: Colors.accent }}>Logged to your interventions</Text>
            </View>
          )}

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
              if (freqShiftRef.current) clearInterval(freqShiftRef.current);
              stopBinauralBeat();
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
              <Text style={styles.rmssdBig}>{currentRmssd > 0 ? currentRmssd.toFixed(1) : '--'}</Text>
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
                  if (freqShiftRef.current) clearInterval(freqShiftRef.current);
                  stopBinauralBeat();
                } else {
                  // Resume - adjust start time to account for already elapsed time
                  sessionStartTime.current = Date.now() - elapsed * 1000;
                  startBinauralBeat(200, currentFreq, musicMode === 'own_music' ? 0.1 : 0.3);

                  intervalRef.current = setInterval(() => {
                    setElapsed(() => {
                      const actualElapsed = Math.floor((Date.now() - sessionStartTime.current) / 1000);
                      if (actualElapsed >= totalSeconds) {
                        clearInterval(intervalRef.current!);
                        if (freqShiftRef.current) clearInterval(freqShiftRef.current);
                        stopBinauralBeat();
                        setIsPlaying(false);
                        addIntervention({
                          name: `Binaural Beats - ${currentMode.label}`,
                          category: 'therapy',
                          subcategory: currentMode.label,
                          dose: `${selectedDuration} min`,
                          preRmssd: startRmssd.current > 0 ? startRmssd.current : undefined,
                          postRmssd: bleConnected && bleRmssd > 0 ? bleRmssd : undefined,
                        });
                        setInterventionLogged(true);
                        setPhase('summary');
                        return totalSeconds;
                      }
                      return actualElapsed;
                    });
                    if (bleConnected && bleRmssd > 0) {
                      setCurrentRmssd(bleRmssd);
                      setHrvHistory((h) => [...h.slice(-30), bleRmssd]);
                    }
                    if (currentMode.key !== 'calm' && currentMode.key !== 'sleep') {
                      setCurrentFreq((prev) => {
                        const target = currentMode.endFreq;
                        const step = (target - prev) * 0.02;
                        return prev + step;
                      });
                    }
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
                if (freqShiftRef.current) clearInterval(freqShiftRef.current);
                stopBinauralBeat();
                setIsPlaying(false);
                // Track actual elapsed time on early stop
                const actualElapsed = Math.floor((Date.now() - sessionStartTime.current) / 1000);
                setElapsed(actualElapsed);
                addIntervention({
                  name: `Binaural Beats - ${currentMode.label}`,
                  category: 'therapy',
                  subcategory: currentMode.label,
                  dose: `${Math.max(1, Math.round(actualElapsed / 60))} min`,
                  preRmssd: startRmssd.current > 0 ? startRmssd.current : undefined,
                  postRmssd: currentRmssd > 0 ? currentRmssd : undefined,
                });
                setInterventionLogged(true);
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
          {durations.filter(d => d > 0).map((d) => (
            <TouchableOpacity
              key={d}
              style={[styles.durationPill, selectedDuration === d && !showCustomDuration && styles.durationPillSelected]}
              onPress={() => {
                setSelectedDuration(d);
                setShowCustomDuration(false);
                try { Haptics?.selectionAsync(); } catch {}
              }}
            >
              <Text style={[styles.durationText, selectedDuration === d && !showCustomDuration && styles.durationTextSelected]}>
                {d} min
              </Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity
            style={[styles.durationPill, showCustomDuration && styles.durationPillSelected]}
            onPress={() => setShowCustomDuration(true)}
          >
            <Text style={[styles.durationText, showCustomDuration && styles.durationTextSelected]}>Custom</Text>
          </TouchableOpacity>
        </View>
        {showCustomDuration && (
          <View style={{ backgroundColor: Colors.surface, borderRadius: 12, borderWidth: 1, borderColor: Colors.surfaceBorder, marginBottom: 16 }}>
            <TextInput
              style={{ paddingHorizontal: 16, paddingVertical: 10, fontFamily: 'Inter_400Regular', fontSize: 14, color: Colors.text }}
              placeholder="Minutes (1-480)"
              placeholderTextColor={Colors.textDim}
              value={customDurationInput}
              onChangeText={(text) => {
                setCustomDurationInput(text);
                const mins = parseInt(text);
                if (mins >= 1 && mins <= 480) setSelectedDuration(mins);
              }}
              keyboardType="numeric"
              maxLength={3}
            />
          </View>
        )}

        {/* Music + Binaural Overlay Section */}
        <View style={styles.musicSection}>
          <View style={styles.musicHeaderRow}>
            <Text style={styles.sectionLabel}>MUSIC + BINAURAL OVERLAY</Text>
            <View style={styles.proBadge}>
              <Text style={styles.proBadgeText}>Pro</Text>
            </View>
          </View>

          <Text style={styles.musicExplanation}>
            Play music from any app (Spotify, Apple Music, YouTube). Rapha AI generates a subtle binaural beat frequency underneath your music. You won't hear the beat directly — it works subliminally while you enjoy your music.
          </Text>

          {/* Option A: Play own music */}
          <TouchableOpacity
            style={[styles.musicModeCard, musicMode === 'own_music' && styles.musicModeCardSelected]}
            onPress={() => setMusicMode(musicMode === 'own_music' ? 'none' : 'own_music')}
            activeOpacity={0.8}
          >
            <View style={styles.musicModeHeader}>
              <View style={[styles.musicModeRadio, musicMode === 'own_music' && styles.musicModeRadioSelected]}>
                {musicMode === 'own_music' && <View style={styles.musicModeRadioDot} />}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.musicModeTitle, musicMode === 'own_music' && styles.musicModeTitleSelected]}>
                  I'll play my own music
                </Text>
                <Text style={styles.musicModeDesc}>
                  Binaural beat overlay at very low volume (subliminal)
                </Text>
              </View>
              <Ionicons name="musical-notes-outline" size={22} color={musicMode === 'own_music' ? Colors.accent : Colors.textDim} />
            </View>
          </TouchableOpacity>

          {musicMode === 'own_music' && (
            <GlassCard style={styles.musicOverlayInfo}>
              <View style={styles.overlayStatusRow}>
                <View style={styles.overlayDot} />
                <Text style={styles.overlayStatusText}>
                  Binaural overlay will activate at {currentMode.startFreq} Hz when session starts
                </Text>
              </View>
              <Text style={styles.overlayHint}>
                Open your music app and press play. The binaural beat runs subtly underneath.
              </Text>
              <View style={styles.quickLaunchRow}>
                <TouchableOpacity
                  style={styles.quickLaunchBtn}
                  onPress={() => {
                    Linking.openURL('spotify://').catch(() =>
                      Linking.openURL('https://open.spotify.com').catch(() => {})
                    );
                  }}
                >
                  <Ionicons name="musical-notes-outline" size={16} color={Colors.purple} />
                  <Text style={styles.quickLaunchText}>Spotify</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.quickLaunchBtn}
                  onPress={() => {
                    Linking.openURL('music://').catch(() => {});
                  }}
                >
                  <Ionicons name="musical-note-outline" size={16} color={Colors.purple} />
                  <Text style={styles.quickLaunchText}>Apple Music</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.quickLaunchBtn}
                  onPress={() => {
                    Linking.openURL('https://youtube.com').catch(() => {});
                  }}
                >
                  <Ionicons name="logo-youtube" size={16} color={Colors.purple} />
                  <Text style={styles.quickLaunchText}>YouTube</Text>
                </TouchableOpacity>
              </View>
            </GlassCard>
          )}

          {/* Option B: Built-in tones only */}
          <TouchableOpacity
            style={[styles.musicModeCard, musicMode === 'builtin' && styles.musicModeCardSelected]}
            onPress={() => setMusicMode(musicMode === 'builtin' ? 'none' : 'builtin')}
            activeOpacity={0.8}
          >
            <View style={styles.musicModeHeader}>
              <View style={[styles.musicModeRadio, musicMode === 'builtin' && styles.musicModeRadioSelected]}>
                {musicMode === 'builtin' && <View style={styles.musicModeRadioDot} />}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.musicModeTitle, musicMode === 'builtin' && styles.musicModeTitleSelected]}>
                  Use built-in tones only
                </Text>
                <Text style={styles.musicModeDesc}>
                  Binaural beat at normal volume, no external music
                </Text>
              </View>
              <Ionicons name="headset-outline" size={22} color={musicMode === 'builtin' ? Colors.purple : Colors.textDim} />
            </View>
          </TouchableOpacity>
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
  // Music + Binaural Overlay Section
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
  musicExplanation: {
    fontFamily: 'Inter_400Regular',
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    lineHeight: 20,
    marginBottom: Spacing.md,
  },
  musicModeCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  musicModeCardSelected: {
    borderColor: 'rgba(14, 168, 122, 0.5)',
    backgroundColor: 'rgba(14, 168, 122, 0.06)',
  },
  musicModeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  musicModeRadio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.textDim,
    alignItems: 'center',
    justifyContent: 'center',
  },
  musicModeRadioSelected: {
    borderColor: Colors.accent,
  },
  musicModeRadioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.accent,
  },
  musicModeTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: FontSize.md,
    color: Colors.textMuted,
  },
  musicModeTitleSelected: {
    color: Colors.text,
  },
  musicModeDesc: {
    fontFamily: 'Inter_400Regular',
    fontSize: FontSize.xs,
    color: Colors.textDim,
    marginTop: 2,
  },
  musicOverlayInfo: {
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  overlayStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  overlayDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.accent,
  },
  overlayStatusText: {
    fontFamily: 'Inter_500Medium',
    fontSize: FontSize.sm,
    color: Colors.accent,
    flex: 1,
  },
  overlayHint: {
    fontFamily: 'Inter_400Regular',
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    lineHeight: 17,
  },
  quickLaunchRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
  quickLaunchBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: Spacing.sm + 2,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.purpleLight,
    borderWidth: 1,
    borderColor: 'rgba(108, 92, 231, 0.2)',
  },
  quickLaunchText: {
    fontFamily: 'Inter_500Medium',
    fontSize: FontSize.xs,
    color: Colors.purple,
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
