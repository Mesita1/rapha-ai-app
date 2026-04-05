import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Linking,
  Modal,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Polyline, Line, Circle, Text as SvgText, Defs, LinearGradient as SvgLinearGradient, Stop } from 'react-native-svg';
import GlassCard from '../../components/GlassCard';
import SparklineChart from '../../components/SparklineChart';
import { Colors, FontSize, Spacing, BorderRadius, Shadows } from '../../constants/theme';
import {
  mockUser,
  mockCurrentHRV,
  mockSparklineData,
  mockMetrics,
  mockTodaySummary,
  dayInReview,
  autonomicTimeline,
  bodyBattery,
  trendArrows,
  mockAthleteInsights,
  mockHealthMetrics,
} from '../../constants/mockData';
import { getVerseOfTheDay } from '../../constants/scriptureData';
import { useBLE } from '../../context/BLEContext';
import { useAuth } from '../../context/AuthContext';
import { useHRVTracker } from '../../context/HRVTrackerContext';
import { useInterventions } from '../../context/InterventionContext';
import { getAutonomicState } from '../../lib/bluetooth';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const TIMELINE_COLORS = {
  sympathetic: '#ef4444',
  parasympathetic: '#00d68f',
  dorsal: '#3b82f6',
};

const TREND_ARROW_MAP: Record<string, { symbol: string; color: string }> = {
  up: { symbol: '\u2191', color: '#00d68f' },
  down: { symbol: '\u2193', color: '#ef4444' },
  stable: { symbol: '\u2192', color: '#8e8e93' },
};

function getSignalDisplay(quality: string): { label: string; color: string } {
  switch (quality) {
    case 'excellent': return { label: 'Excellent', color: '#D4A574' };
    case 'good': return { label: 'Good', color: '#D4A574' };
    case 'poor': return { label: 'Poor', color: '#f59e0b' };
    case 'bad': return { label: 'Weak', color: '#ef4444' };
    default: return { label: '--', color: '#8e8e93' };
  }
}

function getMoodDotColor(mood?: string): string {
  if (mood === 'great' || mood === 'good') return '#22c55e';
  if (mood === 'okay') return '#f59e0b';
  if (mood === 'low' || mood === 'struggling') return '#ef4444';
  return 'transparent';
}

const MOOD_CHECK_OPTIONS: { key: 'great' | 'good' | 'okay' | 'low' | 'struggling'; label: string; icon: string }[] = [
  { key: 'great', label: 'Great', icon: '😄' },
  { key: 'good', label: 'Good', icon: '🙂' },
  { key: 'okay', label: 'Okay', icon: '😐' },
  { key: 'low', label: 'Low', icon: '😕' },
  { key: 'struggling', label: 'Struggling', icon: '😢' },
];

const STRESS_LEVELS_DASH = [
  { value: 1, label: 'Calm', color: '#22c55e' },
  { value: 2, label: 'Mild', color: '#86efac' },
  { value: 3, label: 'Moderate', color: '#f59e0b' },
  { value: 4, label: 'High', color: '#f97316' },
  { value: 5, label: 'Intense', color: '#ef4444' },
];

const ENERGY_LEVELS_DASH = [
  { value: 1, label: 'Exhausted', color: '#ef4444' },
  { value: 2, label: 'Low', color: '#f97316' },
  { value: 3, label: 'Moderate', color: '#f59e0b' },
  { value: 4, label: 'Good', color: '#86efac' },
  { value: 5, label: 'Energized', color: '#22c55e' },
];

function calculatePNN50(rrIntervals: number[]): number | null {
  if (rrIntervals.length < 3) return null;
  let nn50Count = 0;
  for (let i = 1; i < rrIntervals.length; i++) {
    if (Math.abs(rrIntervals[i] - rrIntervals[i - 1]) > 50) nn50Count++;
  }
  return (nn50Count / (rrIntervals.length - 1)) * 100;
}

