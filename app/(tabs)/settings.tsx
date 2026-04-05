import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import GlassCard from '../../components/GlassCard';
import { Colors, FontSize, Spacing, BorderRadius } from '../../constants/theme';
import { achievements } from '../../constants/mockData';
import { useAuth } from '../../context/AuthContext';
import { useBLE } from '../../context/BLEContext';

const COMMUNITY_INSIGHTS_KEY = 'rapha_community_insights';

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
          trackColor={{ false: Colors.surfaceBorder, true: Colors.accent }}
          thumbColor={Colors.white}
        />
      ) : badge ? (
        <View style={[styles.badge, { backgroundColor: (badgeColor || Colors.accent) + '20', borderColor: (badgeColor || Colors.accent) + '40' }]}>
          <Text style={[styles.badgeText, { color: badgeColor || Colors.accent }]}>{badge}</Text>
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
  const { user, signOut } = useAuth();
  const { isConnected, connectedDevice } = useBLE();
  const [darkMode, setDarkMode] = useState(true);
  const [communityInsights, setCommunityInsights] = useState(false);

  const userEmail = user?.email || 'Not signed in';
  const deviceCount = isConnected && connectedDevice ? 1 : 0;
  const deviceLabel = deviceCount > 0 ? `${deviceCount} connected` : 'No devices';

  // Load community insights preference
  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(COMMUNITY_INSIGHTS_KEY);
        if (saved === 'true') setCommunityInsights(true);
      } catch {}
    })();
  }, []);

  const handleCommunityInsightsToggle = async (val: boolean) => {
    setCommunityInsights(val);
    try {
      await AsyncStorage.setItem(COMMUNITY_INSIGHTS_KEY, val ? 'true' : 'false');
    } catch {}
  };

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out? Your local data will be cleared.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await signOut();
            router.replace('/(auth)/welcome');
          },
        },
      ]
    );
  };

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
            subtitle={userEmail}
            iconColor="#D4A574"
            onPress={() => router.push('/profile' as any)}
          />
          <View style={styles.separator} />
          <SettingsRow
            icon="watch-outline"
            label="My Devices"
            subtitle={deviceLabel}
            iconColor="#D4A574"
            onPress={() => router.push('/(auth)/connect-device')}
          />
          <View style={styles.separator} />
          <View style={styles.deviceAccuracyNote}>
            <Ionicons name="information-circle-outline" size={16} color={Colors.textDim} />
            <Text style={styles.deviceAccuracyText}>
              Device Accuracy Note: Chest straps (Polar H10) provide gold-standard HRV accuracy. Wrist-based devices (Apple Watch, Garmin) may vary. For the most accurate readings, use a chest strap.
            </Text>
          </View>
          <View style={styles.separator} />
          <SettingsRow
            icon="medkit-outline"
            label="My Conditions"
            value="None set"
            iconColor="#f59e0b"
            onPress={() => router.push('/(auth)/profile-setup')}
          />
          <View style={styles.separator} />
          <SettingsRow
            icon="warning-outline"
            label="Flare History"
            value="0 events"
            iconColor="#ef4444"
            onPress={() => router.push('/flare' as any)}
          />
          <View style={styles.separator} />
          <SettingsRow
            icon="trophy-outline"
            label="Achievements"
            iconColor="#D4A574"
            badge={`${achievements.filter(a => a.unlocked).length}/${achievements.length}`}
            badgeColor="#D4A574"
            onPress={() => router.push('/achievements' as any)}
          />
        </GlassCard>

        {/* SOCIAL */}
        <Text style={styles.sectionLabel}>SOCIAL</Text>
        <GlassCard style={styles.sectionCard}>
          <SettingsRow
            icon="people-outline"
            label="Social Hub"
            subtitle="Friends, groups & community"
            iconColor={Colors.accent}
            onPress={() => router.push('/social' as any)}
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
            iconColor="#D4A574"
          />
          <View style={styles.separator} />
          <SettingsRow
            icon="notifications-outline"
            label="Notifications"
            iconColor="#ffd93d"
            onPress={() =>
              Alert.alert(
                'Notifications',
                'Push notifications will be enabled after App Store launch.'
              )
            }
          />
          <View style={styles.separator} />
          <SettingsRow
            icon="time-outline"
            label="HRV Check Intervals"
            value="Custom"
            iconColor="#8e8e93"
            onPress={() =>
              Alert.alert(
                'HRV Check Intervals',
                'Custom intervals available with Plus subscription.'
              )
            }
          />
          <View style={styles.separator} />
          <SettingsRow
            icon="people-outline"
            label="Community Insights"
            isToggle
            toggleValue={communityInsights}
            onToggle={handleCommunityInsightsToggle}
            iconColor="#D4A574"
          />
        </GlassCard>

        {/* DATA */}
        <Text style={styles.sectionLabel}>DATA</Text>
        <GlassCard style={styles.sectionCard}>
          <SettingsRow
            icon="download-outline"
            label="Export Data (CSV)"
            iconColor="#D4A574"
            onPress={() =>
              Alert.alert(
                'Export Data',
                'Export will be available once you have recorded data. Connect a device and start tracking.'
              )
            }
          />
          <View style={styles.separator} />
          <SettingsRow
            icon="share-outline"
            label="Share with Practitioner"
            subtitle="Generate a read-only link"
            iconColor="#D4A574"
            onPress={() =>
              Alert.alert(
                'Share with Practitioner',
                'Generate a read-only link for your practitioner. Coming in the next update.'
              )
            }
          />
        </GlassCard>

        {/* SUBSCRIPTION */}
        <Text style={styles.sectionLabel}>SUBSCRIPTION</Text>
        <GlassCard style={styles.sectionCard}>
          <TouchableOpacity
            style={styles.subRow}
            onPress={() => router.push('/upgrade' as any)}
            activeOpacity={0.7}
          >
            <View style={styles.subIcon}>
              <Ionicons name="card-outline" size={20} color={Colors.accent} />
            </View>
            <View style={styles.subInfo}>
              <Text style={styles.subLabel}>Current Plan</Text>
              <Text style={styles.subPrice}>Free plan</Text>
            </View>
            <View style={styles.premiumBadge}>
              <Text style={styles.premiumBadgeText}>Free</Text>
            </View>
          </TouchableOpacity>
          <View style={styles.separator} />
          <SettingsRow
            icon="arrow-up-circle-outline"
            label="Upgrade Plan"
            iconColor={Colors.accent}
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
            onPress={() => router.push('/disclaimer' as any)}
          />
          <View style={styles.separator} />
          <SettingsRow
            icon="lock-closed-outline"
            label="Privacy Policy"
            iconColor="#8e8e93"
            onPress={() => router.push('/privacy' as any)}
          />
        </GlassCard>

        {/* Sign Out */}
        <TouchableOpacity
          style={styles.signOutButton}
          onPress={handleSignOut}
          activeOpacity={0.7}
        >
          <Ionicons name="log-out-outline" size={20} color="#ef4444" />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>

        {/* Footer */}
        <Text style={styles.disclaimer}>
          Rapha AI is not medical advice. Always consult your healthcare provider.
        </Text>
        <Text style={styles.copyright}>&copy; 2026 Rapha AI. All rights reserved.</Text>

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
  deviceAccuracyNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
  },
  deviceAccuracyText: {
    fontFamily: 'Inter_400Regular',
    fontSize: FontSize.xs,
    color: Colors.textDim,
    flex: 1,
    lineHeight: 16,
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
    backgroundColor: Colors.accentLight,
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
    backgroundColor: Colors.accentLight,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(212, 165, 116, 0.3)',
  },
  premiumBadgeText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: FontSize.xs,
    color: Colors.accent,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    marginTop: Spacing.lg,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
  },
  signOutText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: FontSize.md,
    color: '#ef4444',
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
