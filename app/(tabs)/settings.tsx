import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import GlassCard from '../../components/GlassCard';
import { Colors, FontSize, Spacing, BorderRadius } from '../../constants/theme';
import { mockUser } from '../../constants/mockData';

interface SettingsRowProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value?: string;
  onPress?: () => void;
  isToggle?: boolean;
  toggleValue?: boolean;
  onToggle?: (val: boolean) => void;
  iconColor?: string;
}

function SettingsRow({
  icon,
  label,
  value,
  onPress,
  isToggle,
  toggleValue,
  onToggle,
  iconColor = Colors.textMuted,
}: SettingsRowProps) {
  return (
    <TouchableOpacity
      style={styles.row}
      onPress={onPress}
      activeOpacity={isToggle ? 1 : 0.7}
      disabled={isToggle}
    >
      <View style={styles.rowLeft}>
        <Ionicons name={icon} size={20} color={iconColor} />
        <Text style={styles.rowLabel}>{label}</Text>
      </View>
      {isToggle ? (
        <Switch
          value={toggleValue}
          onValueChange={onToggle}
          trackColor={{ false: Colors.surfaceBorder, true: Colors.accent }}
          thumbColor={Colors.white}
        />
      ) : (
        <View style={styles.rowRight}>
          {value && <Text style={styles.rowValue}>{value}</Text>}
          <Ionicons name="chevron-forward" size={18} color={Colors.textDim} />
        </View>
      )}
    </TouchableOpacity>
  );
}

export default function SettingsScreen() {
  const [darkMode, setDarkMode] = useState(true);
  const [notifications, setNotifications] = useState(true);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.pageTitle}>Settings</Text>

        {/* Profile Card */}
        <TouchableOpacity activeOpacity={0.8}>
          <GlassCard style={styles.profileCard}>
            <View style={styles.profileAvatar}>
              <Text style={styles.avatarText}>
                {mockUser.firstName.charAt(0)}
              </Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{mockUser.name}</Text>
              <Text style={styles.profileEmail}>{mockUser.email}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.textDim} />
          </GlassCard>
        </TouchableOpacity>

        {/* Account */}
        <Text style={styles.sectionLabel}>ACCOUNT</Text>
        <GlassCard style={styles.sectionCard}>
          <SettingsRow
            icon="person-outline"
            label="Profile"
            value={mockUser.firstName}
          />
          <View style={styles.separator} />
          <SettingsRow
            icon="watch-outline"
            label="My Devices"
            value="1 connected"
          />
        </GlassCard>

        {/* Preferences */}
        <Text style={styles.sectionLabel}>PREFERENCES</Text>
        <GlassCard style={styles.sectionCard}>
          <SettingsRow
            icon="moon-outline"
            label="Dark Mode"
            isToggle
            toggleValue={darkMode}
            onToggle={setDarkMode}
            iconColor={Colors.accent}
          />
          <View style={styles.separator} />
          <SettingsRow
            icon="notifications-outline"
            label="Notifications"
            isToggle
            toggleValue={notifications}
            onToggle={setNotifications}
          />
          <View style={styles.separator} />
          <SettingsRow
            icon="time-outline"
            label="HRV Check Intervals"
            value="5 min"
          />
        </GlassCard>

        {/* Data */}
        <Text style={styles.sectionLabel}>DATA</Text>
        <GlassCard style={styles.sectionCard}>
          <SettingsRow
            icon="download-outline"
            label="Export Data"
            value="CSV"
          />
          <View style={styles.separator} />
          <SettingsRow
            icon="share-outline"
            label="Share with Practitioner"
          />
        </GlassCard>

        {/* Subscription */}
        <Text style={styles.sectionLabel}>SUBSCRIPTION</Text>
        <GlassCard style={styles.sectionCard}>
          <View style={styles.subscriptionBadge}>
            <View style={styles.subBadgeInner}>
              <Ionicons name="diamond-outline" size={16} color={Colors.accent} />
              <Text style={styles.subPlan}>Premium</Text>
            </View>
            <Text style={styles.subPrice}>$9.99/month</Text>
          </View>
          <View style={styles.separator} />
          <SettingsRow
            icon="card-outline"
            label="Manage Subscription"
          />
        </GlassCard>

        {/* About */}
        <Text style={styles.sectionLabel}>ABOUT</Text>
        <GlassCard style={styles.sectionCard}>
          <SettingsRow
            icon="medical-outline"
            label="Health Disclaimer"
            iconColor={Colors.warning}
          />
          <View style={styles.separator} />
          <SettingsRow
            icon="shield-checkmark-outline"
            label="Privacy Policy"
          />
          <View style={styles.separator} />
          <SettingsRow
            icon="document-text-outline"
            label="Terms of Service"
          />
          <View style={styles.separator} />
          <SettingsRow
            icon="information-circle-outline"
            label="Version"
            value="1.0.0"
          />
        </GlassCard>

        {/* Disclaimer */}
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
    padding: Spacing.lg,
    paddingTop: Spacing.md,
  },
  pageTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: FontSize.xxl,
    color: Colors.text,
    marginBottom: Spacing.lg,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    marginBottom: Spacing.lg,
  },
  profileAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.accentLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  avatarText: {
    fontFamily: 'Inter_700Bold',
    fontSize: FontSize.xl,
    color: Colors.accent,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: FontSize.lg,
    color: Colors.text,
  },
  profileEmail: {
    fontFamily: 'Inter_400Regular',
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    marginTop: 2,
  },
  sectionLabel: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: FontSize.xs,
    color: Colors.textDim,
    letterSpacing: 1.5,
    marginBottom: Spacing.sm,
    marginTop: Spacing.sm,
  },
  sectionCard: {
    marginBottom: Spacing.md,
    paddingVertical: Spacing.xs,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md - 2,
    paddingHorizontal: Spacing.md,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  rowLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: FontSize.md,
    color: Colors.text,
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
  separator: {
    height: 0.5,
    backgroundColor: Colors.surfaceBorder,
    marginHorizontal: Spacing.md,
  },
  subscriptionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md - 2,
    paddingHorizontal: Spacing.md,
  },
  subBadgeInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  subPlan: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: FontSize.md,
    color: Colors.accent,
  },
  subPrice: {
    fontFamily: 'Inter_500Medium',
    fontSize: FontSize.sm,
    color: Colors.textMuted,
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
