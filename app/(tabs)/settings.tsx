import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import GlassCard from '../../components/GlassCard';
import { Colors, FontSize, Spacing, BorderRadius } from '../../constants/theme';
import { mockUser, achievements } from '../../constants/mockData';

interface SettingsRowProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  subtitle?: string;
  value?: string;
  onPress?: () => void;
  isToggle?: boolean;
  toggleValue?: boolean;
  onToggle?: (val: boolean) => void;
  iconColor?: string;
  badge?: string;
  badgeColor?: string;
}

function SettingsRow({
  icon,
  label,
  subtitle,
  value,
  onPress,
  isToggle,
  toggleValue,
  onToggle,
  iconColor = Colors.textMuted,
  badge,
  badgeColor,
}: SettingsRowProps) {
  return (
    <TouchableOpacity
      style={styles.row}
      onPress={onPress}
      activeOpacity={isToggle ? 1 : 0.7}
      disabled={isToggle}
    >
      <View style={[styles.rowIcon, { backgroundColor: iconColor + '18' }]}>
        <Ionicons name={icon} size={20} color={iconColor} />
      </View>
      <View style={styles.rowContent}>
        <Text style={styles.rowLabel}>{label}</Text>
        {subtitle ? <Text style={styles.rowSubtitle}>{subtitle}</Text> : null}
      </View>
      {isToggle ? (
        <Switch
          value={toggleValue}
          onValueChange={onToggle}
          trackColor={{ false: Colors.surfaceBorder, true: Colors.purple }}
          thumbColor={Colors.white}
        />
      ) : badge ? (
        <View style={[styles.badge, { backgroundColor: (badgeColor || Colors.purple) + '20', borderColor: (badgeColor || Colors.purple) + '40' }]}>
          <Text style={[styles.badgeText, { color: badgeColor || Colors.purple }]}>{badge}</Text>
        </View>
      ) : (
        <View style={styles.rowRight}>
          {value ? <Text style={styles.rowValue}>{value}</Text> : null}
          <Ionicons name="chevron-forward" size={18} color={Colors.textDim} />
        </View>
      )}
    </TouchableOpacity>
  );
}

