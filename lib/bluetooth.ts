import { Platform } from 'react-native';
import { runFullAnalysis, type FullHRVAnalysis } from './hrvAnalysis';

// Types
export interface BLEDevice {
  id: string;
  name: string;
  rssi: number;
}

export interface HRVData {
  heartRate: number;
  rrIntervals: number[];
  rmssd: number;
  sdnn: number;
  pnn50: number;
  signalQuality: 'excellent' | 'good' | 'poor' | 'bad';
  timestamp: number;
  fullAnalysis: FullHRVAnalysis | null;
}

// Heart Rate Service UUIDs (standard BLE)
const HR_SERVICE_UUID = '0000180d-0000-1000-8000-00805f9b34fb';
const HR_MEASUREMENT_CHAR_UUID = '00002a37-0000-1000-8000-00805f9b34fb';

let manager: any = null;
let connectedDevice: any = null;

function getManager() {
  if (Platform.OS === 'web') return null;
  if (!manager) {
    try {
      const { BleManager } = require('react-native-ble-plx');
      manager = new BleManager();
    } catch {
      return null;
    }
  }
  return manager;
}

export async function requestBLEPermissions(): Promise<boolean> {
  if (Platform.OS === 'web') return false;
  if (Platform.OS === 'android') {
    try {
      const { PermissionsAndroid } = require('react-native');
      const granted = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      ]);
      return Object.values(granted).every(
        (v) => v === PermissionsAndroid.RESULTS.GRANTED
      );
    } catch {
      return false;
    }
  }
  return true;
}

export function scanForDevices(
  onDeviceFound: (device: BLEDevice) => void,
  onError?: (error: string) => void
): () => void {
  const mgr = getManager();
  if (!mgr) {
    onError?.('Bluetooth not available on this platform');
    return () => {};
  }
  const seen = new Set<string>();
  mgr.startDeviceScan(
    [HR_SERVICE_UUID],
    { allowDuplicates: false },
    (error: any, device: any) => {
      if (error) { onError?.(error.message); return; }
      if (device?.name && !seen.has(device.id)) {
        seen.add(device.id);
        onDeviceFound({ id: device.id, name: device.name, rssi: device.rssi ?? -100 });
      }
    }
  );
  return () => mgr.stopDeviceScan();
}

// ============================================================
// ARTIFACT REJECTION — Filter out bad R-R intervals
// This is what makes clinical-grade HRV apps accurate.
// Bad intervals come from: missed beats, ectopic beats, motion artifacts
// ============================================================
function filterArtifacts(rrIntervals: number[]): number[] {
  if (rrIntervals.length < 3) return rrIntervals;

  const filtered: number[] = [];

  for (let i = 0; i < rrIntervals.length; i++) {
    const rr = rrIntervals[i];

    // Basic physiological range: 300ms (200bpm) to 2000ms (30bpm)
    if (rr < 300 || rr > 2000) continue;

    // Check against neighbors for sudden jumps (ectopic beat detection)
    if (filtered.length >= 2) {
      const prev = filtered[filtered.length - 1];
      const prevPrev = filtered[filtered.length - 2];
      const localMean = (prev + prevPrev) / 2;

      // If this interval differs from local mean by more than 20%, it's likely an artifact
      // This is the standard approach used by Kubios and Elite HRV
      const deviation = Math.abs(rr - localMean) / localMean;
      if (deviation > 0.20) continue;
    } else if (filtered.length === 1) {
      const prev = filtered[0];
      const deviation = Math.abs(rr - prev) / prev;
      if (deviation > 0.25) continue;
    }

    filtered.push(rr);
  }

  return filtered;
}

// ============================================================
// SIGNAL QUALITY — Based on R-R interval quality, not RSSI
// Matches how SweetBeat and Kubios assess signal quality
// ============================================================
function assessSignalQuality(rawRR: number[], filteredRR: number[]): 'excellent' | 'good' | 'poor' | 'bad' {
  if (rawRR.length === 0) return 'bad';
  if (rawRR.length < 5) return 'poor';

  const rejectionRate = 1 - (filteredRR.length / rawRR.length);

  // Less than 5% rejected = excellent
  if (rejectionRate < 0.05) return 'excellent';
  // Less than 10% = good
  if (rejectionRate < 0.10) return 'good';
  // Less than 20% = poor
  if (rejectionRate < 0.20) return 'poor';
  // More than 20% rejected = bad signal
  return 'bad';
}