export default function DashboardScreen() {
  const [showRecommendation, setShowRecommendation] = useState(false);
  const [showDemoData, setShowDemoData] = useState(false);
  const [showHrvDetails, setShowHrvDetails] = useState(false);
  const [showFabMenu, setShowFabMenu] = useState(false);
  const [showMoodCheck, setShowMoodCheck] = useState(false);
  const [moodCheckMood, setMoodCheckMood] = useState<'great' | 'good' | 'okay' | 'low' | 'struggling' | null>(null);
  const [moodCheckStress, setMoodCheckStress] = useState<number | null>(null);
  const [moodCheckEnergy, setMoodCheckEnergy] = useState<number | null>(null);
  const verseOfTheDay = getVerseOfTheDay();
  const { interventions, addIntervention } = useInterventions();
  const { user: authUser } = useAuth();
  const { activeTrackers: hrvTrackers, notifications: hrvNotifications, dismissNotification, getNextCheck, getSummary } = useHRVTracker();
  const { isConnected, heartRate, rmssd, sdnn, pnn50, signalQuality, rmssdHistory, rrIntervals, connectedDevice, fullAnalysis } = useBLE();

  // Derive autonomic state from real or mock data
  const liveRmssd = isConnected ? rmssd : null;
  const liveHR = isConnected ? heartRate : null;
  const liveState = isConnected && rmssd > 0
    ? getAutonomicState(rmssd)
    : null;
  const liveStateLabel = liveState === 'parasympathetic' ? 'Parasympathetic'
    : liveState === 'sympathetic' ? 'Sympathetic' : liveState ? 'Transitioning' : '--';
  const sparkData = isConnected && rmssdHistory.length > 0 ? rmssdHistory : [];

  // Autonomic balance: count sympathetic vs parasympathetic hours for gauge position
  const symCount = isConnected ? autonomicTimeline.filter((s) => s.state === 'sympathetic').length : 0;
  const paraCount = isConnected ? autonomicTimeline.filter((s) => s.state === 'parasympathetic').length : 0;
  const totalBalance = symCount + paraCount;
  const gaugePosition = totalBalance > 0 ? paraCount / totalBalance : 0.5;

  // Body Battery SVG
  const bbWidth = SCREEN_WIDTH - 80;
  const bbHeight = 80;
  const bbPoints = bodyBattery.map((b, i) => {
    const x = (i / (bodyBattery.length - 1)) * bbWidth;
    const y = bbHeight - ((b.value / 100) * bbHeight);
    return `${x},${y}`;
  }).join(' ');
  const currentBattery = bodyBattery[bodyBattery.length - 1].value;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Svg width={24} height={24} viewBox="0 0 24 24" style={{ marginRight: 8 }}>
                <Defs>
                  <SvgLinearGradient id="miniRingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <Stop offset="0%" stopColor="#0ea87a" />
                    <Stop offset="100%" stopColor="#D4A574" />
                  </SvgLinearGradient>
                </Defs>
                <Circle cx="12" cy="12" r="9" stroke="url(#miniRingGrad)" strokeWidth={2.5} fill="none" />
                <SvgText x="12" y="12" textAnchor="middle" alignmentBaseline="central" fontSize={11} fontWeight="700" fill="#ffffff">R</SvgText>
              </Svg>
              <Text style={styles.greeting}>Hi, {authUser?.displayName?.split(' ')[0] || 'there'}</Text>
            </View>
            {!isConnected && (
              <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 13, color: Colors.textMuted, marginTop: 2 }}>
                Your healing journey begins here
              </Text>
            )}
          </View>
          <TouchableOpacity
            style={styles.settingsButton}
            onPress={() => router.push('/(tabs)/settings')}
          >
            <Ionicons name="settings-outline" size={22} color={Colors.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Get Started Card (when not connected and not showing demo) */}
        {!isConnected && !showDemoData && (
          <GlassCard style={styles.getStartedCard}>
            <Ionicons name="heart-circle-outline" size={40} color={Colors.accent} />
            <Text style={styles.getStartedTitle}>Get Started</Text>
            <Text style={styles.getStartedText}>
              Connect a device to see your live HRV data
            </Text>
            <TouchableOpacity
              style={styles.getStartedScanButton}
              onPress={() => router.push('/(auth)/connect-device')}
              activeOpacity={0.8}
            >
              <Ionicons name="bluetooth-outline" size={18} color={Colors.background} />
              <Text style={styles.getStartedScanText}>Scan for Devices</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setShowDemoData(true)} activeOpacity={0.7}>
              <Text style={styles.getStartedDemoToggle}>Explore with demo data</Text>
            </TouchableOpacity>
          </GlassCard>
        )}

        {/* Demo Data Badge */}
        {!isConnected && showDemoData && (
          <TouchableOpacity
            style={styles.demoBadge}
            onPress={() => router.push('/(auth)/connect-device')}
            activeOpacity={0.7}
          >
            <View style={styles.demoBadgeInner}>
              <Ionicons name="information-circle-outline" size={14} color="#f59e0b" />
              <Text style={styles.demoBadgeText}>Demo Data</Text>
              <Text style={styles.demoBadgeLink}>Connect a device</Text>
            </View>
          </TouchableOpacity>
        )}

        {/* Day-in-Review Card */}
        {isConnected ? (
          <View style={styles.reviewWrapper}>
            <LinearGradient
              colors={['rgba(212,165,116,0.25)', 'rgba(108,92,231,0.25)', 'rgba(212,165,116,0.15)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.reviewGradientBorder}
            >
              <View style={styles.reviewInner}>
                <View style={styles.reviewHeader}>
                  <Ionicons name="sparkles-outline" size={16} color={Colors.accent} />
                  <Text style={styles.reviewLabel}>Day in Review</Text>
                </View>
                <Text style={styles.reviewText}>
                  {`Live session in progress. Connected to ${connectedDevice?.name || 'device'}.`}
                </Text>
              </View>
            </LinearGradient>
          </View>
        ) : (
          <View style={styles.reviewWrapper}>
            <LinearGradient
              colors={['rgba(212,165,116,0.25)', 'rgba(108,92,231,0.25)', 'rgba(212,165,116,0.15)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.reviewGradientBorder}
            >
              <View style={styles.reviewInner}>
                <View style={styles.reviewHeader}>
                  <Ionicons name="sparkles-outline" size={16} color={Colors.accent} />
                  <Text style={styles.reviewLabel}>Welcome to Rapha AI!</Text>
                </View>
                <Text style={styles.reviewText}>
                  Connect a device or log your first intervention to get started. Your healing journey begins here.
                </Text>
              </View>
            </LinearGradient>
          </View>
        )}

        {/* Verse of the Day Card - always show */}
        <View style={styles.verseCard}>
          <View style={styles.verseLeftBorder} />
          <View style={styles.verseContent}>
            <View style={styles.verseHeader}>
              <Ionicons name="book-outline" size={14} color="#d4a574" />
              <Text style={styles.verseLabel}>Verse of the Day</Text>
            </View>
            <Text style={styles.verseText}>"{verseOfTheDay.text}"</Text>
            <TouchableOpacity activeOpacity={0.7} onPress={() => Linking.openURL(verseOfTheDay.youversionUrl)}>
              <Text style={[styles.verseReference, { textDecorationLine: 'underline' }]}>{verseOfTheDay.reference} — {verseOfTheDay.translation}</Text>
            </TouchableOpacity>
            <View style={styles.verseActions}>
              <TouchableOpacity
                style={styles.verseMeditateButton}
                activeOpacity={0.7}
                onPress={() => router.push('/(tabs)/train')}
              >
                <Ionicons name="leaf-outline" size={14} color={Colors.accent} />
                <Text style={styles.verseMeditateText}>Meditate</Text>
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => Linking.openURL(verseOfTheDay.youversionUrl)}
              >
                <Text style={styles.verseBibleLink}>Read in Bible App</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Readiness Card */}
        {isConnected && (
        <GlassCard style={styles.readinessCard}>
          <View style={styles.readinessRow}>
            <View style={styles.readinessScoreContainer}>
              <Text style={styles.readinessScore}>{rmssd > 50 ? Math.min(95, Math.round(rmssd * 1.4)) : rmssd > 30 ? Math.round(50 + rmssd) : Math.round(rmssd * 1.5)}</Text>
            </View>
            <View style={styles.readinessInfo}>
              <Text style={styles.readinessLabel}>Readiness</Text>
              <Text style={styles.readinessRec}>{rmssd > 50 ? 'Green light for high intensity' : rmssd > 30 ? 'Moderate — consider lighter activity' : 'Low — prioritize recovery today'}</Text>
            </View>
            <View style={styles.readinessIndicator}>
              <Ionicons name="checkmark-circle" size={20} color={Colors.accent} />
            </View>
          </View>
        </GlassCard>
        )}

        {/* Live HRV Card */}
        <GlassCard style={styles.hrvCard} glowColor={Colors.accent}>
          <View style={styles.hrvLabelRow}>
            <Ionicons name="heart" size={16} color={Colors.accent} />
            <Text style={styles.liveHrvText}>{isConnected ? 'Live HRV' : 'HRV'}</Text>
            {isConnected && (() => {
              const signal = getSignalDisplay(signalQuality);
              return (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginLeft: 'auto' }}>
                  <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: signal.color }} />
                  <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 11, color: signal.color }}>Signal</Text>
                </View>
              );
            })()}
          </View>
          <View style={styles.hrvMain}>
            <Text style={styles.hrvValue}>{isConnected && rmssd > 0 ? rmssd.toFixed(1) : '--'}</Text>
            <Text style={styles.hrvUnit}>ms</Text>
          </View>
          <View style={styles.hrvSecondary}>
            <Text style={styles.bpmText}>{isConnected && heartRate > 0 ? `${heartRate} bpm` : '-- bpm'}</Text>
            {isConnected ? (
              <View style={[styles.parasymBadge, liveState === 'sympathetic' && { backgroundColor: 'rgba(239,68,68,0.15)' }]}>
                <Text style={[styles.parasymText, liveState === 'sympathetic' && { color: '#ef4444' }]}>{liveStateLabel}</Text>
              </View>
            ) : (
              <TouchableOpacity onPress={() => router.push('/(auth)/connect-device')} activeOpacity={0.7}>
                <View style={styles.parasymBadge}>
                  <Text style={styles.parasymText}>Connect a device</Text>
                </View>
              </TouchableOpacity>
            )}
          </View>
          {isConnected && (
            <>
              <TouchableOpacity
                style={{ alignItems: 'center', marginTop: Spacing.sm, paddingVertical: Spacing.xs }}
                onPress={() => setShowHrvDetails(!showHrvDetails)}
                activeOpacity={0.7}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 12, color: Colors.textMuted }}>
                    {showHrvDetails ? 'Hide details' : 'Tap for details'}
                  </Text>
                  <Ionicons name={showHrvDetails ? 'chevron-up' : 'chevron-down'} size={14} color={Colors.textMuted} />
                </View>
              </TouchableOpacity>
              {showHrvDetails && (() => {
                const signal = getSignalDisplay(signalQuality);
                const fa = fullAnalysis;
                const freq = fa?.frequency;
                const poinc = fa?.poincare;
                const geo = fa?.geometric;
                const dcac = fa?.dcac;
                const qualityColor = signal.color;
                const dfaVal = fa?.dfaAlpha1;
                const dfaInterp = dfaVal != null
                  ? dfaVal > 1.0 ? 'Healthy resting' : dfaVal > 0.75 ? 'Moderate activity' : dfaVal > 0.5 ? 'High intensity' : 'Exhaustion'
                  : null;
                const dfaColor = dfaVal != null
                  ? dfaVal > 1.0 ? '#00d68f' : dfaVal > 0.75 ? '#00d68f' : dfaVal > 0.5 ? '#f59e0b' : '#ef4444'
                  : Colors.textDim;
                const sampEnVal = fa?.sampleEntropy;
                const sampEnInterp = sampEnVal != null
                  ? sampEnVal >= 1.0 && sampEnVal <= 2.0 ? 'Normal complexity' : sampEnVal < 1.0 ? 'Reduced complexity' : 'High complexity'
                  : null;
                const sampEnColor = sampEnVal != null
                  ? sampEnVal >= 1.0 && sampEnVal <= 2.0 ? '#00d68f' : '#f59e0b'
                  : Colors.textDim;
                const permEnVal = fa?.permutationEntropy;
                const permEnInterp = permEnVal != null
                  ? permEnVal >= 0.6 && permEnVal <= 0.9 ? 'Normal' : permEnVal < 0.6 ? 'Very regular' : 'Very random'
                  : null;
                const permEnColor = permEnVal != null
                  ? permEnVal >= 0.6 && permEnVal <= 0.9 ? '#00d68f' : '#f59e0b'
                  : Colors.textDim;
                const siVal = fa?.baevskySI;
                const siInterp = siVal != null
                  ? siVal < 100 ? 'Relaxed' : siVal <= 250 ? 'Normal' : siVal <= 500 ? 'Stressed' : 'High stress'
                  : null;
                const siColor = siVal != null
                  ? siVal < 100 ? '#00d68f' : siVal <= 250 ? '#00d68f' : siVal <= 500 ? '#f59e0b' : '#ef4444'
                  : Colors.textDim;
                const dcVal = dcac?.dc;
                const dcInterp = dcVal != null
                  ? dcVal > 4.5 ? 'Strong vagal' : dcVal >= 2.5 ? 'Moderate' : 'Weak vagal'
                  : null;
                const dcColor = dcVal != null
                  ? dcVal > 4.5 ? '#00d68f' : dcVal >= 2.5 ? '#f59e0b' : '#ef4444'
                  : Colors.textDim;
                const rsaVal = fa?.rsa;
                const respVal = fa?.respiratoryRate;

                const sectionLabel = { fontFamily: 'Inter_500Medium' as const, fontSize: 10, color: Colors.textDim, marginBottom: 4, textTransform: 'uppercase' as const, letterSpacing: 1 };
                const metricName = { fontFamily: 'Inter_400Regular' as const, fontSize: 11, color: Colors.textMuted };
                const metricVal = (active: boolean) => ({ fontFamily: 'Inter_700Bold' as const, fontSize: 14, color: active ? Colors.text : Colors.textDim });
                const metricUnit = { fontFamily: 'Inter_400Regular' as const, fontSize: 9, color: Colors.textDim };
                const metricInterp = (color: string) => ({ fontFamily: 'Inter_400Regular' as const, fontSize: 9, color });
                const row = { flexDirection: 'row' as const, justifyContent: 'space-between' as const, marginBottom: 4 };
                const cell = { alignItems: 'center' as const, flex: 1 };

                return (
                  <View style={{ marginTop: Spacing.sm, borderTopWidth: 0.5, borderTopColor: Colors.surfaceBorder, paddingTop: Spacing.sm }}>
                    {/* Time Domain */}
                    <Text style={sectionLabel}>Time Domain</Text>
                    <View style={{ ...row, marginBottom: Spacing.sm }}>
                      <View style={cell}>
                        <Text style={metricName}>RMSSD</Text>
                        <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 16, color: Colors.text }}>{rmssd > 0 ? rmssd.toFixed(1) : '--'}</Text>
                        <Text style={metricUnit}>ms</Text>
                      </View>
                      <View style={cell}>
                        <Text style={metricName}>SDNN</Text>
                        <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 16, color: Colors.text }}>{sdnn > 0 ? sdnn.toFixed(1) : '--'}</Text>
                        <Text style={metricUnit}>ms</Text>
                      </View>
                      <View style={cell}>
                        <Text style={metricName}>pNN50</Text>
                        <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 16, color: Colors.text }}>{fa ? `${fa.pnn50.toFixed(1)}%` : pnn50 > 0 ? `${pnn50.toFixed(0)}%` : '--'}</Text>
                      </View>
                    </View>
                    <View style={{ ...row, marginBottom: Spacing.sm }}>
                      <View style={cell}>
                        <Text style={metricName}>Mean RR</Text>
                        <Text style={metricVal(!!fa)}>{fa ? `${fa.meanRR}` : '--'}</Text>
                        <Text style={metricUnit}>ms</Text>
                      </View>
                      <View style={cell}>
                        <Text style={metricName}>Mean HR</Text>
                        <Text style={metricVal(!!fa)}>{fa ? `${fa.meanHR}` : '--'}</Text>
                        <Text style={metricUnit}>bpm</Text>
                      </View>
                      <View style={cell} />
                    </View>

                    {/* Frequency Domain */}
                    <Text style={sectionLabel}>Frequency Domain</Text>
                    <View style={row}>
                      <View style={cell}>
                        <Text style={metricName}>VLF</Text>
                        <Text style={metricVal(!!freq)}>{freq ? `${freq.vlf}` : '--'}</Text>
                        <Text style={metricUnit}>ms²</Text>
                      </View>
                      <View style={cell}>
                        <Text style={metricName}>LF</Text>
                        <Text style={metricVal(!!freq)}>{freq ? `${freq.lf}` : '--'}</Text>
                        <Text style={metricUnit}>ms²</Text>
                      </View>
                      <View style={cell}>
                        <Text style={metricName}>HF</Text>
                        <Text style={metricVal(!!freq)}>{freq ? `${freq.hf}` : '--'}</Text>
                        <Text style={metricUnit}>ms²</Text>
                      </View>
                    </View>
                    <View style={row}>
                      <View style={cell}>
                        <Text style={metricName}>Total Power</Text>
                        <Text style={metricVal(!!freq)}>{freq ? `${freq.totalPower}` : '--'}</Text>
                        <Text style={metricUnit}>ms²</Text>
                      </View>
                      <View style={cell}>
                        <Text style={metricName}>LF/HF</Text>
                        <Text style={metricVal(!!freq)}>{freq ? `${freq.lfHfRatio}` : '--'}</Text>
                      </View>
                      <View style={cell}>
                        <Text style={metricName}>Peak LF</Text>
                        <Text style={metricVal(!!freq)}>{freq ? `${freq.peakLF}` : '--'}</Text>
                        <Text style={metricUnit}>Hz</Text>
                      </View>
                    </View>
                    <View style={{ ...row, marginBottom: Spacing.sm }}>
                      <View style={cell}>
                        <Text style={metricName}>Peak HF</Text>
                        <Text style={metricVal(!!freq)}>{freq ? `${freq.peakHF}` : '--'}</Text>
                        <Text style={metricUnit}>Hz</Text>
                      </View>
                      <View style={cell} />
                      <View style={cell}>
                        {!freq && <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 9, color: Colors.textDim, textAlign: 'center' }}>Need 2+ min{'\n'}for frequency</Text>}
                      </View>
                    </View>

                    {/* Non-Linear */}
                    <Text style={sectionLabel}>Non-Linear</Text>
                    <View style={row}>
                      <View style={cell}>
                        <Text style={metricName}>DFA α1</Text>
                        <Text style={metricVal(dfaVal != null)}>{dfaVal != null ? dfaVal.toFixed(3) : '--'}</Text>
                        {dfaInterp && <Text style={metricInterp(dfaColor)}>{dfaInterp}</Text>}
                      </View>
                      <View style={cell}>
                        <Text style={metricName}>SampEn</Text>
                        <Text style={metricVal(sampEnVal != null)}>{sampEnVal != null ? sampEnVal.toFixed(3) : '--'}</Text>
                        {sampEnInterp && <Text style={metricInterp(sampEnColor)}>{sampEnInterp}</Text>}
                      </View>
                      <View style={cell}>
                        <Text style={metricName}>PermEn</Text>
                        <Text style={metricVal(permEnVal != null)}>{permEnVal != null ? permEnVal.toFixed(3) : '--'}</Text>
                        {permEnInterp && <Text style={metricInterp(permEnColor)}>{permEnInterp}</Text>}
                      </View>
                    </View>
                    <View style={{ ...row, marginBottom: Spacing.sm }}>
                      <View style={cell}>
                        <Text style={metricName}>SD1/SD2</Text>
                        <Text style={metricVal(!!poinc)}>{poinc ? `${poinc.sd1}/${poinc.sd2}` : '--'}</Text>
                        {poinc && <Text style={metricUnit}>ratio {poinc.sd1sd2}</Text>}
                      </View>
                      <View style={cell}>
                        <Text style={metricName}>Poincaré S</Text>
                        <Text style={metricVal(!!poinc)}>{poinc ? `${poinc.s}` : '--'}</Text>
                        <Text style={metricUnit}>ms²</Text>
                      </View>
                      <View style={cell} />
                    </View>

                    {/* Geometric */}
                    <Text style={sectionLabel}>Geometric</Text>
                    <View style={{ ...row, marginBottom: Spacing.sm }}>
                      <View style={cell}>
                        <Text style={metricName}>Tri Index</Text>
                        <Text style={metricVal(!!geo)}>{geo ? `${geo.triangularIndex}` : '--'}</Text>
                      </View>
                      <View style={cell}>
                        <Text style={metricName}>TINN</Text>
                        <Text style={metricVal(!!geo)}>{geo ? `${geo.tinn}` : '--'}</Text>
                        <Text style={metricUnit}>ms</Text>
                      </View>
                      <View style={cell}>
                        {!geo && <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 9, color: Colors.textDim, textAlign: 'center' }}>Need 50+{'\n'}intervals</Text>}
                      </View>
                    </View>

                    {/* Autonomic */}
                    <Text style={sectionLabel}>Autonomic</Text>
                    <View style={row}>
                      <View style={cell}>
                        <Text style={metricName}>RSA</Text>
                        <Text style={metricVal(rsaVal != null)}>{rsaVal != null ? `${rsaVal}` : '--'}</Text>
                        <Text style={metricUnit}>ms</Text>
                      </View>
                      <View style={cell}>
                        <Text style={metricName}>Resp Rate</Text>
                        <Text style={metricVal(respVal != null)}>{respVal != null ? `${respVal}` : '--'}</Text>
                        <Text style={metricUnit}>br/min</Text>
                      </View>
                      <View style={cell}>
                        <Text style={metricName}>Stress (SI)</Text>
                        <Text style={metricVal(siVal != null)}>{siVal != null ? `${siVal}` : '--'}</Text>
                        {siInterp && <Text style={metricInterp(siColor)}>{siInterp}</Text>}
                      </View>
                    </View>
                    <View style={{ ...row, marginBottom: Spacing.sm }}>
                      <View style={cell}>
                        <Text style={metricName}>DC</Text>
                        <Text style={metricVal(dcVal != null)}>{dcVal != null ? `${dcVal}` : '--'}</Text>
                        {dcInterp && <Text style={metricInterp(dcColor)}>{dcInterp}</Text>}
                      </View>
                      <View style={cell}>
                        <Text style={metricName}>AC</Text>
                        <Text style={metricVal(dcac?.ac != null)}>{dcac?.ac != null ? `${dcac.ac}` : '--'}</Text>
                        <Text style={metricUnit}>ms</Text>
                      </View>
                      <View style={cell} />
                    </View>

                    {/* Signal Quality & Data Info */}
                    <Text style={sectionLabel}>Signal</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: Spacing.xs }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                        <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: qualityColor }} />
                        <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 11, color: qualityColor }}>{signal.label}</Text>
                        {fa && <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 10, color: Colors.textDim }}> ({fa.artifactRate}% artifacts)</Text>}
                      </View>
                      <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 10, color: Colors.textDim }}>
                        {fa ? `${fa.dataPoints} pts · ${Math.floor(fa.durationSeconds / 60)}m ${fa.durationSeconds % 60}s` : '--'}
                      </Text>
                    </View>
                  </View>
                );
              })()}
            </>
          )}
        </GlassCard>

        {/* Nervous System Timeline */}
        <GlassCard style={styles.timelineCard}>
          <Text style={styles.sectionTitle}>Nervous System Timeline</Text>
          {isConnected ? (
            <>
              <View style={styles.timelineBar}>
                {autonomicTimeline.map((segment) => (
                  <View
                    key={segment.hour}
                    style={[styles.timelineSegment, { backgroundColor: TIMELINE_COLORS[segment.state] }]}
                  />
                ))}
              </View>
              <View style={styles.timelineLabels}>
                <Text style={styles.timelineLabel}>12a</Text>
                <Text style={styles.timelineLabel}>6a</Text>
                <Text style={styles.timelineLabel}>12p</Text>
                <Text style={styles.timelineLabel}>6p</Text>
                <Text style={styles.timelineLabel}>Now</Text>
              </View>
            </>
          ) : (
            <View style={{ alignItems: 'center', paddingVertical: Spacing.lg }}>
              <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 13, color: Colors.textMuted, textAlign: 'center' }}>
                Data will appear after your first session
              </Text>
            </View>
          )}
          <View style={styles.timelineLegend}>
            {/* Keep legend always */}
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: TIMELINE_COLORS.sympathetic }]} />
              <Text style={styles.legendText}>Sympathetic</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: TIMELINE_COLORS.parasympathetic }]} />
              <Text style={styles.legendText}>Para</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: TIMELINE_COLORS.dorsal }]} />
              <Text style={styles.legendText}>Dorsal</Text>
            </View>
          </View>
        </GlassCard>

        {/* HRV Trend Chart */}
        {isConnected && rmssdHistory.length > 0 && (
        <GlassCard style={styles.chartCard}>
          <Text style={styles.chartLabel}>{isConnected ? 'Live RMSSD Trend' : 'Last 30 minutes'}</Text>
          <View style={styles.chartContainer}>
            <SparklineChart
              data={sparkData}
              width={SCREEN_WIDTH - 80}
              height={80}
              color={Colors.accent}
            />
          </View>
        </GlassCard>
        )}

        {/* Today's Summary */}
        <GlassCard style={styles.summaryCard}>
          <Text style={styles.sectionTitle}>Today's Summary</Text>
          <View style={styles.summaryGrid}>
            <View style={styles.summaryItem}>
              <Ionicons name="trending-up-outline" size={20} color={Colors.textMuted} />
              <Text style={styles.summaryLabel}>Avg RMSSD</Text>
              <Text style={styles.summaryValue}>--</Text>
            </View>
            <View style={styles.summaryItem}>
              <Ionicons name="flash-outline" size={20} color={Colors.textMuted} />
              <Text style={styles.summaryLabel}>Para Time</Text>
              <Text style={styles.summaryValue}>0m</Text>
            </View>
            <View style={styles.summaryItem}>
              <Ionicons name="clipboard-outline" size={20} color={Colors.textMuted} />
              <Text style={styles.summaryLabel}>Interventions</Text>
              <Text style={styles.summaryValue}>{interventions.filter(i => new Date(i.timestamp).toDateString() === new Date().toDateString()).length}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Ionicons name="moon-outline" size={20} color={Colors.textMuted} />
              <Text style={styles.summaryLabel}>Best</Text>
              <Text style={styles.summaryValue}>--</Text>
            </View>
          </View>
        </GlassCard>

        {/* Metrics Row with Trend Arrows */}
        {isConnected ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.metricsRow}
            style={styles.metricsScroll}
          >
            {mockMetrics.map((metric) => {
              const trend = trendArrows[metric.label];
              const arrow = trend ? TREND_ARROW_MAP[trend] : null;
              return (
                <TouchableOpacity key={metric.label} activeOpacity={0.7}>
                  <GlassCard style={styles.metricCard}>
                    <Ionicons name={metric.icon} size={18} color={metric.color} />
                    <View style={styles.metricValueRow}>
                      <Text style={styles.metricValue}>
                        {metric.value}
                        {metric.unit ? <Text style={styles.metricUnit}>{metric.unit}</Text> : null}
                      </Text>
                      {arrow ? (
                        <Text style={[styles.trendArrow, { color: arrow.color }]}>{arrow.symbol}</Text>
                      ) : null}
                    </View>
                    <Text style={styles.metricLabel}>{metric.label}</Text>
                  </GlassCard>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        ) : (
          <GlassCard style={{ marginBottom: Spacing.sm + 4, alignItems: 'center', paddingVertical: Spacing.md }}>
            <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 13, color: Colors.textMuted }}>Metrics appear when a device is connected</Text>
          </GlassCard>
        )}

        {/* Health Metrics */}
        <View style={styles.healthMetricsSection}>
          <View style={styles.healthMetricsHeader}>
            <Ionicons name="heart-half-outline" size={16} color={Colors.accent} />
            <View style={{ flex: 1 }}>
              <Text style={styles.healthMetricsTitle}>Health Metrics</Text>
              <Text style={styles.healthMetricsSubtitle}>From connected devices</Text>
            </View>
          </View>
        </View>
        {isConnected ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.healthMetricsRow}
            style={styles.healthMetricsScroll}
          >
            {/* SpO2 */}
            <TouchableOpacity activeOpacity={0.7}>
              <GlassCard style={styles.healthMetricCard}>
                <View style={styles.healthMetricTop}>
                  <View style={[styles.healthMetricDot, { backgroundColor: Colors.accent }]} />
                  <Text style={styles.healthMetricTag}>SpO2</Text>
                </View>
                <Text style={styles.healthMetricValue}>
                  {mockHealthMetrics.bloodOxygen.current}<Text style={styles.healthMetricUnit}>{mockHealthMetrics.bloodOxygen.unit}</Text>
                </Text>
                <Text style={styles.healthMetricLabel}>Blood Oxygen</Text>
                <Text style={styles.healthMetricSource}>{mockHealthMetrics.bloodOxygen.source}</Text>
              </GlassCard>
            </TouchableOpacity>

            {/* Glucose */}
            <TouchableOpacity activeOpacity={0.7}>
              <GlassCard style={styles.healthMetricCard}>
                <View style={styles.healthMetricTop}>
                  <Text style={[styles.healthMetricArrow, { color: '#f59e0b' }]}>{'\u2191'}</Text>
                  <Text style={styles.healthMetricTag}>CGM</Text>
                </View>
                <Text style={styles.healthMetricValue}>
                  {mockHealthMetrics.glucose.current}<Text style={styles.healthMetricUnit}> {mockHealthMetrics.glucose.unit}</Text>
                </Text>
                <Text style={styles.healthMetricLabel}>Glucose</Text>
                <Text style={styles.healthMetricSource}>{mockHealthMetrics.glucose.source}</Text>
              </GlassCard>
            </TouchableOpacity>

            {/* Resting HR */}
            <TouchableOpacity activeOpacity={0.7}>
              <GlassCard style={styles.healthMetricCard}>
                <View style={styles.healthMetricTop}>
                  <Text style={[styles.healthMetricArrow, { color: Colors.accent }]}>{'\u2193'}</Text>
                </View>
                <Text style={styles.healthMetricValue}>
                  {mockHealthMetrics.restingHR.current}<Text style={styles.healthMetricUnit}> {mockHealthMetrics.restingHR.unit}</Text>
                </Text>
                <Text style={styles.healthMetricLabel}>Resting HR</Text>
                <Text style={styles.healthMetricSource}>{mockHealthMetrics.restingHR.source}</Text>
              </GlassCard>
            </TouchableOpacity>

            {/* Body Temp */}
            <TouchableOpacity activeOpacity={0.7}>
              <GlassCard style={styles.healthMetricCard}>
                <View style={styles.healthMetricTop}>
                  <Text style={[styles.healthMetricArrow, { color: Colors.textMuted }]}>{'\u2192'}</Text>
                </View>
                <Text style={styles.healthMetricValue}>
                  {mockHealthMetrics.bodyTemp.current}<Text style={styles.healthMetricUnit}>{mockHealthMetrics.bodyTemp.unit}</Text>
                </Text>
                <Text style={styles.healthMetricLabel}>Temp</Text>
                <Text style={styles.healthMetricSource}>{mockHealthMetrics.bodyTemp.source}</Text>
              </GlassCard>
            </TouchableOpacity>

            {/* Respiratory Rate */}
            <TouchableOpacity activeOpacity={0.7}>
              <GlassCard style={styles.healthMetricCard}>
                <View style={styles.healthMetricTop}>
                  <Text style={[styles.healthMetricArrow, { color: Colors.textMuted }]}>{'\u2192'}</Text>
                </View>
                <Text style={styles.healthMetricValue}>
                  {mockHealthMetrics.respiratoryRate.current}<Text style={styles.healthMetricUnit}> {mockHealthMetrics.respiratoryRate.unit}</Text>
                </Text>
                <Text style={styles.healthMetricLabel}>Resp Rate</Text>
                <Text style={styles.healthMetricSource}>{mockHealthMetrics.respiratoryRate.source}</Text>
              </GlassCard>
            </TouchableOpacity>

            {/* Steps */}
            <TouchableOpacity activeOpacity={0.7}>
              <GlassCard style={styles.healthMetricCard}>
                <View style={styles.healthMetricTop}>
                  <Text style={[styles.healthMetricArrow, { color: Colors.accent }]}>{'\u2191'}</Text>
                </View>
                <Text style={styles.healthMetricValue}>
                  {mockHealthMetrics.steps.current.toLocaleString()}<Text style={styles.healthMetricUnit}> / {(mockHealthMetrics.steps.goal / 1000)}K</Text>
                </Text>
                <Text style={styles.healthMetricLabel}>Steps</Text>
                <Text style={styles.healthMetricSource}>{mockHealthMetrics.steps.source}</Text>
              </GlassCard>
            </TouchableOpacity>
          </ScrollView>
        ) : (
          <GlassCard style={{ marginBottom: Spacing.sm + 4, alignItems: 'center', paddingVertical: Spacing.lg }}>
            <Ionicons name="bluetooth-outline" size={24} color={Colors.textMuted} />
            <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 13, color: Colors.textMuted, marginTop: 8 }}>No devices connected</Text>
            <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 12, color: Colors.textDim, marginTop: 4 }}>All values: --</Text>
          </GlassCard>
        )}

        {/* Autonomic Balance Gauge */}
        <GlassCard style={styles.gaugeCard}>
          <Text style={styles.sectionTitle}>Autonomic Balance</Text>
          <View style={styles.gaugeContainer}>
            <View style={styles.gaugeBar}>
              <LinearGradient
                colors={['#ef4444', '#f59e0b', '#00d68f']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.gaugeGradient}
              />
              {/* Needle */}
              <View style={[styles.gaugeNeedle, { left: `${(isConnected ? gaugePosition : 0.5) * 100}%` }]}>
                <View style={styles.needleDot} />
              </View>
            </View>
            <View style={styles.gaugeLabels}>
              <Text style={[styles.gaugeLabel, { color: '#ef4444' }]}>Sympathetic</Text>
              {!isConnected && <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 11, color: Colors.textDim }}>No data yet</Text>}
              <Text style={[styles.gaugeLabel, { color: '#00d68f' }]}>Parasympathetic</Text>
            </View>
          </View>
        </GlassCard>

        {/* Body Battery Card */}
        <GlassCard style={styles.batteryCard}>
          <View style={styles.batteryHeader}>
            <Text style={styles.sectionTitle}>Body Battery</Text>
            <View style={styles.batteryCurrentRow}>
              <Text style={styles.batteryCurrentValue}>{isConnected ? currentBattery : '--'}</Text>
              <Text style={styles.batteryCurrentUnit}>{isConnected ? '%' : ''}</Text>
            </View>
          </View>
          {isConnected ? (
            <>
              <View style={styles.batteryChartContainer}>
                <Svg width={bbWidth} height={bbHeight + 10}>
                  <Polyline
                    points={bbPoints}
                    fill="none"
                    stroke={Colors.accent}
                    strokeWidth={2.5}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  {/* Current point dot */}
                  {bodyBattery.length > 0 && (
                    <Circle
                      cx={(bodyBattery.length - 1) / (bodyBattery.length - 1) * bbWidth}
                      cy={bbHeight - (currentBattery / 100) * bbHeight}
                      r={5}
                      fill={Colors.accent}
                    />
                  )}
                </Svg>
              </View>
              <View style={styles.batteryLabels}>
                <Text style={styles.batteryLabel}>6a</Text>
                <Text style={styles.batteryLabel}>9a</Text>
                <Text style={styles.batteryLabel}>12p</Text>
                <Text style={styles.batteryLabel}>3p</Text>
                <Text style={styles.batteryLabel}>Now</Text>
              </View>
            </>
          ) : (
            <View style={{ alignItems: 'center', paddingVertical: Spacing.lg }}>
              <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 13, color: Colors.textMuted, textAlign: 'center' }}>
                Tracking starts when you connect a device
              </Text>
            </View>
          )}
        </GlassCard>

        {/* "What Should I Do Right Now?" Button */}
        <TouchableOpacity
          style={styles.whatNowButton}
          activeOpacity={0.8}
          onPress={() => setShowRecommendation(!showRecommendation)}
        >
          <Ionicons name="bulb-outline" size={22} color={Colors.white} />
          <Text style={styles.whatNowText}>What Should I Do Right Now?</Text>
        </TouchableOpacity>

        {showRecommendation && (
          <GlassCard style={styles.recommendationCard}>
            <View style={styles.recommendationHeader}>
              <Ionicons name="sparkles-outline" size={16} color={Colors.accent} />
              <Text style={styles.recommendationLabel}>AI Recommendation</Text>
            </View>
            <Text style={styles.recommendationText}>
              Your LF/HF ratio is elevated. A 5-min box breathing session would bring you back to baseline.
            </Text>
            <TouchableOpacity
              style={styles.recommendationAction}
              onPress={() => router.push('/session')}
            >
              <Ionicons name="play-circle" size={18} color={Colors.accent} />
              <Text style={styles.recommendationActionText}>Start Now</Text>
            </TouchableOpacity>
          </GlassCard>
        )}

        {/* "I'm Flaring" Button */}
        <TouchableOpacity
          style={styles.flareButton}
          activeOpacity={0.8}
          onPress={() => router.push('/flare' as any)}
        >
          <Ionicons name="warning-outline" size={18} color="#ef4444" />
          <Text style={styles.flareButtonText}>I'm Flaring</Text>
        </TouchableOpacity>

        {/* Audio Sessions Button */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => router.push('/session')}
        >
          <GlassCard style={styles.sessionButton}>
            <View style={styles.sessionRow}>
              <View style={styles.sessionIcon}>
                <Ionicons name="headset-outline" size={24} color={Colors.purple} />
              </View>
              <View style={styles.sessionInfo}>
                <Text style={styles.sessionTitle}>Audio Sessions</Text>
                <Text style={styles.sessionDesc}>Binaural beats: Calm, Focus, Sleep, Recovery</Text>
              </View>
              <Ionicons name="play-circle" size={32} color={Colors.purple} />
            </View>
          </GlassCard>
        </TouchableOpacity>

        {/* Community Card */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => router.push('/social')}
        >
          <GlassCard style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.md, marginBottom: Spacing.sm + 4 }}>
            <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.purpleLight, alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name="people-outline" size={22} color={Colors.purple} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 14, color: Colors.text }}>Rapha Community</Text>
              <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 12, color: Colors.textMuted }}>Connect with friends and groups</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={Colors.textDim} />
          </GlassCard>
        </TouchableOpacity>

        {/* Active HRV Tracking */}
        {hrvTrackers.length > 0 && (
          <View style={{ marginBottom: Spacing.md }}>
            <Text style={styles.sectionTitle}>Tracking HRV Response</Text>
            {hrvTrackers.map((tracker) => (
              <GlassCard key={tracker.interventionId} style={{ marginBottom: Spacing.sm, padding: Spacing.md }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 15, color: Colors.text }}>{tracker.interventionName}</Text>
                  <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 12, color: Colors.accent }}>
                    {getNextCheck(tracker) ? `Next: ${getNextCheck(tracker)}` : 'Complete'}
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', marginTop: 10, gap: 6, alignItems: 'center' }}>
                  {['baseline', '2min', '5min', '10min', '30min', '1hr', '2hr'].map((label) => {
                    const snap = tracker.snapshots.find(s => s.label === label);
                    const isPending = tracker.pendingChecks.includes(label);
                    return (
                      <View key={label} style={{ alignItems: 'center', flex: 1 }}>
                        <View style={{
                          width: 10, height: 10, borderRadius: 5,
                          backgroundColor: snap ? Colors.accent : isPending ? 'transparent' : Colors.surfaceBorder,
                          borderWidth: isPending ? 1.5 : 0,
                          borderColor: isPending ? Colors.textDim : 'transparent',
                        }} />
                        <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 9, color: Colors.textDim, marginTop: 3 }}>
                          {label === 'baseline' ? 'Now' : label}
                        </Text>
                        {snap && tracker.baselineRmssd ? (
                          <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 9, color: snap.rmssd >= tracker.baselineRmssd ? '#00d68f' : '#ef4444', marginTop: 1 }}>
                            {snap.rmssd >= tracker.baselineRmssd ? '+' : ''}{(snap.rmssd - tracker.baselineRmssd).toFixed(1)}
                          </Text>
                        ) : null}
                      </View>
                    );
                  })}
                </View>
                {tracker.snapshots.length >= 2 && (
                  <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 12, color: Colors.textMuted, marginTop: 8 }}>
                    {getSummary(tracker)}
                  </Text>
                )}
              </GlassCard>
            ))}
          </View>
        )}

        {/* Notification Toasts */}
        {hrvNotifications.length > 0 && (
          <View style={{ position: 'absolute', top: 60, left: 16, right: 16, zIndex: 100 }}>
            {hrvNotifications.map((notif) => (
              <TouchableOpacity
                key={notif.id}
                onPress={() => dismissNotification(notif.id)}
                style={{ backgroundColor: '#12121a', borderWidth: 1, borderColor: Colors.accent, borderRadius: 12, padding: 12, marginBottom: 8, flexDirection: 'row', alignItems: 'center', gap: 10 }}
              >
                <Text style={{ fontSize: 18 }}>📊</Text>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 14, color: Colors.text }}>
                    {notif.interventionName} — {notif.label} check
                  </Text>
                  <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 13, color: notif.delta >= 0 ? '#00d68f' : '#ef4444' }}>
                    {notif.delta >= 0 ? '+' : ''}{notif.delta}ms from baseline ({notif.rmssd.toFixed(1)}ms)
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Recent Interventions */}
        <View style={styles.interventionsSection}>
          <Text style={styles.sectionTitle}>Recent Interventions</Text>
          {interventions.length > 0 ? (
            <GlassCard style={{ gap: Spacing.sm }}>
              {interventions.slice(0, 5).map((item) => (
                <View key={item.id} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 0.5, borderBottomColor: Colors.surfaceBorder }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 14, color: Colors.text }}>{item.name}</Text>
                    <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 12, color: Colors.textMuted }}>
                      {item.category} · {new Date(item.timestamp).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                    </Text>
                  </View>
                  {/* Mood / Stress / Energy indicators */}
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    {item.mood && (
                      <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: getMoodDotColor(item.mood) }} />
                    )}
                    {item.stressLevel != null && (
                      <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 10, color: Colors.textMuted }}>S:{item.stressLevel}</Text>
                    )}
                    {item.energyLevel != null && (
                      <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 10, color: Colors.textMuted }}>E:{item.energyLevel}</Text>
                    )}
                  </View>
                </View>
              ))}
            </GlassCard>
          ) : (
            <GlassCard style={{ alignItems: 'center', paddingVertical: Spacing.lg, gap: Spacing.sm }}>
              <Ionicons name="clipboard-outline" size={24} color={Colors.textMuted} />
              <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 13, color: Colors.textMuted, textAlign: 'center' }}>
                Log your first intervention to see it here
              </Text>
              <TouchableOpacity
                style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: Colors.accentLight, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: BorderRadius.full }}
                onPress={() => router.push('/log-intervention')}
                activeOpacity={0.7}
              >
                <Ionicons name="add-circle-outline" size={16} color={Colors.accent} />
                <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 13, color: Colors.accent }}>Log Intervention</Text>
              </TouchableOpacity>
            </GlassCard>
          )}
        </View>

        {/* Bottom spacing for tab bar + FAB */}
        <View style={{ height: 120 }} />
      </ScrollView>

      {/* FAB Menu Popup */}
      {showFabMenu && (
        <TouchableOpacity
          style={styles.fabOverlay}
          activeOpacity={1}
          onPress={() => setShowFabMenu(false)}
        >
          <View style={styles.fabMenuContainer}>
            <TouchableOpacity
              style={styles.fabMenuItem}
              onPress={() => {
                setShowFabMenu(false);
                router.push('/log-intervention');
              }}
              activeOpacity={0.7}
            >
              <Ionicons name="clipboard-outline" size={20} color={Colors.accent} />
              <Text style={styles.fabMenuText}>Log Intervention</Text>
            </TouchableOpacity>
            <View style={{ height: 1, backgroundColor: Colors.surfaceBorder }} />
            <TouchableOpacity
              style={styles.fabMenuItem}
              onPress={() => {
                setShowFabMenu(false);
                setShowMoodCheck(true);
              }}
              activeOpacity={0.7}
            >
              <Ionicons name="happy-outline" size={20} color={Colors.accent} />
              <Text style={styles.fabMenuText}>Quick Mood Check</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      )}

      {/* Floating Action Button — Purple */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setShowFabMenu(!showFabMenu)}
        activeOpacity={0.85}
      >
        <View style={styles.fabInner}>
          <Ionicons name={showFabMenu ? 'close' : 'add'} size={28} color={Colors.white} />
        </View>
      </TouchableOpacity>

      {/* Quick Mood Check-in Modal */}
      <Modal
        visible={showMoodCheck}
        transparent
        animationType="slide"
        onRequestClose={() => setShowMoodCheck(false)}
      >
        <View style={styles.moodModalOverlay}>
          <View style={styles.moodModalSheet}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.lg }}>
              <Text style={styles.moodModalTitle}>Quick Mood Check</Text>
              <TouchableOpacity onPress={() => setShowMoodCheck(false)}>
                <Ionicons name="close" size={24} color={Colors.textMuted} />
              </TouchableOpacity>
            </View>

            {/* Mood */}
            <Text style={styles.moodModalLabel}>How are you feeling?</Text>
            <View style={styles.moodModalRow}>
              {MOOD_CHECK_OPTIONS.map((m) => (
                <TouchableOpacity
                  key={m.key}
                  style={[
                    styles.moodModalPill,
                    moodCheckMood === m.key && styles.moodModalPillSelected,
                  ]}
                  onPress={() => setMoodCheckMood(moodCheckMood === m.key ? null : m.key)}
                  activeOpacity={0.7}
                >
                  <Text style={{ fontSize: 20 }}>{m.icon}</Text>
                  <Text style={[styles.moodModalPillText, moodCheckMood === m.key && { color: Colors.accent }]}>{m.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Stress */}
            <Text style={styles.moodModalLabel}>Stress Level</Text>
            <View style={styles.moodModalScaleRow}>
              {STRESS_LEVELS_DASH.map((s) => (
                <TouchableOpacity
                  key={s.value}
                  style={[
                    styles.moodModalCircle,
                    moodCheckStress === s.value && { backgroundColor: s.color, borderColor: s.color },
                  ]}
                  onPress={() => setMoodCheckStress(moodCheckStress === s.value ? null : s.value)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.moodModalCircleText, moodCheckStress === s.value && { color: '#fff' }]}>{s.value}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: 5 * 40 + 4 * Spacing.md, marginBottom: Spacing.md }}>
              <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 11, color: Colors.textDim }}>Calm</Text>
              <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 11, color: Colors.textDim }}>Intense</Text>
            </View>

            {/* Energy */}
            <Text style={styles.moodModalLabel}>Energy Level</Text>
            <View style={styles.moodModalScaleRow}>
              {ENERGY_LEVELS_DASH.map((e) => (
                <TouchableOpacity
                  key={e.value}
                  style={[
                    styles.moodModalCircle,
                    moodCheckEnergy === e.value && { backgroundColor: e.color, borderColor: e.color },
                  ]}
                  onPress={() => setMoodCheckEnergy(moodCheckEnergy === e.value ? null : e.value)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.moodModalCircleText, moodCheckEnergy === e.value && { color: '#fff' }]}>{e.value}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: 5 * 40 + 4 * Spacing.md, marginBottom: Spacing.lg }}>
              <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 11, color: Colors.textDim }}>Exhausted</Text>
              <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 11, color: Colors.textDim }}>Energized</Text>
            </View>

            {/* Save */}
            <TouchableOpacity
              style={[styles.moodModalSaveBtn, !moodCheckMood && !moodCheckStress && !moodCheckEnergy && { backgroundColor: Colors.surface }]}
              onPress={() => {
                addIntervention({
                  name: 'Mood Check-in',
                  category: 'other',
                  mood: moodCheckMood || undefined,
                  stressLevel: moodCheckStress || undefined,
                  energyLevel: moodCheckEnergy || undefined,
                });
                setMoodCheckMood(null);
                setMoodCheckStress(null);
                setMoodCheckEnergy(null);
                setShowMoodCheck(false);
              }}
              disabled={!moodCheckMood && !moodCheckStress && !moodCheckEnergy}
              activeOpacity={0.8}
            >
              <Text style={[styles.moodModalSaveBtnText, !moodCheckMood && !moodCheckStress && !moodCheckEnergy && { color: Colors.textDim }]}>
                Save Mood Check
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
    paddingHorizontal: Spacing.xs,
  },
  greeting: {
    fontFamily: 'Inter_700Bold',
    fontSize: FontSize.xxl,
    color: Colors.text,
  },
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Day-in-Review
  reviewWrapper: {
    marginBottom: Spacing.sm + 4,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  reviewGradientBorder: {
    padding: 1.5,
    borderRadius: BorderRadius.lg,
  },
  reviewInner: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg - 1,
    padding: Spacing.md,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: Spacing.sm,
  },
  reviewLabel: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: FontSize.sm,
    color: Colors.accent,
  },
  reviewText: {
    fontFamily: 'Inter_400Regular',
    fontSize: FontSize.md,
    color: Colors.text,
    lineHeight: 22,
  },
  // Verse of the Day
  verseCard: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    overflow: 'hidden',
    marginBottom: Spacing.sm + 4,
  },
  verseLeftBorder: {
    width: 3,
    backgroundColor: '#d4a574',
  },
  verseContent: {
    flex: 1,
    padding: Spacing.md,
  },
  verseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: Spacing.sm,
  },
  verseLabel: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: FontSize.sm,
    color: '#d4a574',
  },
  verseText: {
    fontFamily: 'Inter_400Regular',
    fontSize: FontSize.md,
    color: Colors.text,
    fontStyle: 'italic',
    lineHeight: 22,
    marginBottom: Spacing.sm,
  },
  verseReference: {
    fontFamily: 'Inter_500Medium',
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    marginBottom: Spacing.md,
  },
  verseActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  verseMeditateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.accentLight,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    borderRadius: BorderRadius.full,
  },
  verseMeditateText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: FontSize.xs,
    color: Colors.accent,
  },
  verseBibleLink: {
    fontFamily: 'Inter_500Medium',
    fontSize: FontSize.xs,
    color: '#d4a574',
    textDecorationLine: 'underline',
  },
  // HRV Card
  hrvCard: {
    marginBottom: Spacing.sm + 4,
    alignItems: 'center' as const,
  },
  hrvLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: Spacing.sm,
  },
  liveHrvText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: FontSize.sm,
    color: Colors.accent,
  },
  hrvMain: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
  },
  hrvValue: {
    fontFamily: 'Inter_700Bold',
    fontSize: FontSize.hero,
    color: Colors.text,
    letterSpacing: -2,
  },
  hrvUnit: {
    fontFamily: 'Inter_400Regular',
    fontSize: FontSize.xl,
    color: Colors.textMuted,
    marginLeft: 4,
  },
  hrvSecondary: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.md,
    marginTop: Spacing.xs,
  },
  bpmText: {
    fontFamily: 'Inter_400Regular',
    fontSize: FontSize.sm,
    color: Colors.textMuted,
  },
  parasymBadge: {
    backgroundColor: Colors.accentLight,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    borderRadius: BorderRadius.full,
  },
  parasymText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: FontSize.xs,
    color: Colors.accent,
  },
  // Timeline
  timelineCard: {
    marginBottom: Spacing.sm + 4,
  },
  timelineBar: {
    flexDirection: 'row',
    height: 20,
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: Spacing.sm,
  },
  timelineSegment: {
    flex: 1,
  },
  timelineLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  timelineLabel: {
    fontFamily: 'Inter_400Regular',
    fontSize: FontSize.xs,
    color: Colors.textDim,
  },
  timelineLegend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.md,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontFamily: 'Inter_400Regular',
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },
  // Chart
  chartCard: {
    marginBottom: Spacing.sm + 4,
  },
  chartLabel: {
    fontFamily: 'Inter_400Regular',
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    marginBottom: Spacing.sm,
  },
  chartContainer: {
    alignItems: 'center',
  },
  // Summary
  summaryCard: {
    marginBottom: Spacing.sm + 4,
  },
  sectionTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: FontSize.md,
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  summaryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryItem: {
    alignItems: 'center',
    flex: 1,
    gap: 4,
  },
  summaryLabel: {
    fontFamily: 'Inter_400Regular',
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    textAlign: 'center',
  },
  summaryValue: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: FontSize.sm,
    color: Colors.text,
    textAlign: 'center',
  },
  // Metrics
  metricsScroll: {
    marginHorizontal: -Spacing.md,
    marginBottom: Spacing.sm + 4,
  },
  metricsRow: {
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
  },
  metricCard: {
    width: 100,
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
    gap: 4,
  },
  metricValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  metricValue: {
    fontFamily: 'Inter_700Bold',
    fontSize: FontSize.xl,
    color: Colors.text,
  },
  metricUnit: {
    fontFamily: 'Inter_400Regular',
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },
  metricLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },
  trendArrow: {
    fontFamily: 'Inter_700Bold',
    fontSize: FontSize.md,
  },
  // Health Metrics
  healthMetricsSection: {
    marginBottom: Spacing.sm,
  },
  healthMetricsHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.xs,
  },
  healthMetricsTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: FontSize.md,
    color: Colors.text,
  },
  healthMetricsSubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    marginTop: 2,
  },
  healthMetricsScroll: {
    marginHorizontal: -Spacing.md,
    marginBottom: Spacing.sm + 4,
  },
  healthMetricsRow: {
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
  },
  healthMetricCard: {
    width: 110,
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
    gap: 2,
  },
  healthMetricTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  healthMetricDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  healthMetricTag: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: FontSize.xs - 2,
    color: Colors.textMuted,
    backgroundColor: Colors.surfaceLight,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  healthMetricArrow: {
    fontFamily: 'Inter_700Bold',
    fontSize: FontSize.sm,
  },
  healthMetricValue: {
    fontFamily: 'Inter_700Bold',
    fontSize: FontSize.lg,
    color: Colors.text,
  },
  healthMetricUnit: {
    fontFamily: 'Inter_400Regular',
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },
  healthMetricLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },
  healthMetricSource: {
    fontFamily: 'Inter_400Regular',
    fontSize: FontSize.xs - 2,
    color: Colors.textDim,
    marginTop: 2,
  },
  // Gauge
  gaugeCard: {
    marginBottom: Spacing.sm + 4,
  },
  gaugeContainer: {
    alignItems: 'center',
  },
  gaugeBar: {
    width: '100%',
    height: 16,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  gaugeGradient: {
    flex: 1,
    borderRadius: 8,
  },
  gaugeNeedle: {
    position: 'absolute',
    top: -4,
    marginLeft: -10,
    alignItems: 'center',
  },
  needleDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.white,
    borderWidth: 3,
    borderColor: Colors.background,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  gaugeLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: Spacing.sm + 4,
  },
  gaugeLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: FontSize.xs,
  },
  // Body Battery
  batteryCard: {
    marginBottom: Spacing.sm + 4,
  },
  batteryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  batteryCurrentRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  batteryCurrentValue: {
    fontFamily: 'Inter_700Bold',
    fontSize: FontSize.xxl,
    color: Colors.accent,
  },
  batteryCurrentUnit: {
    fontFamily: 'Inter_400Regular',
    fontSize: FontSize.md,
    color: Colors.accent,
    marginLeft: 2,
  },
  batteryChartContainer: {
    alignItems: 'center',
  },
  batteryLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    marginTop: 4,
  },
  batteryLabel: {
    fontFamily: 'Inter_400Regular',
    fontSize: FontSize.xs,
    color: Colors.textDim,
  },
  // What Now Button
  whatNowButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.accent,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.xl,
    gap: Spacing.sm,
    marginBottom: Spacing.sm + 4,
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  whatNowText: {
    fontFamily: 'Inter_700Bold',
    fontSize: FontSize.md,
    color: Colors.white,
  },
  // Flare Button
  flareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    paddingVertical: Spacing.sm + 4,
    borderRadius: BorderRadius.xl,
    gap: Spacing.sm,
    marginBottom: Spacing.sm + 4,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  flareButtonText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: FontSize.sm,
    color: '#ef4444',
  },
  // Sessions
  sessionButton: {
    marginBottom: Spacing.sm + 4,
  },
  sessionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  sessionIcon: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.purpleLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sessionInfo: {
    flex: 1,
  },
  sessionTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: FontSize.md,
    color: Colors.text,
  },
  sessionDesc: {
    fontFamily: 'Inter_400Regular',
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    marginTop: 2,
  },
  // Interventions
  interventionsSection: {
    marginTop: Spacing.xs,
  },
  interventionCard: {
    marginBottom: Spacing.sm,
  },
  interventionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  interventionInfo: {
    flex: 1,
  },
  interventionNameRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  interventionName: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: FontSize.md,
    color: Colors.text,
  },
  interventionDose: {
    fontFamily: 'Inter_400Regular',
    fontSize: FontSize.sm,
    color: Colors.textMuted,
  },
  interventionTime: {
    fontFamily: 'Inter_400Regular',
    fontSize: FontSize.xs,
    color: Colors.textDim,
    marginTop: 2,
  },
  interventionDelta: {
    fontFamily: 'Inter_700Bold',
    fontSize: FontSize.md,
    marginLeft: Spacing.md,
  },
  // Readiness
  readinessCard: {
    marginBottom: Spacing.sm + 4,
  },
  readinessRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  readinessScoreContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(212, 165, 116, 0.15)',
    borderWidth: 2,
    borderColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  readinessScore: {
    fontFamily: 'Inter_700Bold',
    fontSize: FontSize.xl,
    color: Colors.accent,
  },
  readinessInfo: {
    flex: 1,
  },
  readinessLabel: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: FontSize.sm,
    color: Colors.text,
  },
  readinessRec: {
    fontFamily: 'Inter_400Regular',
    fontSize: FontSize.xs,
    color: Colors.accent,
    marginTop: 2,
  },
  readinessIndicator: {
    marginLeft: Spacing.sm,
  },
  // Recommendation
  recommendationCard: {
    marginBottom: Spacing.sm + 4,
    borderWidth: 1,
    borderColor: 'rgba(212, 165, 116, 0.2)',
  },
  recommendationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: Spacing.sm,
  },
  recommendationLabel: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: FontSize.sm,
    color: Colors.accent,
  },
  recommendationText: {
    fontFamily: 'Inter_400Regular',
    fontSize: FontSize.md,
    color: Colors.text,
    lineHeight: 22,
    marginBottom: Spacing.md,
  },
  recommendationAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(212, 165, 116, 0.12)',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  recommendationActionText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: FontSize.sm,
    color: Colors.accent,
  },
  // Get Started Card
  getStartedCard: {
    alignItems: 'center' as const,
    paddingVertical: Spacing.xl,
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  getStartedTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: FontSize.xl,
    color: Colors.text,
    marginTop: Spacing.sm,
  },
  getStartedText: {
    fontFamily: 'Inter_400Regular',
    fontSize: FontSize.md,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 22,
  },
  getStartedScanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.accent,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.xl,
    marginTop: Spacing.sm,
  },
  getStartedScanText: {
    fontFamily: 'Inter_700Bold',
    fontSize: FontSize.md,
    color: Colors.background,
  },
  getStartedDemoToggle: {
    fontFamily: 'Inter_500Medium',
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    textDecorationLine: 'underline' as const,
    marginTop: Spacing.sm,
  },
  // Demo Badge
  demoBadge: {
    marginBottom: Spacing.sm,
  },
  demoBadgeInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: 'rgba(245,158,11,0.1)',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(245,158,11,0.25)',
  },
  demoBadgeText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: FontSize.xs,
    color: '#f59e0b',
  },
  demoBadgeLink: {
    fontFamily: 'Inter_500Medium',
    fontSize: FontSize.xs,
    color: Colors.accent,
    textDecorationLine: 'underline' as const,
    marginLeft: Spacing.sm,
  },
  // FAB
  fab: {
    position: 'absolute',
    right: Spacing.lg,
    bottom: 110,
    zIndex: 20,
    ...Shadows.glow,
  },
  fabInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.purple,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(108, 92, 231, 0.4)',
  },
  fabOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 15,
  },
  fabMenuContainer: {
    position: 'absolute',
    right: Spacing.lg,
    bottom: 180,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    overflow: 'hidden',
    minWidth: 200,
    ...Shadows.card,
  },
  fabMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
  },
  fabMenuText: {
    fontFamily: 'Inter_500Medium',
    fontSize: FontSize.md,
    color: Colors.text,
  },
  // Mood check-in modal
  moodModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  moodModalSheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  moodModalTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: FontSize.xl,
    color: Colors.text,
  },
  moodModalLabel: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    marginBottom: Spacing.sm,
  },
  moodModalRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  moodModalPill: {
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    borderColor: Colors.surfaceBorder,
    backgroundColor: Colors.background,
    minWidth: 60,
  },
  moodModalPillSelected: {
    borderColor: Colors.accent,
    backgroundColor: Colors.accentLight,
  },
  moodModalPillText: {
    fontFamily: 'Inter_500Medium',
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },
  moodModalScaleRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.xs,
  },
  moodModalCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: Colors.surfaceBorder,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moodModalCircleText: {
    fontFamily: 'Inter_700Bold',
    fontSize: FontSize.md,
    color: Colors.textMuted,
  },
  moodModalSaveBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.accent,
    paddingVertical: Spacing.md + 2,
    borderRadius: BorderRadius.lg,
  },
  moodModalSaveBtnText: {
    fontFamily: 'Inter_700Bold',
    fontSize: FontSize.md,
    color: Colors.white,
  },
});
