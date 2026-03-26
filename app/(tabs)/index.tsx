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
import AutonomicBadge from '../../components/AutonomicBadge';
import InterventionItem from '../../components/InterventionItem';
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
          <View>
            <Text style={styles.greeting}>Hi, {mockUser.firstName}</Text>
            <Text style={styles.greetingSub}>Your autonomic dashboard</Text>
          </View>
          <TouchableOpacity
            style={styles.settingsButton}
            onPress={() => router.push('/(tabs)/settings')}
          >
            <Ionicons name="settings-outline" size={22} color={Colors.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Live HRV Card */}
        <GlassCard style={styles.hrvCard}>
          <View style={styles.hrvHeader}>
            <View style={styles.liveIndicator}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>LIVE</Text>
            </View>
            <AutonomicBadge state={mockCurrentHRV.autonomicState} />
          </View>

          <View style={styles.hrvMain}>
            <Text style={styles.hrvValue}>{mockCurrentHRV.rmssd}</Text>
            <Text style={styles.hrvUnit}>ms</Text>
          </View>
          <Text style={styles.hrvLabel}>RMSSD</Text>

          <View style={styles.hrvSecondary}>
            <View style={styles.hrvSecItem}>
              <Ionicons name="heart" size={16} color={Colors.alert} />
              <Text style={styles.hrvSecValue}>{mockCurrentHRV.heartRate}</Text>
              <Text style={styles.hrvSecUnit}>bpm</Text>
            </View>
            <View style={styles.hrvDivider} />
            <View style={styles.hrvSecItem}>
              <Ionicons name="trending-up" size={16} color={Colors.accent} />
              <Text style={styles.hrvSecValue}>{mockCurrentHRV.sdnn}</Text>
              <Text style={styles.hrvSecUnit}>SDNN</Text>
            </View>
          </View>

          {/* Sparkline */}
          <View style={styles.chartContainer}>
            <SparklineChart
              data={mockSparklineData}
              width={SCREEN_WIDTH - 80}
              height={70}
              color={Colors.accent}
            />
          </View>
          <Text style={styles.chartLabel}>Last 30 minutes</Text>
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
                  <Text style={styles.metricUnit}>{metric.unit}</Text>
                </Text>
                <Text style={styles.metricLabel}>{metric.label}</Text>
              </GlassCard>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Today's Summary */}
        <GlassCard style={styles.summaryCard}>
          <Text style={styles.sectionTitle}>Today's Summary</Text>
          <View style={styles.summaryGrid}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{mockTodaySummary.avgRmssd}</Text>
              <Text style={styles.summaryLabel}>Avg RMSSD</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{mockTodaySummary.paraTime}</Text>
              <Text style={styles.summaryLabel}>Para Time</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{mockTodaySummary.interventionCount}</Text>
              <Text style={styles.summaryLabel}>Interventions</Text>
            </View>
          </View>
          <View style={styles.bestIntervention}>
            <Ionicons name="trophy-outline" size={16} color={Colors.accent} />
            <Text style={styles.bestText}>
              Best: <Text style={styles.bestName}>{mockTodaySummary.bestIntervention}</Text>
            </Text>
          </View>
        </GlassCard>

        {/* Recent Interventions */}
        <GlassCard style={styles.interventionsCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Interventions</Text>
            <TouchableOpacity>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>
          {mockRecentInterventions.map((intervention) => (
            <InterventionItem
              key={intervention.id}
              name={intervention.name}
              category={intervention.category}
              dose={intervention.dose}
              timestamp={intervention.timestamp}
              rmssdDelta={intervention.rmssdDelta}
            />
          ))}
        </GlassCard>

        {/* Audio Sessions Button */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => router.push('/session')}
        >
          <LinearGradient
            colors={['rgba(14, 168, 122, 0.15)', 'rgba(14, 168, 122, 0.05)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.sessionButton}
          >
            <View style={styles.sessionIcon}>
              <Ionicons name="headset-outline" size={24} color={Colors.accent} />
            </View>
            <View style={styles.sessionInfo}>
              <Text style={styles.sessionTitle}>Binaural Beat Sessions</Text>
              <Text style={styles.sessionDesc}>Calm, Focus, Sleep Prep, Recovery</Text>
            </View>
            <Ionicons name="play-circle" size={32} color={Colors.accent} />
          </LinearGradient>
        </TouchableOpacity>

        {/* Bottom spacing for tab bar */}
        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/log-intervention')}
        activeOpacity={0.85}
      >
        <LinearGradient
          colors={[Colors.accent, Colors.accentDark]}
          style={styles.fabGradient}
        >
          <Ionicons name="add" size={28} color={Colors.white} />
        </LinearGradient>
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
    padding: Spacing.lg,
    paddingTop: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  greeting: {
    fontFamily: 'Inter_700Bold',
    fontSize: FontSize.xxl,
    color: Colors.text,
  },
  greetingSub: {
    fontFamily: 'Inter_400Regular',
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    marginTop: 2,
  },
  settingsButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hrvCard: {
    marginBottom: Spacing.md,
  },
  hrvHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs + 2,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.accent,
  },
  liveText: {
    fontFamily: 'Inter_700Bold',
    fontSize: FontSize.xs,
    color: Colors.accent,
    letterSpacing: 2,
  },
  hrvMain: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
  },
  hrvValue: {
    fontFamily: 'Inter_700Bold',
    fontSize: 64,
    color: Colors.text,
    letterSpacing: -2,
  },
  hrvUnit: {
    fontFamily: 'Inter_500Medium',
    fontSize: FontSize.xl,
    color: Colors.textMuted,
    marginLeft: Spacing.xs,
    marginBottom: 8,
  },
  hrvLabel: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    textAlign: 'center',
    letterSpacing: 2,
    marginBottom: Spacing.md,
  },
  hrvSecondary: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.lg,
    marginBottom: Spacing.md,
  },
  hrvSecItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  hrvSecValue: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: FontSize.lg,
    color: Colors.text,
  },
  hrvSecUnit: {
    fontFamily: 'Inter_400Regular',
    fontSize: FontSize.sm,
    color: Colors.textMuted,
  },
  hrvDivider: {
    width: 1,
    height: 20,
    backgroundColor: Colors.surfaceBorder,
  },
  chartContainer: {
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  chartLabel: {
    fontFamily: 'Inter_400Regular',
    fontSize: FontSize.xs,
    color: Colors.textDim,
    textAlign: 'center',
  },
  metricsScroll: {
    marginHorizontal: -Spacing.lg,
    marginBottom: Spacing.md,
  },
  metricsRow: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
  },
  metricCard: {
    width: 100,
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
    gap: Spacing.xs + 2,
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
  summaryCard: {
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: FontSize.lg,
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  summaryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  summaryItem: {
    alignItems: 'center',
    flex: 1,
  },
  summaryValue: {
    fontFamily: 'Inter_700Bold',
    fontSize: FontSize.xl,
    color: Colors.text,
  },
  summaryLabel: {
    fontFamily: 'Inter_400Regular',
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    marginTop: 2,
  },
  bestIntervention: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.accentLight,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
  },
  bestText: {
    fontFamily: 'Inter_400Regular',
    fontSize: FontSize.sm,
    color: Colors.textMuted,
  },
  bestName: {
    fontFamily: 'Inter_600SemiBold',
    color: Colors.accent,
  },
  interventionsCard: {
    marginBottom: Spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  seeAll: {
    fontFamily: 'Inter_500Medium',
    fontSize: FontSize.sm,
    color: Colors.accent,
  },
  sessionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(14, 168, 122, 0.2)',
    padding: Spacing.md,
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  sessionIcon: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.accentLight,
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
  fab: {
    position: 'absolute',
    right: Spacing.lg,
    bottom: 110,
    ...Shadows.glow,
  },
  fabGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