export default function SettingsScreen() {
  const [darkMode, setDarkMode] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [communityInsights, setCommunityInsights] = useState(false);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={24} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.pageTitle}>Settings</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* ACCOUNT */}
        <Text style={styles.sectionLabel}>ACCOUNT</Text>
        <GlassCard style={styles.sectionCard}>
          <SettingsRow
            icon="person-outline"
            label="Profile"
            subtitle={mockUser.email}
            iconColor="#6C5CE7"
          />
          <View style={styles.separator} />
          <SettingsRow
            icon="watch-outline"
            label="My Devices"
            subtitle="2 connected"
            iconColor="#0ea87a"
          />
          <View style={styles.separator} />
          <SettingsRow
            icon="medkit-outline"
            label="My Conditions"
            value="POTS, MCAS"
            iconColor="#f59e0b"
          />
          <View style={styles.separator} />
          <SettingsRow
            icon="warning-outline"
            label="Flare History"
            value="4 events"
            iconColor="#ef4444"
          />
          <View style={styles.separator} />
          <SettingsRow
            icon="trophy-outline"
            label="Achievements"
            iconColor="#0ea87a"
            badge={`${achievements.filter(a => a.unlocked).length}/${achievements.length}`}
            badgeColor="#0ea87a"
            onPress={() => router.push('/achievements' as any)}
          />
        </GlassCard>

        {/* PREFERENCES */}
        <Text style={styles.sectionLabel}>PREFERENCES</Text>
        <GlassCard style={styles.sectionCard}>
          <SettingsRow
            icon="moon-outline"
            label="Dark Mode"
            isToggle
            toggleValue={darkMode}
            onToggle={setDarkMode}
            iconColor="#6C5CE7"
          />
          <View style={styles.separator} />
          <SettingsRow
            icon="notifications-outline"
            label="Notifications"
            iconColor="#ffd93d"
          />
          <View style={styles.separator} />
          <SettingsRow
            icon="time-outline"
            label="HRV Check Intervals"
            value="Custom"
            iconColor="#8e8e93"
          />
          <View style={styles.separator} />
          <SettingsRow
            icon="people-outline"
            label="Community Insights"
            isToggle
            toggleValue={communityInsights}
            onToggle={setCommunityInsights}
            iconColor="#0ea87a"
          />
        </GlassCard>

        {/* DATA */}
        <Text style={styles.sectionLabel}>DATA</Text>
        <GlassCard style={styles.sectionCard}>
          <SettingsRow
            icon="download-outline"
            label="Export Data (CSV)"
            iconColor="#0ea87a"
          />
          <View style={styles.separator} />
          <SettingsRow
            icon="share-outline"
            label="Share with Practitioner"
            subtitle="Generate a read-only link"
            iconColor="#6C5CE7"
          />
        </GlassCard>

        {/* SUBSCRIPTION */}
        <Text style={styles.sectionLabel}>SUBSCRIPTION</Text>
        <GlassCard style={styles.sectionCard}>
          <TouchableOpacity style={styles.subRow}>
            <View style={styles.subIcon}>
              <Ionicons name="card-outline" size={20} color={Colors.purple} />
            </View>
            <View style={styles.subInfo}>
              <Text style={styles.subLabel}>Current Plan</Text>
              <Text style={styles.subPrice}>$9.99/month · Renews Apr 15</Text>
            </View>
            <View style={styles.premiumBadge}>
              <Text style={styles.premiumBadgeText}>Premium</Text>
            </View>
          </TouchableOpacity>
          <View style={styles.separator} />
          <SettingsRow
            icon="arrow-up-circle-outline"
            label="Upgrade Plan"
            iconColor={Colors.purple}
            onPress={() => router.push('/upgrade' as any)}
          />
        </GlassCard>

        {/* ABOUT */}
        <Text style={styles.sectionLabel}>ABOUT</Text>
        <GlassCard style={styles.sectionCard}>
          <SettingsRow
            icon="shield-checkmark-outline"
            label="Health Disclaimer"
            iconColor="#ffd93d"
          />
          <View style={styles.separator} />
          <SettingsRow
            icon="lock-closed-outline"
            label="Privacy Policy"
            iconColor="#8e8e93"
          />
        </GlassCard>

        {/* Footer */}
        <Text style={styles.disclaimer}>
          Rapha AI is not medical advice. Always consult your healthcare provider.
        </Text>
        <Text style={styles.copyright}>© 2026 Rapha AI. All rights reserved.</Text>

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
    paddingTop: Spacing.sm,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pageTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: FontSize.xl,
    color: Colors.text,
  },
  sectionLabel: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: FontSize.xs,
    color: Colors.textDim,
    letterSpacing: 1.5,
    marginBottom: Spacing.sm,
    marginTop: Spacing.sm,
    paddingHorizontal: Spacing.xs,
  },
  sectionCard: {
    marginBottom: Spacing.sm,
    paddingVertical: Spacing.xs,
    paddingHorizontal: 0,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md - 2,
    paddingHorizontal: Spacing.md,
    gap: Spacing.md,
  },
  rowIcon: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowContent: {
    flex: 1,
  },
  rowLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: FontSize.md,
    color: Colors.text,
  },
  rowSubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    marginTop: 1,
  },
  rowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  rowValue: {
    fontFamily: 'Inter_400Regular',
    fontSize: FontSize.sm,
    color: Colors.textMuted,
  },
  badge: {
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  badgeText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: FontSize.xs - 1,
  },
  separator: {
    height: 0.5,
    backgroundColor: Colors.surfaceBorder,
    marginHorizontal: Spacing.md,
  },
  subRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md - 2,
    paddingHorizontal: Spacing.md,
    gap: Spacing.md,
  },
  subIcon: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.purpleLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subInfo: {
    flex: 1,
  },
  subLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: FontSize.md,
    color: Colors.text,
  },
  subPrice: {
    fontFamily: 'Inter_400Regular',
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    marginTop: 1,
  },
  premiumBadge: {
    backgroundColor: Colors.purpleLight,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(108, 92, 231, 0.3)',
  },
  premiumBadgeText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: FontSize.xs,
    color: Colors.purple,
  },
  disclaimer: {
    fontFamily: 'Inter_400Regular',
    fontSize: FontSize.xs,
    color: Colors.textDim,
    textAlign: 'center',
    marginTop: Spacing.lg,
    lineHeight: 18,
  },
  copyright: {
    fontFamily: 'Inter_400Regular',
    fontSize: FontSize.xs,
    color: Colors.textDim,
    textAlign: 'center',
    marginTop: Spacing.sm,
  },
});
