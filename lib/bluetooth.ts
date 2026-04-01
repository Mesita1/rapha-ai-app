import { Platform } from 'react-native';

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
  timestamp: number;
}

// Heart Rate Service UUIDs (standard BLE)
const HR_SERVICE_UUID = '0000180d-0000-1000-8000-00805f9b34fb';
const HR_MEASUREMENT_CHAR_UUID = '00002a37-0000-1000-8000-00805f9b34fb';

let manager: any = null;
let connectedDevice: any = null;

// Only import BLE on native
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

// Request permissions
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
  return true; // iOS uses Info.plist
}

// Scan for HR devices
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
      if (error) {
        onError?.(error.message);
        return;
      }
      if (device?.name && !seen.has(device.id)) {
        seen.add(device.id);
        onDeviceFound({
          id: device.id,
          name: device.name,
          rssi: device.rssi ?? -100,
        });
      }
    }
  );

  return () => mgr.stopDeviceScan();
}

// Connect and stream HR + RR data
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

  let rrBuffer: number[] = [];

  device.monitorCharacteristicForService(
    HR_SERVICE_UUID,
    HR_MEASUREMENT_CHAR_UUID,
    (error: any, characteristic: any) => {
      if (error) {
        onError?.(error.message);
        return;
      }
      if (characteristic?.value) {
        const parsed = parseHRMeasurement(characteristic.value);

        if (parsed.rrIntervals.length > 0) {
          rrBuffer.push(...parsed.rrIntervals);
          if (rrBuffer.length > 60) rrBuffer = rrBuffer.slice(-60);
        }

        onData({
          heartRate: parsed.heartRate,
          rrIntervals: parsed.rrIntervals,
          rmssd: calculateRMSSD(rrBuffer),
          sdnn: calculateSDNN(rrBuffer),
          timestamp: Date.now(),
        });
      }
    }
  );

  return {
    disconnect: () => {
      try {
        mgr.cancelDeviceConnection(deviceId);
        connectedDevice = null;
      } catch {}
    },
  };
}

// Parse BLE Heart Rate Measurement characteristic
function parseHRMeasurement(base64Value: string): {
  heartRate: number;
  rrIntervals: number[];
} {
  // Decode base64 to bytes
  const raw = atob(base64Value);
  const bytes = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) {
    bytes[i] = raw.charCodeAt(i);
  }

  const flags = bytes[0];
  const is16Bit = (flags & 0x01) !== 0;
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

  // Skip energy expended if present
  if (flags & 0x08) offset += 2;

  const rrIntervals: number[] = [];
  if (hasRR) {
    while (offset + 1 < bytes.length) {
      const rr = ((bytes[offset] | (bytes[offset + 1] << 8)) / 1024) * 1000;
      rrIntervals.push(Math.round(rr * 10) / 10);
      offset += 2;
    }
  }

  return { heartRate, rrIntervals };
}

// Calculate RMSSD
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

// Calculate SDNN
export function calculateSDNN(rrIntervals: number[]): number {
  if (rrIntervals.length < 2) return 0;
  const mean = rrIntervals.reduce((a, b) => a + b, 0) / rrIntervals.length;
  const variance =
    rrIntervals.reduce((sum, rr) => sum + Math.pow(rr - mean, 2), 0) /
    (rrIntervals.length - 1);
  return Math.round(Math.sqrt(variance) * 10) / 10;
}

// Get autonomic state from RMSSD
export function getAutonomicState(
  rmssd: number
): 'sympathetic' | 'parasympathetic' | 'transitioning' {
  if (rmssd >= 50) return 'parasympathetic';
  if (rmssd <= 25) return 'sympathetic';
  return 'transitioning';
}

// Check if connected
export function isDeviceConnected(): boolean {
  return connectedDevice !== null;
}

// Cleanup
export function destroyBLE() {
  if (connectedDevice) {
    try {
      const mgr = getManager();
      mgr?.cancelDeviceConnection(connectedDevice.id);
    } catch {}
    connectedDevice = null;
  }
  if (manager) {
    manager.destroy();
    manager = null;
  }
}
