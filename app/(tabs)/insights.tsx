import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import GlassCard from '../../components/GlassCard';
import { Colors, FontSize, Spacing, BorderRadius } from '../../constants/theme';
import {
  mockTopInterventions,
  mockSleepData,
  mockWeeklyReport,
} from '../../constants/mockData';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const timePeriods = ['This Week', 'This Month', 'All Time'];

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
  const barColor = isPositive ? Colors.accent : Colors.alert;

  return (
    <View style={styles.barContainer}>
      <View style={styles.barHeader}>
        <Text style={styles.barName}>{name}</Text>
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

function SleepScoreCircle({ score }: { score: number }) {
  return (
    <View style={styles.scoreCircle}>
      <Text style={styles.scoreNumber}>{score}</Text>
      <Text style={styles.scoreLabel}>Sleep Score</Text>
    </View>
  );
}

function WeeklyBarChart({
  data,
  labels,
}: {
  data: number[];
  labels: string[];
}) {
  const max = Math.max(...data);

  return (
    <View style={styles.weekChart}>
      {data.map((val, i) => (
        <View key={labels[i]} style={styles.weekBar}>
          <View style={styles.weekBarTrack}>
            <View
              style={[
                styles.weekBarFill,
                {
                  height: `${(val / max) * 100}%`,
                  backgroundColor: i === data.length - 1 ? Colors.accent : 'rgba(14, 168, 122, 0.4)',
                },
              ]}
            />
          </View>
          <Text style={styles.weekBarLabel}>{labels[i]}</Text>
        </View>
      ))}
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
        <Text style={styles.pageTitle}>Insights</Text>

        {/* Time Period Selector */}
        <View style={styles.periodSelector}>
          {timePeriods.map((period) => (
            <TouchableOpacity
              key={period}
              style={[
                styles.periodChip,
                selectedPeriod === period && styles.periodChipSelected,
              ]}
              onPress={() => setSelectedPeriod(period)}
            >
              <Text
                style={[
                  styles.periodText,
                  selectedPeriod === period && styles.periodTextSelected,
                ]}
              >
                {period}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Top Interventions */}
        <GlassCard style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="trophy-outline" size={20} color={Colors.accent} />
            <Text style={styles.sectionTitle}>Top Interventions</Text>
          </View>
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

        {/* Sleep Analysis */}
        <GlassCard style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="moon-outline" size={20} color={Colors.accent} />
            <Text style={styles.sectionTitle}>Sleep Analysis</Text>
          </View>

          <View style={styles.sleepRow}>
            <View style={styles.sleepStat}>
              <Text style={styles.sleepValue}>{mockSleepData.lastNightRmssd}</Text>
              <Text style={styles.sleepLabel}>Overnight RMSSD</Text>
            </View>
            <SleepScoreCircle score={mockSleepData.sleepScore} />
            <View style={styles.sleepStat}>
              <Text style={styles.sleepValue}>{mockSleepData.avgOvernightHr}</Text>
              <Text style={styles.sleepLabel}>Avg HR (bpm)</Text>
            </View>
          </View>

          <Text style={styles.chartTitle}>7-Day Sleep Score Trend</Text>
          <WeeklyBarChart data={mockSleepData.weeklyTrend} labels={mockSleepData.weekLabels} />
        </GlassCard>

        {/* Weekly Report */}
        <GlassCard style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="document-text-outline" size={20} color={Colors.accent} />
            <Text style={styles.sectionTitle}>Weekly Report</Text>
          </View>

          <Text style={styles.reportNarrative}>{mockWeeklyReport.narrative}</Text>

          <Text style={styles.reportHeading}>What's Helping</Text>
          {mockWeeklyReport.topHelpers.map((item, i) => (
            <View key={i} style={styles.reportBullet}>
              <Ionicons name="checkmark-circle" size={16} color={Colors.accent} />
              <Text style={styles.reportBulletText}>{item}</Text>
            </View>
          ))}

          <Text style={styles.reportHeading}>Watch Out For</Text>
          {mockWeeklyReport.thingsToAvoid.map((item, i) => (
            <View key={i} style={styles.reportBullet}>
              <Ionicons name="alert-circle" size={16} color={Colors.warning} />
              <Text style={styles.reportBulletText}>{item}</Text>
            </View>
          ))}

          <Text style={styles.reportHeading}>Sleep Trend</Text>
          <Text style={styles.reportText}>{mockWeeklyReport.sleepTrend}</Text>

          <Text style={styles.reportGenerated}>
            Generated {new Date(mockWeeklyReport.generatedDate).toLocaleDateString()}
          </Text>
        </GlassCard>

        {/* Community Insights Teaser */}
        <GlassCard style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="people-outline" size={20} color={Colors.accent} />
            <Text style={styles.sectionTitle}>Community Insights</Text>
          </View>
          <Text style={styles.comingSoon}>
            See what interventions work best across the Rapha community. Opt-in to share anonymized data.
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
    padding: Spacing.lg,
    paddingTop: Spacing.md,
  },
  pageTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: FontSize.xxl,
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  periodSelector: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  periodChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  periodChipSelected: {
    backgroundColor: Colors.accentLight,
    borderColor: Colors.accent,
  },
  periodText: {
    fontFamily: 'Inter_500Medium',
    fontSize: FontSize.sm,
    color: Colors.textMuted,
  },
  periodTextSelected: {
    color: Colors.accent,
  },
  section: {
    marginBottom: Spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: FontSize.lg,
    color: Colors.text,
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
  sleepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginBottom: Spacing.lg,
  },
  sleepStat: {
    alignItems: 'center',
  },
  sleepValue: {
    fontFamily: 'Inter_700Bold',
    fontSize: FontSize.xxl,
    color: Colors.text,
  },
  sleepLabel: {
    fontFamily: 'Inter_400Regular',
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    marginTop: 2,
  },
  scoreCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.accentLight,
  },
  scoreNumber: {
    fontFamily: 'Inter_700Bold',
    fontSize: FontSize.xxl,
    color: Colors.accent,
  },
  scoreLabel: {
    fontFamily: 'Inter_400Regular',
    fontSize: 9,
    color: Colors.textMuted,
    marginTop: -2,
  },
  chartTitle: {
    fontFamily: 'Inter_500Medium',
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    marginBottom: Spacing.md,
  },
  weekChart: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 120,
  },
  weekBar: {
    flex: 1,
    alignItems: 'center',
  },
  weekBarTrack: {
    width: 24,
    height: 90,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  weekBarFill: {
    width: '100%',
    borderRadius: 4,
  },
  weekBarLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: FontSize.xs - 1,
    color: Colors.textDim,
    marginTop: 4,
  },
  reportNarrative: {
    fontFamily: 'Inter_400Regular',
    fontSize: FontSize.md,
    color: Colors.text,
    lineHeight: 24,
    marginBottom: Spacing.md,
  },
  reportHeading: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  reportBullet: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    marginBottom: Spacing.xs + 2,
  },
  reportBulletText: {
    fontFamily: 'Inter_400Regular',
    fontSize: FontSize.sm,
    color: Colors.text,
    flex: 1,
    lineHeight: 20,
  },
  reportText: {
    fontFamily: 'Inter_400Regular',
    fontSize: FontSize.sm,
    color: Colors.text,
    lineHeight: 20,
  },
  reportGenerated: {
    fontFamily: 'Inter_400Regular',
    fontSize: FontSize.xs,
    color: Colors.textDim,
    marginTop: Spacing.lg,
    textAlign: 'right',
  },
  comingSoon: {
    fontFamily: 'Inter_400Regular',
    fontSize: FontSize.md,
    color: Colors.textMuted,
    lineHeight: 22,
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