export async function connectAndStream(
  deviceId: string,
  onData: (data: HRVData) => void,
  onDisconnect?: () => void,
  onError?: (error: string) => void
): Promise<{ disconnect: () => void }> {
  const mgr = getManager();
  if (!mgr) throw new Error('BLE not available');

  const device = await mgr.connectToDevice(deviceId, { requestMTU: 512 });
  await device.discoverAllServicesAndCharacteristics();
  connectedDevice = device;

  device.onDisconnected(() => {
    connectedDevice = null;
    onDisconnect?.();
  });

  // Use a LARGER buffer — 300 intervals ≈ 5 minutes at 60bpm
  // This matches what Kubios and Elite HRV use for short-term analysis
  let rawRRBuffer: number[] = [];
  let lastFullAnalysis: FullHRVAnalysis | null = null;
  let lastAnalysisTime = 0;

  device.monitorCharacteristicForService(
    HR_SERVICE_UUID,
    HR_MEASUREMENT_CHAR_UUID,
    (error: any, characteristic: any) => {
      if (error) { onError?.(error.message); return; }
      if (characteristic?.value) {
        const parsed = parseHRMeasurement(characteristic.value);

        if (parsed.rrIntervals.length > 0) {
          rawRRBuffer.push(...parsed.rrIntervals);
          // Keep last 300 intervals (~5 min) for stable readings
          if (rawRRBuffer.length > 300) rawRRBuffer = rawRRBuffer.slice(-300);
        }

        // Run full analysis every 5 seconds (CPU intensive)
        const now = Date.now();
        if (now - lastAnalysisTime >= 5000 && rawRRBuffer.length >= 4) {
          lastFullAnalysis = runFullAnalysis(rawRRBuffer);
          lastAnalysisTime = now;
        }

        // For immediate feedback, use the old fast path for basic metrics
        const cleanRR = filterArtifacts(rawRRBuffer);
        const signalQuality = assessSignalQuality(rawRRBuffer, cleanRR);

        onData({
          heartRate: parsed.heartRate,
          rrIntervals: parsed.rrIntervals,
          rmssd: lastFullAnalysis?.rmssd ?? calculateRMSSD(cleanRR),
          sdnn: lastFullAnalysis?.sdnn ?? calculateSDNN(cleanRR),
          pnn50: lastFullAnalysis?.pnn50 ?? calculatePNN50(cleanRR),
          signalQuality: lastFullAnalysis?.signalQuality ?? signalQuality,
          timestamp: now,
          fullAnalysis: lastFullAnalysis,
        });
      }
    }
  );

  return {
    disconnect: () => {
      try { mgr.cancelDeviceConnection(deviceId); connectedDevice = null; } catch {}
    },
  };
}

// ============================================================
// PARSE BLE Heart Rate Measurement (Bluetooth SIG spec compliant)
// Reference: https://www.bluetooth.com/specifications/specs/heart-rate-service-1-0/
// R-R interval: units of 1/1024 seconds
// ============================================================
function parseHRMeasurement(base64Value: string): {
  heartRate: number;
  rrIntervals: number[];
} {
  const raw = atob(base64Value);
  const bytes = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) {
    bytes[i] = raw.charCodeAt(i);
  }

  const flags = bytes[0];
  const is16Bit = (flags & 0x01) !== 0;
  const hasContactStatus = (flags & 0x02) !== 0;
  const contactDetected = (flags & 0x04) !== 0;
  const hasEnergyExpended = (flags & 0x08) !== 0;
  const hasRR = (flags & 0x10) !== 0;

  let heartRate: number;
  let offset: number;

  if (is16Bit) {
    heartRate = bytes[1] | (bytes[2] << 8);
    offset = 3;
  } else {
    heartRate = bytes[1];
    offset = 2;
  }

  // Skip energy expended field if present (2 bytes)
  if (hasEnergyExpended) offset += 2;

  const rrIntervals: number[] = [];
  if (hasRR) {
    while (offset + 1 < bytes.length) {
      // R-R value is in 1/1024 second units per BLE spec
      const rawRR = bytes[offset] | (bytes[offset + 1] << 8);
      // Convert to milliseconds: rawRR * (1000 / 1024) = rawRR * 0.9765625
      const rrMs = rawRR * 0.9765625;
      rrIntervals.push(Math.round(rrMs * 10) / 10);
      offset += 2;
    }
  }

  return { heartRate, rrIntervals };
}

// ============================================================
// HRV METRICS — Clinical-grade calculations
// Matching Kubios / Elite HRV methodology
// ============================================================

// RMSSD: Root Mean Square of Successive Differences
export function calculateRMSSD(rrIntervals: number[]): number {
  if (rrIntervals.length < 2) return 0;
  let sum = 0;
  let count = 0;
  for (let i = 1; i < rrIntervals.length; i++) {
    const diff = rrIntervals[i] - rrIntervals[i - 1];
    sum += diff * diff;
    count++;
  }
  return count > 0 ? Math.round(Math.sqrt(sum / count) * 10) / 10 : 0;
}

// SDNN: Standard Deviation of NN intervals
export function calculateSDNN(rrIntervals: number[]): number {
  if (rrIntervals.length < 2) return 0;
  const mean = rrIntervals.reduce((a, b) => a + b, 0) / rrIntervals.length;
  const variance =
    rrIntervals.reduce((sum, rr) => sum + Math.pow(rr - mean, 2), 0) /
    (rrIntervals.length - 1);
  return Math.round(Math.sqrt(variance) * 10) / 10;
}

// pNN50: Percentage of successive RR intervals that differ by more than 50ms
export function calculatePNN50(rrIntervals: number[]): number {
  if (rrIntervals.length < 2) return 0;
  let count50 = 0;
  for (let i = 1; i < rrIntervals.length; i++) {
    if (Math.abs(rrIntervals[i] - rrIntervals[i - 1]) > 50) count50++;
  }
  return Math.round((count50 / (rrIntervals.length - 1)) * 100 * 10) / 10;
}

// Get autonomic state from RMSSD
export function getAutonomicState(
  rmssd: number
): 'sympathetic' | 'parasympathetic' | 'transitioning' {
  if (rmssd >= 50) return 'parasympathetic';
  if (rmssd <= 25) return 'sympathetic';
  return 'transitioning';
}

export function isDeviceConnected(): boolean {
  return connectedDevice !== null;
}

export function destroyBLE() {
  if (connectedDevice) {
    try { const mgr = getManager(); mgr?.cancelDeviceConnection(connectedDevice.id); } catch {}
    connectedDevice = null;
  }
  if (manager) { manager.destroy(); manager = null; }
}
