import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Rect } from 'react-native-svg';
import GlassCard from '../../components/GlassCard';
import { Colors, FontSize, Spacing, BorderRadius } from '../../constants/theme';
import {
  mockTopInterventions,
  mockSleepData,
  mockWeeklyReport,
} from '../../constants/mockData';

function InterventionBar({
  name,
  avgDelta,
  observations,
  confidence,
  maxDelta,
}: {
  name: string;
  avgDelta: number;
  observations: number;
  confidence: number;
  maxDelta: number;
}) {
  const isPositive = avgDelta >= 0;
  const barWidth = Math.abs(avgDelta) / maxDelta;
  const barColor = isPositive ? Colors.accent : Colors.negative;
  const icon = isPositive ? 'trending-up-outline' : 'trending-down-outline';

  return (
    <View style={styles.barContainer}>
      <View style={styles.barHeader}>
        <View style={styles.barNameRow}>
          <Ionicons name={icon as any} size={14} color={barColor} />
          <Text style={styles.barName}>{name}</Text>
        </View>
        <Text style={[styles.barDelta, { color: barColor }]}>
          {isPositive ? '+' : ''}{avgDelta.toFixed(1)}ms
        </Text>
      </View>
      <View style={styles.barTrack}>
        <View
          style={[
            styles.barFill,
            {
              width: `${barWidth * 100}%`,
              backgroundColor: barColor,
            },
          ]}
        />
      </View>
      <View style={styles.barMeta}>
        <Text style={styles.barMetaText}>{observations} observations</Text>
        <Text style={styles.barMetaText}>{Math.round(confidence * 100)}% confidence</Text>
      </View>
    </View>
  );
}

function SleepBarChart({ data, labels }: { data: number[]; labels: string[] }) {
  const max = Math.max(...data);
  const barWidth = 28;
  const chartHeight = 80;
  const gap = 8;

  return (
    <View style={styles.sleepChart}>
      <Svg width={data.length * (barWidth + gap)} height={chartHeight + 20}>
        {data.map((val, i) => {
          const barH = (val / max) * chartHeight;
          const isLast = i === data.length - 1;
          return (
            <React.Fragment key={i}>
              <Rect
                x={i * (barWidth + gap)}
                y={chartHeight - barH}
                width={barWidth}
                height={barH}
                rx={4}
                fill={isLast ? Colors.purple : 'rgba(108, 92, 231, 0.25)'}
              />
            </React.Fragment>
          );
        })}
      </Svg>
      <View style={styles.sleepLabels}>
        {labels.map((label, i) => (
          <Text key={i} style={[styles.sleepLabel, { width: barWidth + gap }]}>{label}</Text>
        ))}
      </View>
    </View>
  );
}

