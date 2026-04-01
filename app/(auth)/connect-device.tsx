import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import GlassCard from '../../components/GlassCard';
import { Colors, FontSize, Spacing, BorderRadius } from '../../constants/theme';
import { useBLE } from '../../context/BLEContext';

const deviceTypes = [
  { id: 'polar_h10', name: 'Polar H10', desc: 'Chest strap · Direct BLE', icon: 'bluetooth-outline' as const },
  { id: 'apple_watch', name: 'Apple Watch', desc: 'Wrist · HealthKit', icon: 'watch-outline' as const },
  { id: 'garmin', name: 'Garmin', desc: 'Wrist · HealthKit / Health Connect', icon: 'fitness-outline' as const },
  { id: 'whoop', name: 'WHOOP', desc: 'Wrist · HealthKit', icon: 'pulse-outline' as const },
  { id: 'oura', name: 'Oura Ring', desc: 'Ring · HealthKit + API', icon: 'ellipse-outline' as const },
  { id: 'muse', name: 'Muse', desc: 'Headband · BLE (Coming Soon)', icon: 'radio-outline' as const },
  { id: 'other', name: 'Other HRV Device', desc: 'Manual entry or CSV import', icon: 'add-circle-outline' as const },
];

function SignalBars({ rssi }: { rssi: number }) {
  const bars = rssi > -60 ? 3 : rssi > -80 ? 2 : 1;
  return (
    <View style={signalStyles.container}>
      {[1, 2, 3].map((level) => (
        <View
          key={level}
          style={[
            signalStyles.bar,
            { height: 6 + level * 4 },
            level <= bars ? signalStyles.barActive : signalStyles.barInactive,
          ]}
        />
      ))}
    </View>
  );
}

const signalStyles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'flex-end', gap: 2 },
  bar: { width: 4, borderRadius: 2 },
  barActive: { backgroundColor: Colors.accent },
  barInactive: { backgroundColor: 'rgba(255,255,255,0.15)' },
});

