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
  communityDiscoveries,
  interventionStacks,
  mockPopularSupplements,
  mockAthleteInsights,
  mockExerciseData,
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

function SupplementRow({
  item,
  onPress,
  expanded,
}: {
  item: typeof mockPopularSupplements[0];
  onPress: () => void;
  expanded: boolean;
}) {
  const isPositive = item.avgDelta >= 0;
  const sleepPositive = item.sleepImpact >= 0;
  const recoveryPositive = item.recoveryImpact >= 0;
  const categoryColors: Record<string, string> = {
    supplement: Colors.purple,
    therapy: Colors.accent,
    activity: '#f59e0b',
  };
  const catColor = categoryColors[item.category] || Colors.textMuted;

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <View style={styles.suppRow}>
        <View style={styles.suppLeft}>
          <View style={styles.suppNameRow}>
            <Text style={styles.suppName}>{item.name}</Text>
            <View style={[styles.suppCatBadge, { backgroundColor: `${catColor}20`, borderColor: `${catColor}40` }]}>
              <Text style={[styles.suppCatText, { color: catColor }]}>{item.category}</Text>
            </View>
          </View>
          <View style={styles.suppMetrics}>
            <Text style={[styles.suppDelta, { color: isPositive ? Colors.accent : Colors.negative }]}>
              {isPositive ? '+' : ''}{item.avgDelta}ms
            </Text>
            <View style={styles.suppImpactItem}>
              <Ionicons name="moon-outline" size={11} color={sleepPositive ? Colors.accent : Colors.negative} />
              <Text style={[styles.suppImpactText, { color: sleepPositive ? Colors.accent : Colors.negative }]}>
                {sleepPositive ? '+' : ''}{item.sleepImpact}
              </Text>
            </View>
            <View style={styles.suppImpactItem}>
              <Ionicons name="fitness-outline" size={11} color={recoveryPositive ? Colors.accent : Colors.negative} />
              <Text style={[styles.suppImpactText, { color: recoveryPositive ? Colors.accent : Colors.negative }]}>
                {recoveryPositive ? '+' : ''}{item.recoveryImpact}
              </Text>
            </View>
            <Text style={styles.suppUsers}>{item.users} users</Text>
          </View>
        </View>
        <Ionicons name={expanded ? 'chevron-up' : 'chevron-down'} size={14} color={Colors.textDim} />
      </View>
      {expanded && (
        <View style={styles.suppInsight}>
          <Text style={styles.suppInsightText}>{item.insight}</Text>
          <View style={styles.suppTags}>
            {item.tags.map((tag) => (
              <View key={tag} style={styles.suppTag}>
                <Text style={styles.suppTagText}>{tag}</Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </TouchableOpacity>
  );
}

export default function InsightsScreen() {
  const [selectedPeriod, setSelectedPeriod] = useState('This Week');
  const [expandedSupplement, setExpandedSupplement] = useState<string | null>(null);
  const maxDelta = Math.max(...mockTopInterventions.map((i) => Math.abs(i.avgDelta)));
  const topStack = interventionStacks[0];

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

        {/* Exercise Impact Section */}
        <View style={styles.exerciseSection}>
          <View style={styles.topHeaderRow}>
            <Ionicons name="barbell-outline" size={16} color="#f59e0b" />
            <Text style={styles.exerciseHeaderText}>Exercise Impact</Text>
          </View>

          {mockExerciseData.recentWorkouts.map((workout, i) => {
            const hrvDrop = workout.hrvAfter - workout.hrvBefore;
            const recoveryHours = workout.recovery === 'Immediate' ? 0 : parseFloat(workout.recovery);
            const statusColor = workout.recovery === 'Immediate' ? Colors.accent
              : recoveryHours <= 6 ? Colors.accent
              : recoveryHours <= 12 ? '#f59e0b'
              : Colors.negative;
            const isPositive = hrvDrop >= 0;

            return (
              <GlassCard key={i} style={styles.exerciseCard}>
                <View style={styles.exerciseTop}>
                  <View style={styles.exerciseTypeRow}>
                    <Text style={styles.exerciseType}>{workout.type}</Text>
                    {'subtype' in workout && workout.subtype && (
                      <Text style={styles.exerciseSubtype}>{workout.subtype}</Text>
                    )}
                  </View>
                  <View style={[styles.exerciseStatusDot, { backgroundColor: statusColor }]} />
                </View>

                <View style={styles.exerciseMetrics}>
                  <View style={styles.exerciseMetric}>
                    <Text style={styles.exerciseMetricLabel}>HRV</Text>
                    <View style={styles.exerciseHrvFlow}>
                      <Text style={styles.exerciseHrvValue}>{workout.hrvBefore}</Text>
                      <Text style={[styles.exerciseHrvArrow, { color: isPositive ? Colors.accent : Colors.negative }]}>
                        {isPositive ? '\u2192' : '\u2192'}
                      </Text>
                      <Text style={[styles.exerciseHrvValue, { color: isPositive ? Colors.accent : Colors.negative }]}>
                        {workout.hrvAfter}
                      </Text>
                      <Text style={[styles.exerciseHrvDelta, { color: isPositive ? Colors.accent : Colors.negative }]}>
                        ({isPositive ? '+' : ''}{hrvDrop}ms)
                      </Text>
                    </View>
                  </View>
                  <View style={styles.exerciseMetric}>
                    <Text style={styles.exerciseMetricLabel}>Recovery</Text>
                    <Text style={[styles.exerciseRecovery, { color: statusColor }]}>{workout.recovery}</Text>
                  </View>
                </View>

                {'distance' in workout && workout.distance && (
                  <View style={styles.exerciseDetailRow}>
                    <Text style={styles.exerciseDetail}>{workout.distance}</Text>
                    <Text style={styles.exerciseDetailSep}>{'\u00B7'}</Text>
                    <Text style={styles.exerciseDetail}>{workout.duration}</Text>
                    <Text style={styles.exerciseDetailSep}>{'\u00B7'}</Text>
                    <Text style={styles.exerciseDetail}>Avg {workout.avgHR} bpm</Text>
                  </View>
                )}
                {'sets' in workout && (
                  <View style={styles.exerciseDetailRow}>
                    <Text style={styles.exerciseDetail}>{workout.sets} sets</Text>
                    <Text style={styles.exerciseDetailSep}>{'\u00B7'}</Text>
                    <Text style={styles.exerciseDetail}>{workout.volume}</Text>
                    <Text style={styles.exerciseDetailSep}>{'\u00B7'}</Text>
                    <Text style={styles.exerciseDetail}>{workout.duration}</Text>
                  </View>
                )}
              </GlassCard>
            );
          })}

          {/* Weekly Exercise Summary */}
          <GlassCard style={styles.exerciseSummaryCard}>
            <View style={styles.exerciseSummaryHeader}>
              <Ionicons name="sparkles-outline" size={14} color={Colors.accent} />
              <Text style={styles.exerciseSummaryTitle}>Weekly Summary</Text>
            </View>
            <View style={styles.exerciseSummaryGrid}>
              <View style={styles.exerciseSummaryItem}>
                <Text style={styles.exerciseSummaryValue}>{mockExerciseData.weeklyExerciseSummary.totalSessions}</Text>
                <Text style={styles.exerciseSummaryLabel}>Sessions</Text>
              </View>
              <View style={styles.exerciseSummaryItem}>
                <Text style={styles.exerciseSummaryValue}>{mockExerciseData.weeklyExerciseSummary.totalMinutes}</Text>
                <Text style={styles.exerciseSummaryLabel}>Minutes</Text>
              </View>
              <View style={styles.exerciseSummaryItem}>
                <Text style={styles.exerciseSummaryValue}>{mockExerciseData.weeklyExerciseSummary.avgRecoveryTime}</Text>
                <Text style={styles.exerciseSummaryLabel}>Avg Recovery</Text>
              </View>
            </View>
            <View style={styles.exerciseBestWorst}>
              <View style={styles.exerciseBWItem}>
                <Ionicons name="arrow-up-circle" size={14} color={Colors.accent} />
                <Text style={styles.exerciseBWText}>{mockExerciseData.weeklyExerciseSummary.bestType}</Text>
              </View>
              <View style={styles.exerciseBWItem}>
                <Ionicons name="arrow-down-circle" size={14} color={Colors.negative} />
                <Text style={styles.exerciseBWText}>{mockExerciseData.weeklyExerciseSummary.worstType}</Text>
              </View>
            </View>
            <View style={styles.exerciseAIRec}>
              <Ionicons name="bulb-outline" size={14} color={Colors.accent} />
              <Text style={styles.exerciseAIRecText}>{mockExerciseData.weeklyExerciseSummary.recommendation}</Text>
            </View>
          </GlassCard>
        </View>

        {/* Community Protocols Section */}
        <View style={styles.protocolsSection}>
          <View style={styles.protocolsHeaderRow}>
            <Ionicons name="flask-outline" size={16} color={Colors.accent} />
            <Text style={styles.protocolsHeaderText}>Community Protocols</Text>
            <View style={styles.communityBadge}>
              <Text style={styles.communityBadgeText}>{mockPopularSupplements.reduce((a, b) => a + b.users, 0).toLocaleString()}+ users</Text>
            </View>
          </View>

          <GlassCard style={styles.protocolsCard}>
            <View style={styles.protocolsLegend}>
              <View style={styles.protocolsLegendItem}>
                <Ionicons name="trending-up-outline" size={11} color={Colors.textMuted} />
                <Text style={styles.protocolsLegendText}>HRV</Text>
              </View>
              <View style={styles.protocolsLegendItem}>
                <Ionicons name="moon-outline" size={11} color={Colors.textMuted} />
                <Text style={styles.protocolsLegendText}>Sleep</Text>
              </View>
              <View style={styles.protocolsLegendItem}>
                <Ionicons name="fitness-outline" size={11} color={Colors.textMuted} />
                <Text style={styles.protocolsLegendText}>Recovery</Text>
              </View>
            </View>
            {mockPopularSupplements.map((item) => (
              <SupplementRow
                key={item.name}
                item={item}
                expanded={expandedSupplement === item.name}
                onPress={() => setExpandedSupplement(expandedSupplement === item.name ? null : item.name)}
              />
            ))}
          </GlassCard>
        </View>

        {/* Stack Analysis */}
        <View style={styles.stackAnalysisSection}>
          <View style={styles.protocolsHeaderRow}>
            <Ionicons name="git-merge-outline" size={16} color={Colors.purple} />
            <Text style={styles.stackAnalysisHeader}>Stack Analysis</Text>
          </View>

          <GlassCard style={styles.stackAnalysisCard}>
            <Text style={styles.stackAnalysisSubtitle}>Top synergistic combinations</Text>
            {mockAthleteInsights.stackAnalysis.map((stack) => {
              const isPositive = stack.netDelta >= 0;
              return (
                <View key={stack.stack} style={styles.stackAnalysisRow}>
                  <View style={styles.stackAnalysisInfo}>
                    <Text style={styles.stackAnalysisName}>{stack.stack}</Text>
                    <Text style={styles.stackAnalysisNote}>{stack.note}</Text>
                  </View>
                  <Text style={[styles.stackAnalysisDelta, { color: isPositive ? Colors.accent : Colors.negative }]}>
                    {isPositive ? '+' : ''}{stack.netDelta}ms
                  </Text>
                </View>
              );
            })}
          </GlassCard>
        </View>

        {/* Discover Section */}
        <View style={styles.discoverSection}>
          <View style={styles.discoverHeaderRow}>
            <Ionicons name="compass-outline" size={16} color={Colors.accent} />
            <Text style={styles.discoverHeaderText}>Discover</Text>
            <View style={styles.communityBadge}>
              <Text style={styles.communityBadgeText}>Community</Text>
            </View>
          </View>

          {/* Top for Your Conditions */}
          <GlassCard style={styles.discoverCard}>
            <Text style={styles.discoverCardTitle}>Top for Your Conditions</Text>
            {communityDiscoveries.slice(0, 3).map((item, i) => (
              <View key={i} style={styles.discoveryRow}>
                <View style={styles.discoveryRank}>
                  <Text style={styles.discoveryRankText}>{i + 1}</Text>
                </View>
                <View style={styles.discoveryInfo}>
                  <Text style={styles.discoveryName}>{item.intervention}</Text>
                  <Text style={styles.discoveryCondition}>{item.condition}</Text>
                </View>
                <View style={styles.discoveryDelta}>
                  <Text style={styles.discoveryDeltaText}>+{item.avgImprovement}ms</Text>
                  <Text style={styles.discoveryUsers}>{item.userCount} users</Text>
                </View>
                {item.trending && (
                  <Ionicons name="trending-up" size={14} color={Colors.accent} style={{ marginLeft: 4 }} />
                )}
              </View>
            ))}
          </GlassCard>

          {/* Intervention Stacking */}
          <GlassCard style={styles.discoverCard}>
            <View style={styles.stackHeader}>
              <Ionicons name="layers-outline" size={16} color={Colors.purple} />
              <Text style={styles.discoverCardTitle}>Intervention Stacking</Text>
            </View>
            <Text style={styles.stackCombo}>
              {topStack.combo[0]} + {topStack.combo[1]} = +{topStack.combinedDelta}ms
            </Text>
            <Text style={styles.stackDetail}>
              {topStack.synergyPercent}% better than either alone
            </Text>
            <View style={styles.stackBarRow}>
              <View style={styles.stackBarTrack}>
                <View
                  style={[styles.stackBarFill, { width: `${(topStack.individualSum / topStack.combinedDelta) * 100}%`, backgroundColor: 'rgba(108,92,231,0.4)' }]}
                />
              </View>
              <Text style={styles.stackBarLabel}>Individual: +{topStack.individualSum}ms</Text>
            </View>
            <View style={styles.stackBarRow}>
              <View style={styles.stackBarTrack}>
                <View
                  style={[styles.stackBarFill, { width: '100%', backgroundColor: Colors.purple }]}
                />
              </View>
              <Text style={styles.stackBarLabel}>Combined: +{topStack.combinedDelta}ms</Text>
            </View>
          </GlassCard>

          {/* Trending */}
          <GlassCard style={styles.discoverCard}>
            <View style={styles.trendingHeader}>
              <Ionicons name="flame-outline" size={16} color="#f59e0b" />
              <Text style={styles.discoverCardTitle}>Trending</Text>
            </View>
            <Text style={styles.trendingText}>
              23 POTS users: sodium loading +14ms avg
            </Text>
            <Text style={styles.trendingSub}>
              47 MCAS users report quercetin improving HRV response by 23%
            </Text>
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
                <Text style={styles.bulletDot}>{'\u2022'}</Text>
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
  // Exercise Impact
  exerciseSection: {
    marginBottom: Spacing.md,
  },
  exerciseHeaderText: {
    fontFamily: 'Inter_500Medium',
    fontSize: FontSize.sm,
    color: Colors.textMuted,
  },
  exerciseCard: {
    marginBottom: Spacing.sm,
  },
  exerciseTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  exerciseTypeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  exerciseType: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: FontSize.sm,
    color: Colors.text,
  },
  exerciseSubtype: {
    fontFamily: 'Inter_400Regular',
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },
  exerciseStatusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  exerciseMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  exerciseMetric: {
    gap: 2,
  },
  exerciseMetricLabel: {
    fontFamily: 'Inter_400Regular',
    fontSize: FontSize.xs,
    color: Colors.textDim,
  },
  exerciseHrvFlow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  exerciseHrvValue: {
    fontFamily: 'Inter_700Bold',
    fontSize: FontSize.md,
    color: Colors.text,
  },
  exerciseHrvArrow: {
    fontFamily: 'Inter_400Regular',
    fontSize: FontSize.sm,
  },
  exerciseHrvDelta: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: FontSize.xs,
  },
  exerciseRecovery: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: FontSize.md,
  },
  exerciseDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  exerciseDetail: {
    fontFamily: 'Inter_400Regular',
    fontSize: FontSize.xs,
    color: Colors.textDim,
  },
  exerciseDetailSep: {
    fontFamily: 'Inter_400Regular',
    fontSize: FontSize.xs,
    color: Colors.textDim,
  },
  exerciseSummaryCard: {
    marginTop: Spacing.sm,
  },
  exerciseSummaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: Spacing.md,
  },
  exerciseSummaryTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: FontSize.sm,
    color: Colors.accent,
  },
  exerciseSummaryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  exerciseSummaryItem: {
    alignItems: 'center',
    gap: 2,
  },
  exerciseSummaryValue: {
    fontFamily: 'Inter_700Bold',
    fontSize: FontSize.xl,
    color: Colors.text,
  },
  exerciseSummaryLabel: {
    fontFamily: 'Inter_400Regular',
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },
  exerciseBestWorst: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
    paddingTop: Spacing.sm,
    borderTopWidth: 0.5,
    borderTopColor: Colors.surfaceBorder,
  },
  exerciseBWItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  exerciseBWText: {
    fontFamily: 'Inter_500Medium',
    fontSize: FontSize.xs,
    color: Colors.text,
  },
  exerciseAIRec: {
    flexDirection: 'row',
    gap: Spacing.sm,
    backgroundColor: 'rgba(14, 168, 122, 0.08)',
    borderRadius: BorderRadius.md,
    padding: Spacing.sm + 2,
  },
  exerciseAIRecText: {
    fontFamily: 'Inter_400Regular',
    fontSize: FontSize.sm,
    color: Colors.text,
    lineHeight: 20,
    flex: 1,
  },
  // Discover Section
  discoverSection: {
    marginBottom: Spacing.md,
  },
  discoverHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
    paddingHorizontal: Spacing.xs,
  },
  discoverHeaderText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: FontSize.md,
    color: Colors.text,
    flex: 1,
  },
  communityBadge: {
    backgroundColor: Colors.accentLight,
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.accent,
  },
  communityBadgeText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: FontSize.xs - 1,
    color: Colors.accent,
  },
  discoverCard: {
    marginBottom: Spacing.sm,
  },
  discoverCardTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: FontSize.sm,
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  discoveryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.surfaceBorder,
  },
  discoveryRank: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.purpleLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  discoveryRankText: {
    fontFamily: 'Inter_700Bold',
    fontSize: FontSize.xs,
    color: Colors.purple,
  },
  discoveryInfo: {
    flex: 1,
  },
  discoveryName: {
    fontFamily: 'Inter_500Medium',
    fontSize: FontSize.sm,
    color: Colors.text,
  },
  discoveryCondition: {
    fontFamily: 'Inter_400Regular',
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    marginTop: 1,
  },
  discoveryDelta: {
    alignItems: 'flex-end',
  },
  discoveryDeltaText: {
    fontFamily: 'Inter_700Bold',
    fontSize: FontSize.sm,
    color: Colors.accent,
  },
  discoveryUsers: {
    fontFamily: 'Inter_400Regular',
    fontSize: FontSize.xs,
    color: Colors.textDim,
  },
  // Stacking
  stackHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: Spacing.sm,
  },
  stackCombo: {
    fontFamily: 'Inter_700Bold',
    fontSize: FontSize.lg,
    color: Colors.text,
    marginBottom: 4,
  },
  stackDetail: {
    fontFamily: 'Inter_400Regular',
    fontSize: FontSize.sm,
    color: Colors.accent,
    marginBottom: Spacing.md,
  },
  stackBarRow: {
    marginBottom: Spacing.sm,
  },
  stackBarTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.05)',
    marginBottom: 4,
    overflow: 'hidden',
  },
  stackBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  stackBarLabel: {
    fontFamily: 'Inter_400Regular',
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },
  // Trending
  trendingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: Spacing.sm,
  },
  trendingText: {
    fontFamily: 'Inter_500Medium',
    fontSize: FontSize.md,
    color: Colors.text,
    marginBottom: 6,
  },
  trendingSub: {
    fontFamily: 'Inter_400Regular',
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    lineHeight: 20,
  },
  // Sleep
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
  // Report
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
  // Deep Metrics
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
  // Community Protocols
  protocolsSection: {
    marginBottom: Spacing.md,
  },
  protocolsHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
    paddingHorizontal: Spacing.xs,
  },
  protocolsHeaderText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: FontSize.md,
    color: Colors.text,
    flex: 1,
  },
  protocolsCard: {
    paddingBottom: Spacing.xs,
  },
  protocolsLegend: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: Spacing.md,
    marginBottom: Spacing.sm,
    paddingBottom: Spacing.sm,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.surfaceBorder,
  },
  protocolsLegendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  protocolsLegendText: {
    fontFamily: 'Inter_400Regular',
    fontSize: FontSize.xs - 1,
    color: Colors.textDim,
  },
  suppRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm + 2,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.surfaceBorder,
  },
  suppLeft: {
    flex: 1,
  },
  suppNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: 4,
  },
  suppName: {
    fontFamily: 'Inter_500Medium',
    fontSize: FontSize.sm,
    color: Colors.text,
  },
  suppCatBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  suppCatText: {
    fontFamily: 'Inter_500Medium',
    fontSize: FontSize.xs - 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  suppMetrics: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  suppDelta: {
    fontFamily: 'Inter_700Bold',
    fontSize: FontSize.sm,
    minWidth: 50,
  },
  suppImpactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  suppImpactText: {
    fontFamily: 'Inter_500Medium',
    fontSize: FontSize.xs,
  },
  suppUsers: {
    fontFamily: 'Inter_400Regular',
    fontSize: FontSize.xs,
    color: Colors.textDim,
  },
  suppInsight: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: BorderRadius.sm,
    padding: Spacing.sm + 2,
    marginBottom: Spacing.sm,
  },
  suppInsightText: {
    fontFamily: 'Inter_400Regular',
    fontSize: FontSize.sm,
    color: Colors.text,
    lineHeight: 20,
    marginBottom: Spacing.sm,
  },
  suppTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  suppTag: {
    backgroundColor: 'rgba(14, 168, 122, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  suppTagText: {
    fontFamily: 'Inter_500Medium',
    fontSize: FontSize.xs - 1,
    color: Colors.accent,
  },
  // Stack Analysis
  stackAnalysisSection: {
    marginBottom: Spacing.md,
  },
  stackAnalysisHeader: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: FontSize.md,
    color: Colors.text,
    flex: 1,
  },
  stackAnalysisCard: {},
  stackAnalysisSubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    marginBottom: Spacing.sm,
  },
  stackAnalysisRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm + 2,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.surfaceBorder,
  },
  stackAnalysisInfo: {
    flex: 1,
  },
  stackAnalysisName: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: FontSize.sm,
    color: Colors.text,
    marginBottom: 2,
  },
  stackAnalysisNote: {
    fontFamily: 'Inter_400Regular',
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },
  stackAnalysisDelta: {
    fontFamily: 'Inter_700Bold',
    fontSize: FontSize.md,
    marginLeft: Spacing.md,
  },
});
