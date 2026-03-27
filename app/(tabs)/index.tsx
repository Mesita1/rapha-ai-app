import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Linking,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Polyline, Line, Circle, Text as SvgText } from 'react-native-svg';
import GlassCard from '../../components/GlassCard';
import SparklineChart from '../../components/SparklineChart';
import { Colors, FontSize, Spacing, BorderRadius, Shadows } from '../../constants/theme';
import {
  mockUser,
  mockCurrentHRV,
  mockSparklineData,
  mockMetrics,
  mockTodaySummary,
  mockRecentInterventions,
  dayInReview,
  autonomicTimeline,
  bodyBattery,
  trendArrows,
  mockAthleteInsights,
  mockHealthMetrics,
} from '../../constants/mockData';
import { getVerseOfTheDay } from '../../constants/scriptureData';

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

export default function DashboardScreen() {
  const [showRecommendation, setShowRecommendation] = useState(false);
  const verseOfTheDay = getVerseOfTheDay();

  // Autonomic balance: count sympathetic vs parasympathetic hours for gauge position
  const symCount = autonomicTimeline.filter((s) => s.state === 'sympathetic').length;
  const paraCount = autonomicTimeline.filter((s) => s.state === 'parasympathetic').length;
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
          <Text style={styles.greeting}>Hi, {mockUser.firstName}</Text>
          <TouchableOpacity
            style={styles.settingsButton}
            onPress={() => router.push('/(tabs)/settings')}
          >
            <Ionicons name="settings-outline" size={22} color={Colors.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Day-in-Review Card */}
        <View style={styles.reviewWrapper}>
          <LinearGradient
            colors={['rgba(14,168,122,0.25)', 'rgba(108,92,231,0.25)', 'rgba(14,168,122,0.15)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.reviewGradientBorder}
          >
            <View style={styles.reviewInner}>
              <View style={styles.reviewHeader}>
                <Ionicons name="sparkles-outline" size={16} color={Colors.accent} />
                <Text style={styles.reviewLabel}>Day in Review</Text>
              </View>
              <Text style={styles.reviewText}>{dayInReview}</Text>
            </View>
          </LinearGradient>
        </View>

        {/* Verse of the Day Card */}
        <View style={styles.verseCard}>
          <View style={styles.verseLeftBorder} />
          <View style={styles.verseContent}>
            <View style={styles.verseHeader}>
              <Ionicons name="book-outline" size={14} color="#d4a574" />
              <Text style={styles.verseLabel}>Verse of the Day</Text>
            </View>
            <Text style={styles.verseText}>"{verseOfTheDay.text}"</Text>
            <Text style={styles.verseReference}>{verseOfTheDay.reference} — {verseOfTheDay.translation}</Text>
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
        <GlassCard style={styles.readinessCard}>
          <View style={styles.readinessRow}>
            <View style={styles.readinessScoreContainer}>
              <Text style={styles.readinessScore}>{mockAthleteInsights.preWorkout.readiness}</Text>
            </View>
            <View style={styles.readinessInfo}>
              <Text style={styles.readinessLabel}>Readiness</Text>
              <Text style={styles.readinessRec}>Green light for high intensity</Text>
            </View>
            <View style={styles.readinessIndicator}>
              <Ionicons name="checkmark-circle" size={20} color={Colors.accent} />
            </View>
          </View>
        </GlassCard>

        {/* Live HRV Card */}
        <GlassCard style={styles.hrvCard} glowColor={Colors.accent}>
          <View style={styles.hrvLabelRow}>
            <Ionicons name="heart" size={16} color={Colors.accent} />
            <Text style={styles.liveHrvText}>Live HRV</Text>
          </View>

          <View style={styles.hrvMain}>
            <Text style={styles.hrvValue}>{mockCurrentHRV.rmssd}</Text>
            <Text style={styles.hrvUnit}>ms</Text>
          </View>

          <View style={styles.hrvSecondary}>
            <Text style={styles.bpmText}>{mockCurrentHRV.heartRate} bpm</Text>
            <View style={styles.parasymBadge}>
              <Text style={styles.parasymText}>Parasympathetic</Text>
            </View>
          </View>
        </GlassCard>

        {/* Nervous System Timeline */}
        <GlassCard style={styles.timelineCard}>
          <Text style={styles.sectionTitle}>Nervous System Timeline</Text>
          <View style={styles.timelineBar}>
            {autonomicTimeline.map((segment) => (
              <View
                key={segment.hour}
                style={[
                  styles.timelineSegment,
                  { backgroundColor: TIMELINE_COLORS[segment.state] },
                ]}
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
          <View style={styles.timelineLegend}>
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
        <GlassCard style={styles.chartCard}>
          <Text style={styles.chartLabel}>Last 30 minutes</Text>
          <View style={styles.chartContainer}>
            <SparklineChart
              data={mockSparklineData}
              width={SCREEN_WIDTH - 80}
              height={80}
              color={Colors.accent}
            />
          </View>
        </GlassCard>

        {/* Today's Summary */}
        <GlassCard style={styles.summaryCard}>
          <Text style={styles.sectionTitle}>Today's Summary</Text>
          <View style={styles.summaryGrid}>
            <View style={styles.summaryItem}>
              <Ionicons name="trending-up-outline" size={20} color={Colors.textMuted} />
              <Text style={styles.summaryLabel}>Avg RMSSD</Text>
              <Text style={styles.summaryValue}>{mockTodaySummary.avgRmssd} ms</Text>
            </View>
            <View style={styles.summaryItem}>
              <Ionicons name="flash-outline" size={20} color={Colors.textMuted} />
              <Text style={styles.summaryLabel}>Para Time</Text>
              <Text style={styles.summaryValue}>{mockTodaySummary.paraTime}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Ionicons name="clipboard-outline" size={20} color={Colors.textMuted} />
              <Text style={styles.summaryLabel}>Interventions</Text>
              <Text style={styles.summaryValue}>{mockTodaySummary.interventionCount}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Ionicons name="moon-outline" size={20} color={Colors.textMuted} />
              <Text style={styles.summaryLabel}>Best</Text>
              <Text style={styles.summaryValue}>{mockTodaySummary.bestIntervention}{'\n'}({mockTodaySummary.bestDelta})</Text>
            </View>
          </View>
        </GlassCard>

        {/* Metrics Row with Trend Arrows */}
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
              <View style={[styles.gaugeNeedle, { left: `${gaugePosition * 100}%` }]}>
                <View style={styles.needleDot} />
              </View>
            </View>
            <View style={styles.gaugeLabels}>
              <Text style={[styles.gaugeLabel, { color: '#ef4444' }]}>Sympathetic</Text>
              <Text style={[styles.gaugeLabel, { color: '#00d68f' }]}>Parasympathetic</Text>
            </View>
          </View>
        </GlassCard>

        {/* Body Battery Card */}
        <GlassCard style={styles.batteryCard}>
          <View style={styles.batteryHeader}>
            <Text style={styles.sectionTitle}>Body Battery</Text>
            <View style={styles.batteryCurrentRow}>
              <Text style={styles.batteryCurrentValue}>{currentBattery}</Text>
              <Text style={styles.batteryCurrentUnit}>%</Text>
            </View>
          </View>
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

        {/* Recent Interventions */}
        <View style={styles.interventionsSection}>
          <Text style={styles.sectionTitle}>Recent Interventions</Text>
          {mockRecentInterventions.map((item) => {
            const isPositive = item.rmssdDelta >= 0;
            return (
              <GlassCard key={item.id} style={styles.interventionCard}>
                <View style={styles.interventionRow}>
                  <View style={styles.interventionInfo}>
                    <View style={styles.interventionNameRow}>
                      <Text style={styles.interventionName}>{item.name}</Text>
                      <Text style={styles.interventionDose}>  {item.dose}</Text>
                    </View>
                    <Text style={styles.interventionTime}>{item.timestamp}</Text>
                  </View>
                  <Text style={[styles.interventionDelta, { color: isPositive ? Colors.positive : Colors.negative }]}>
                    {isPositive ? '+' : ''}{item.rmssdDelta}ms
                  </Text>
                </View>
              </GlassCard>
            );
          })}
        </View>

        {/* Bottom spacing for tab bar + FAB */}
        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Floating Action Button — Purple */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/log-intervention')}
        activeOpacity={0.85}
      >
        <View style={styles.fabInner}>
          <Ionicons name="add" size={28} color={Colors.white} />
        </View>
      </TouchableOpacity>
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
    backgroundColor: 'rgba(14, 168, 122, 0.15)',
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
    borderColor: 'rgba(14, 168, 122, 0.2)',
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
    backgroundColor: 'rgba(14, 168, 122, 0.12)',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  recommendationActionText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: FontSize.sm,
    color: Colors.accent,
  },
  // FAB
  fab: {
    position: 'absolute',
    right: Spacing.lg,
    bottom: 110,
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
});
