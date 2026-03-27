import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import GlassCard from '../../components/GlassCard';
import { Colors, FontSize, Spacing, BorderRadius } from '../../constants/theme';

const devices = [
  { id: 'polar_h10', name: 'Polar H10', desc: 'Chest strap · Direct BLE', icon: 'bluetooth-outline' as const },
  { id: 'apple_watch', name: 'Apple Watch', desc: 'Wrist · HealthKit', icon: 'watch-outline' as const },
  { id: 'garmin', name: 'Garmin', desc: 'Wrist · HealthKit / Health Connect', icon: 'fitness-outline' as const },
  { id: 'whoop', name: 'WHOOP', desc: 'Wrist · HealthKit', icon: 'pulse-outline' as const },
  { id: 'oura', name: 'Oura Ring', desc: 'Ring · HealthKit + API', icon: 'ellipse-outline' as const },
  { id: 'muse', name: 'Muse', desc: 'Headband · BLE (Coming Soon)', icon: 'radio-outline' as const },
  { id: 'other', name: 'Other HRV Device', desc: 'Manual entry or CSV import', icon: 'add-circle-outline' as const },
];

export default function ConnectDeviceScreen() {
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color={Colors.text} />
        </TouchableOpacity>

        <Text style={styles.title}>Connect Your Device</Text>
        <Text style={styles.subtitle}>
          Choose your wearable to start tracking HRV in real-time.
        </Text>

        <View style={styles.deviceList}>
          {devices.map((device) => (
            <TouchableOpacity
              key={device.id}
              activeOpacity={0.7}
              onPress={() => setSelectedDevice(device.id)}
            >
              <GlassCard
                style={[
                  styles.deviceCard,
                  selectedDevice === device.id && styles.deviceCardSelected,
                ]}
              >
                <View style={styles.deviceRow}>
                  <View
                    style={[
                      styles.deviceIcon,
                      selectedDevice === device.id && styles.deviceIconSelected,
                    ]}
                  >
                    <Ionicons
                      name={device.icon}
                      size={22}
                      color={selectedDevice === device.id ? Colors.accent : Colors.textMuted}
                    />
                  </View>
                  <View style={styles.deviceInfo}>
                    <Text style={styles.deviceName}>{device.name}</Text>
                    <Text style={styles.deviceDesc}>{device.desc}</Text>
                  </View>
                  {selectedDevice === device.id && (
                    <Ionicons name="checkmark-circle" size={22} color={Colors.accent} />
                  )}
                </View>
              </GlassCard>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={styles.connectButton}
          onPress={() => router.push('/(auth)/profile-setup')}
          activeOpacity={0.8}
        >
          <Ionicons name="heart-circle-outline" size={22} color={Colors.background} />
          <Text style={styles.connectText}>Connect via Apple HealthKit</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.skipButton}
          onPress={() => router.push('/(auth)/profile-setup')}
          activeOpacity={0.7}
        >
          <Text style={styles.skipText}>Skip for now</Text>
        </TouchableOpacity>
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
    paddingBottom: Spacing.xxl,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  title: {
    fontFamily: 'Inter_700Bold',
    fontSize: FontSize.xxl,
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: FontSize.md,
    color: Colors.textMuted,
    marginBottom: Spacing.xl,
    lineHeight: 22,
  },
  deviceList: {
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  deviceCard: {
    paddingVertical: Spacing.sm,
  },
  deviceCardSelected: {
    borderColor: Colors.accent,
  },
  deviceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  deviceIcon: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deviceIconSelected: {
    backgroundColor: Colors.accentLight,
  },
  deviceInfo: {
    flex: 1,
  },
  deviceName: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: FontSize.md,
    color: Colors.text,
  },
  deviceDesc: {
    fontFamily: 'Inter_400Regular',
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    marginTop: 2,
  },
  connectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.accent,
    paddingVertical: Spacing.md + 2,
    borderRadius: BorderRadius.lg,
    gap: Spacing.sm,
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  connectText: {
    fontFamily: 'Inter_700Bold',
    fontSize: FontSize.md,
    color: Colors.background,
  },
  skipButton: {
    alignItems: 'center',
    paddingVertical: Spacing.md,
    marginTop: Spacing.sm,
  },
  skipText: {
    fontFamily: 'Inter_500Medium',
    fontSize: FontSize.md,
    color: Colors.textMuted,
  },
});
