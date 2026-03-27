import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
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
} from '../../constants/mockData';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function DashboardScreen() {
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

        {/* Metrics Row */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.metricsRow}
          style={styles.metricsScroll}
        >
          {mockMetrics.map((metric) => (
            <TouchableOpacity key={metric.label} activeOpacity={0.7}>
              <GlassCard style={styles.metricCard}>
                <Ionicons name={metric.icon} size={18} color={metric.color} />
                <Text style={styles.metricValue}>
                  {metric.value}
                  {metric.unit ? <Text style={styles.metricUnit}>{metric.unit}</Text> : null}
                </Text>
                <Text style={styles.metricLabel}>{metric.label}</Text>
              </GlassCard>
            </TouchableOpacity>
          ))}
        </ScrollView>

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
