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
import GlassCard from '../../components/GlassCard';
import { Colors, FontSize, Spacing, BorderRadius } from '../../constants/theme';
import {
  communityDiscoveries,
  interventionStacks,
  mockPopularSupplements,
} from '../../constants/mockData';
import { useInterventions } from '../../context/InterventionContext';

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
  const topStack = interventionStacks[0];
  const { interventions } = useInterventions();

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
            {interventions.length > 0 ? (
              <View style={{ gap: 8 }}>
                {interventions.slice(0, 5).map((item) => (
                  <View key={item.id} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 6, borderBottomWidth: 0.5, borderBottomColor: Colors.surfaceBorder }}>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 13, color: Colors.text }}>{item.name}</Text>
                      <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 11, color: Colors.textMuted }}>{item.category} · {new Date(item.timestamp).toLocaleDateString()}</Text>
                    </View>
                  </View>
                ))}
              </View>
            ) : (
              <View style={{ alignItems: 'center', paddingVertical: 24, gap: 8 }}>
                <Ionicons name="bar-chart-outline" size={28} color={Colors.textMuted} />
                <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 13, color: Colors.textMuted, textAlign: 'center', lineHeight: 20 }}>
                  Start tracking to see your patterns
                </Text>
              </View>
            )}
          </GlassCard>
        </View>

        {/* Exercise Impact Section */}
        <View style={styles.exerciseSection}>
          <View style={styles.topHeaderRow}>
            <Ionicons name="barbell-outline" size={16} color="#f59e0b" />
            <Text style={styles.exerciseHeaderText}>Exercise Impact</Text>
          </View>

          <GlassCard style={styles.exerciseCard}>
            <View style={{ alignItems: 'center', paddingVertical: 24, gap: 8 }}>
              <Ionicons name="barbell-outline" size={28} color={Colors.textMuted} />
              <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 13, color: Colors.textMuted, textAlign: 'center', lineHeight: 20 }}>
                Log workouts to see exercise effects
              </Text>
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
            <View style={{ alignItems: 'center', paddingVertical: 24, gap: 8 }}>
              <Ionicons name="git-merge-outline" size={28} color={Colors.textMuted} />
              <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 13, color: Colors.textMuted, textAlign: 'center', lineHeight: 20 }}>
                Log multiple interventions to discover synergistic combinations
              </Text>
            </View>
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
            <View style={{ alignItems: 'center', paddingVertical: 24, gap: 8 }}>
              <Ionicons name="moon-outline" size={28} color={Colors.textMuted} />
              <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 13, color: Colors.textMuted, textAlign: 'center', lineHeight: 20 }}>
                Connect a device to track sleep
              </Text>
            </View>
          </GlassCard>
        </View>

        {/* Weekly Report */}
        <View style={styles.reportSection}>
          <Text style={styles.reportTitle}>Weekly Report</Text>
          <GlassCard style={styles.reportCard}>
            <View style={{ alignItems: 'center', paddingVertical: 24, gap: 8 }}>
              <Ionicons name="document-text-outline" size={28} color={Colors.textMuted} />
              <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 13, color: Colors.textMuted, textAlign: 'center', lineHeight: 20 }}>
                Your first weekly report will generate after 7 days of tracking
              </Text>
            </View>
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