export default function ConnectDeviceScreen() {
  const { isScanning, devices, isConnected, connectedDevice, heartRate, rmssd, startScan, connectToDevice } = useBLE();
  const [connectingId, setConnectingId] = useState<string | null>(null);

  const handleConnect = async (deviceId: string) => {
    setConnectingId(deviceId);
    try {
      await connectToDevice(deviceId);
    } finally {
      setConnectingId(null);
    }
  };

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

        {/* Static device type cards */}
        <Text style={styles.sectionLabel}>SUPPORTED DEVICES</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.deviceTypesScroll}>
          <View style={styles.deviceTypesRow}>
            {deviceTypes.map((device) => (
              <View key={device.id} style={styles.deviceTypeChip}>
                <Ionicons name={device.icon} size={16} color={Colors.textMuted} />
                <Text style={styles.deviceTypeChipText}>{device.name}</Text>
              </View>
            ))}
          </View>
        </ScrollView>

        {/* Connected State */}
        {isConnected && connectedDevice && (
          <GlassCard style={styles.connectedCard}>
            <View style={styles.connectedHeader}>
              <Ionicons name="checkmark-circle" size={32} color={Colors.accent} />
              <Text style={styles.connectedTitle}>Connected to {connectedDevice.name}</Text>
            </View>
            <View style={styles.liveDataRow}>
              <View style={styles.liveDataItem}>
                <Text style={styles.liveDataLabel}>Heart Rate</Text>
                <Text style={styles.liveDataValue}>{heartRate > 0 ? `${heartRate} bpm` : '...'}</Text>
              </View>
              <View style={styles.liveDataItem}>
                <Text style={styles.liveDataLabel}>RMSSD</Text>
                <Text style={styles.liveDataValue}>{rmssd > 0 ? `${rmssd.toFixed(1)} ms` : '...'}</Text>
              </View>
            </View>
          </GlassCard>
        )}

        {/* Scan Button */}
        {!isConnected && (
          <TouchableOpacity
            style={[styles.scanButton, isScanning && styles.scanButtonScanning]}
            onPress={startScan}
            activeOpacity={0.8}
            disabled={isScanning}
          >
            {isScanning ? (
              <>
                <ActivityIndicator size="small" color={Colors.background} />
                <Text style={styles.scanButtonText}>Scanning for heart rate devices...</Text>
              </>
            ) : (
              <>
                <Ionicons name="bluetooth-outline" size={22} color={Colors.background} />
                <Text style={styles.scanButtonText}>Scan for Devices</Text>
              </>
            )}
          </TouchableOpacity>
        )}

        {/* Discovered Devices List */}
        {!isConnected && devices.length > 0 && (
          <View style={styles.discoveredSection}>
            <Text style={styles.sectionLabel}>DISCOVERED DEVICES</Text>
            {devices.map((device) => (
              <TouchableOpacity
                key={device.id}
                activeOpacity={0.7}
                onPress={() => handleConnect(device.id)}
                disabled={connectingId !== null}
              >
                <GlassCard style={styles.discoveredCard}>
                  <View style={styles.discoveredRow}>
                    <View style={styles.discoveredIcon}>
                      <Ionicons name="bluetooth" size={20} color={Colors.accent} />
                    </View>
                    <View style={styles.discoveredInfo}>
                      <Text style={styles.discoveredName}>{device.name || 'Unknown Device'}</Text>
                      <View style={styles.discoveredMeta}>
                        <SignalBars rssi={device.rssi} />
                        <Text style={styles.discoveredRssi}>{device.rssi} dBm</Text>
                      </View>
                    </View>
                    {connectingId === device.id ? (
                      <ActivityIndicator size="small" color={Colors.accent} />
                    ) : (
                      <TouchableOpacity
                        style={styles.connectPill}
                        onPress={() => handleConnect(device.id)}
                        disabled={connectingId !== null}
                      >
                        <Text style={styles.connectPillText}>Connect</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </GlassCard>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* No devices found after scan */}
        {!isConnected && !isScanning && devices.length === 0 && (
          <Text style={styles.noDevicesText}>
            Tap "Scan for Devices" to find nearby heart rate monitors.
          </Text>
        )}

        {/* Continue / Skip buttons */}
        <TouchableOpacity
          style={[styles.continueButton, !isConnected && styles.continueButtonDisabled]}
          onPress={() => router.push('/(auth)/profile-setup')}
          activeOpacity={0.8}
        >
          <Ionicons name="heart-circle-outline" size={22} color={isConnected ? Colors.background : Colors.textMuted} />
          <Text style={[styles.continueText, !isConnected && styles.continueTextDisabled]}>
            {isConnected ? 'Continue' : 'Continue (Connect a device first)'}
          </Text>
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
  sectionLabel: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: FontSize.xs,
    color: Colors.textDim,
    letterSpacing: 1.5,
    marginBottom: Spacing.sm,
  },
  // Device type chips
  deviceTypesScroll: {
    marginBottom: Spacing.lg,
    marginHorizontal: -Spacing.lg,
  },
  deviceTypesRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
  },
  deviceTypeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    backgroundColor: Colors.surface,
  },
  deviceTypeChipText: {
    fontFamily: 'Inter_500Medium',
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },
  // Connected card
  connectedCard: {
    marginBottom: Spacing.lg,
    borderColor: Colors.accent,
    borderWidth: 1,
  },
  connectedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  connectedTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: FontSize.lg,
    color: Colors.accent,
    flex: 1,
  },
  liveDataRow: {
    flexDirection: 'row',
    gap: Spacing.xl,
  },
  liveDataItem: {
    gap: 2,
  },
  liveDataLabel: {
    fontFamily: 'Inter_400Regular',
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },
  liveDataValue: {
    fontFamily: 'Inter_700Bold',
    fontSize: FontSize.xl,
    color: Colors.text,
  },
  // Scan button
  scanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.accent,
    paddingVertical: Spacing.md + 2,
    borderRadius: BorderRadius.lg,
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  scanButtonScanning: {
    opacity: 0.85,
  },
  scanButtonText: {
    fontFamily: 'Inter_700Bold',
    fontSize: FontSize.md,
    color: Colors.background,
  },
  // Discovered devices
  discoveredSection: {
    marginBottom: Spacing.lg,
  },
  discoveredCard: {
    marginBottom: Spacing.sm,
  },
  discoveredRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  discoveredIcon: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.accentLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  discoveredInfo: {
    flex: 1,
  },
  discoveredName: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: FontSize.md,
    color: Colors.text,
  },
  discoveredMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: 4,
  },
  discoveredRssi: {
    fontFamily: 'Inter_400Regular',
    fontSize: FontSize.xs,
    color: Colors.textDim,
  },
  connectPill: {
    backgroundColor: Colors.accent,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  connectPillText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: FontSize.xs,
    color: Colors.background,
  },
  noDevicesText: {
    fontFamily: 'Inter_400Regular',
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    textAlign: 'center',
    marginBottom: Spacing.lg,
    lineHeight: 20,
  },
  // Continue / Skip
  continueButton: {
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
  continueButtonDisabled: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    shadowOpacity: 0,
    elevation: 0,
  },
  continueText: {
    fontFamily: 'Inter_700Bold',
    fontSize: FontSize.md,
    color: Colors.background,
  },
  continueTextDisabled: {
    color: Colors.textMuted,
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