export default function InsightsScreen() {
  const [selectedPeriod, setSelectedPeriod] = useState('This Week');
  const maxDelta = Math.max(...mockTopInterventions.map((i) => Math.abs(i.avgDelta)));

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.headerRow}>
          <Text style={styles.pageTitle}>Insights</Text>
          <TouchableOpacity style={styles.periodPill}>
            <Text style={styles.periodPillText}>This Week</Text>
          </TouchableOpacity>
        </View>

        {/* Top Interventions */}
        <View style={styles.topSection}>
          <View style={styles.topHeaderRow}>
            <Ionicons name="bar-chart-outline" size={16} color={Colors.purple} />
            <Text style={styles.topHeaderText}>Top Interventions</Text>
          </View>

          <GlassCard style={styles.interventionsCard}>
            {mockTopInterventions.map((intervention) => (
              <InterventionBar
                key={intervention.name}
                name={intervention.name}
                avgDelta={intervention.avgDelta}
                observations={intervention.observations}
                confidence={intervention.confidence}
                maxDelta={maxDelta}
              />
            ))}
          </GlassCard>
        </View>

        {/* Sleep Analysis */}
        <View style={styles.sleepSection}>
          <View style={styles.topHeaderRow}>
            <Ionicons name="moon-outline" size={16} color={Colors.textMuted} />
            <Text style={styles.sleepHeaderText}>Sleep Analysis</Text>
          </View>

          <GlassCard style={styles.sleepCard}>
            <View style={styles.sleepTopRow}>
              <View>
                <Text style={styles.sleepSubLabel}>Last Night</Text>
                <View style={styles.sleepValueRow}>
                  <Text style={styles.sleepBigValue}>{mockSleepData.lastNightRmssd}</Text>
                  <Text style={styles.sleepUnit}>ms avg</Text>
                </View>
              </View>
              <View style={styles.scoreBox}>
                <Text style={styles.scoreLabel}>Score</Text>
                <Text style={styles.scoreValue}>{mockSleepData.sleepScore}</Text>
              </View>
            </View>

            <Text style={styles.trendLabel}>7-Day Trend</Text>
            <SleepBarChart data={mockSleepData.weeklyTrend} labels={mockSleepData.weekLabels} />
          </GlassCard>
        </View>

        {/* Weekly Report */}
        <View style={styles.reportSection}>
          <Text style={styles.reportTitle}>Weekly Report</Text>
          <GlassCard style={styles.reportCard}>
            <Text style={styles.reportNarrative}>{mockWeeklyReport.narrative}</Text>
            {mockWeeklyReport.topHelpers.map((item, i) => (
              <View key={i} style={styles.reportBullet}>
                <Text style={styles.bulletDot}>•</Text>
                <Text style={styles.reportBulletText}>{item}</Text>
              </View>
            ))}
            <Text style={styles.reportGenerated}>Generated {mockWeeklyReport.generatedDate}</Text>
          </GlassCard>
        </View>

        {/* Deep Metrics Placeholder */}
        <GlassCard style={styles.deepMetrics}>
          <View style={styles.deepMetricsRow}>
            <Ionicons name="lock-closed-outline" size={18} color={Colors.purple} />
            <Text style={styles.deepMetricsText}>Deep Metrics</Text>
            <View style={styles.proBadge}>
              <Text style={styles.proBadgeText}>Pro</Text>
            </View>
          </View>
          <Text style={styles.deepMetricsDesc}>
            Poincare plot, frequency spectrum, and DFA trend analysis
          </Text>
        </GlassCard>

        {/* Community Insights */}
        <GlassCard style={styles.communityCard}>
          <View style={styles.communityRow}>
            <Ionicons name="people-outline" size={18} color={Colors.accent} />
            <Text style={styles.communityTitle}>Discover</Text>
          </View>
          <Text style={styles.communityDesc}>
            See what interventions work best across the Rapha AI community. Opt-in in Settings.
          </Text>
          <TouchableOpacity style={styles.enableButton}>
            <Text style={styles.enableText}>Enable Community Insights</Text>
          </TouchableOpacity>
        </GlassCard>

        <View style={{ height: 120 }} />
      </ScrollView>
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
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
    paddingHorizontal: Spacing.xs,
  },
  pageTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: FontSize.xxl,
    color: Colors.text,
  },
  periodPill: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    backgroundColor: Colors.surface,
  },
  periodPillText: {
    fontFamily: 'Inter_500Medium',
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },
  topSection: {
    marginBottom: Spacing.md,
  },
  topHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
    paddingHorizontal: Spacing.xs,
  },
  topHeaderText: {
    fontFamily: 'Inter_500Medium',
    fontSize: FontSize.sm,
    color: Colors.textMuted,
  },
  interventionsCard: {
    // no extra margin
  },
  barContainer: {
    marginBottom: Spacing.md,
  },
  barHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  barNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  barName: {
    fontFamily: 'Inter_500Medium',
    fontSize: FontSize.sm,
    color: Colors.text,
  },
  barDelta: {
    fontFamily: 'Inter_700Bold',
    fontSize: FontSize.sm,
  },
  barTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    marginBottom: 4,
  },
  barFill: {
    height: '100%',
    borderRadius: 3,
  },
  barMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  barMetaText: {
    fontFamily: 'Inter_400Regular',
    fontSize: FontSize.xs,
    color: Colors.textDim,
  },
  sleepSection: {
    marginBottom: Spacing.md,
  },
  sleepHeaderText: {
    fontFamily: 'Inter_500Medium',
    fontSize: FontSize.sm,
    color: Colors.textMuted,
  },
  sleepCard: {},
  sleepTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  sleepSubLabel: {
    fontFamily: 'Inter_400Regular',
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    marginBottom: 4,
  },
  sleepValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  sleepBigValue: {
    fontFamily: 'Inter_700Bold',
    fontSize: 42,
    color: Colors.text,
    letterSpacing: -1,
  },
  sleepUnit: {
    fontFamily: 'Inter_400Regular',
    fontSize: FontSize.sm,
    color: Colors.textMuted,
  },
  scoreBox: {
    backgroundColor: Colors.purpleLight,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm + 2,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(108, 92, 231, 0.2)',
  },
  scoreLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: FontSize.xs,
    color: Colors.purple,
    marginBottom: 2,
  },
  scoreValue: {
    fontFamily: 'Inter_700Bold',
    fontSize: FontSize.xxl,
    color: Colors.purple,
  },
  trendLabel: {
    fontFamily: 'Inter_400Regular',
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    marginBottom: Spacing.sm,
  },
  sleepChart: {
    alignItems: 'center',
  },
  sleepLabels: {
    flexDirection: 'row',
    marginTop: 4,
  },
  sleepLabel: {
    fontFamily: 'Inter_400Regular',
    fontSize: FontSize.xs - 1,
    color: Colors.textDim,
    textAlign: 'center',
  },
  reportSection: {
    marginBottom: Spacing.md,
  },
  reportTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: FontSize.md,
    color: Colors.text,
    marginBottom: Spacing.sm,
    paddingHorizontal: Spacing.xs,
  },
  reportCard: {},
  reportNarrative: {
    fontFamily: 'Inter_400Regular',
    fontSize: FontSize.md,
    color: Colors.text,
    lineHeight: 24,
    marginBottom: Spacing.md,
  },
  reportBullet: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.xs + 2,
  },
  bulletDot: {
    fontFamily: 'Inter_400Regular',
    fontSize: FontSize.md,
    color: Colors.textMuted,
    lineHeight: 20,
  },
  reportBulletText: {
    fontFamily: 'Inter_400Regular',
    fontSize: FontSize.sm,
    color: Colors.text,
    flex: 1,
    lineHeight: 20,
  },
  reportGenerated: {
    fontFamily: 'Inter_400Regular',
    fontSize: FontSize.xs,
    color: Colors.accent,
    marginTop: Spacing.md,
  },
  deepMetrics: {
    marginBottom: Spacing.md,
  },
  deepMetricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: 6,
  },
  deepMetricsText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: FontSize.md,
    color: Colors.text,
    flex: 1,
  },
  proBadge: {
    backgroundColor: Colors.purpleLight,
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(108, 92, 231, 0.3)',
  },
  proBadgeText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: FontSize.xs - 1,
    color: Colors.purple,
  },
  deepMetricsDesc: {
    fontFamily: 'Inter_400Regular',
    fontSize: FontSize.sm,
    color: Colors.textMuted,
  },
  communityCard: {
    marginBottom: Spacing.md,
  },
  communityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: 6,
  },
  communityTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: FontSize.md,
    color: Colors.text,
  },
  communityDesc: {
    fontFamily: 'Inter_400Regular',
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    lineHeight: 20,
    marginBottom: Spacing.md,
  },
  enableButton: {
    backgroundColor: Colors.accentLight,
    paddingVertical: Spacing.sm + 2,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.accent,
    alignSelf: 'flex-start',
  },
  enableText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: FontSize.sm,
    color: Colors.accent,
  },
});
