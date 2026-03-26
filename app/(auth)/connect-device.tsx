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
import { Colors, FontSize, Spacing, BorderRadius } from '../../constants/theme';

const devices = [
  { id: 'polar_h10', name: 'Polar H10', desc: 'Direct BLE', icon: 'bluetooth-outline' as const },
  { id: 'apple_watch', name: 'Apple Watch', desc: 'HealthKit', icon: 'watch-outline' as const },
  { id: 'garmin', name: 'Garmin', desc: 'HealthKit / Health Connect', icon: 'fitness-outline' as const },
  { id: 'whoop', name: 'WHOOP', desc: 'HealthKit', icon: 'pulse-outline' as const },
  { id: 'oura', name: 'Oura Ring', desc: 'HealthKit + API', icon: 'ellipse-outline' as const },
  { id: 'muse', name: 'Muse', desc: 'BLE (Future)', icon: 'radio-outline' as const },
  { id: 'other', name: 'Other Device', desc: 'Manual entry / CSV import', icon: 'add-circle-outline' as const },
];

export default function ConnectDeviceScreen() {
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color={Colors.text} />
        </TouchableOpacity>

        <Text style={styles.title}>Connect Your Wearable</Text>
        <Text style={styles.subtitle}>
          Choose your device to start tracking HRV data in real-time.
        </Text>

        <View style={styles.deviceList}>
          {devices.map((device) => (
            <TouchableOpacity
              key={device.id}
              style={[
                styles.deviceCard,
                selectedDevice === device.id && styles.deviceCardSelected,
              ]}
              onPress={() => setSelectedDevice(device.id)}
              activeOpacity={0.7}
            >
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
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={styles.healthKitButton}
          onPress={() => router.push('/(auth)/profile-setup')}
          activeOpacity={0.8}
        >
          <Ionicons name="heart-circle-outline" size={22} color={Colors.background} />
          <Text style={styles.healthKitText}>Connect via Apple HealthKit</Text>
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
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    padding: Spacing.md,
    gap: Spacing.md,
  },
  deviceCardSelected: {
    borderColor: Colors.accent,
    backgroundColor: 'rgba(14, 168, 122, 0.08)',
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
  healthKitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.accent,
    paddingVertical: Spacing.md + 2,
    borderRadius: BorderRadius.xl,
    gap: Spacing.sm,
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  healthKitText: {
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
