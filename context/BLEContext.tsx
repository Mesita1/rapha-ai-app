import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { Platform } from 'react-native';
import type { BLEDevice, HRVData } from '../lib/bluetooth';

interface BLEContextType {
  // State
  isScanning: boolean;
  devices: BLEDevice[];
  connectedDevice: BLEDevice | null;
  isConnected: boolean;
  heartRate: number;
  rmssd: number;
  sdnn: number;
  pnn50: number;
  signalQuality: 'excellent' | 'good' | 'poor' | 'bad' | 'none';
  rrIntervals: number[];
  rmssdHistory: number[];
  // Actions
  startScan: () => void;
  stopScan: () => void;
  connectToDevice: (deviceId: string) => Promise<void>;
  disconnect: () => void;
}

const BLEContext = createContext<BLEContextType>({
  isScanning: false,
  devices: [],
  connectedDevice: null,
  isConnected: false,
  heartRate: 0,
  rmssd: 0,
  sdnn: 0,
  pnn50: 0,
  signalQuality: 'none',
  rrIntervals: [],
  rmssdHistory: [],
  startScan: () => {},
  stopScan: () => {},
  connectToDevice: async () => {},
  disconnect: () => {},
});

export function BLEProvider({ children }: { children: React.ReactNode }) {
  const [isScanning, setIsScanning] = useState(false);
  const [devices, setDevices] = useState<BLEDevice[]>([]);
  const [connectedDevice, setConnectedDevice] = useState<BLEDevice | null>(null);
  const [heartRate, setHeartRate] = useState(0);
  const [rmssd, setRmssd] = useState(0);
  const [sdnn, setSdnn] = useState(0);
  const [pnn50, setPnn50] = useState(0);
  const [signalQuality, setSignalQuality] = useState<'excellent' | 'good' | 'poor' | 'bad' | 'none'>('none');
  const [rrIntervals, setRrIntervals] = useState<number[]>([]);
  const [rmssdHistory, setRmssdHistory] = useState<number[]>([]);

  const stopScanRef = useRef<(() => void) | null>(null);
  const disconnectRef = useRef<(() => void) | null>(null);

  const startScan = useCallback(() => {
    if (Platform.OS === 'web') return;

    setDevices([]);
    setIsScanning(true);

    try {
      const bt = require('../lib/bluetooth');
      bt.requestBLEPermissions().then((granted: boolean) => {
        if (!granted) {
          setIsScanning(false);
          return;
        }

        const stop = bt.scanForDevices(
          (device: BLEDevice) => {
            setDevices((prev) => {
              if (prev.find((d) => d.id === device.id)) return prev;
              return [...prev, device];
            });
          },
          (error: string) => {
            console.warn('BLE scan error:', error);
            setIsScanning(false);
          }
        );
        stopScanRef.current = stop;

        // Auto-stop after 15 seconds
        setTimeout(() => {
          stop();
          setIsScanning(false);
        }, 15000);
      });
    } catch {
      setIsScanning(false);
    }
  }, []);

  const stopScan = useCallback(() => {
    stopScanRef.current?.();
    setIsScanning(false);
  }, []);

  const connectToDevice = useCallback(async (deviceId: string) => {
    if (Platform.OS === 'web') return;

    try {
      const bt = require('../lib/bluetooth');
      stopScanRef.current?.();
      setIsScanning(false);

      const device = devices.find((d) => d.id === deviceId);

      const connection = await bt.connectAndStream(
        deviceId,
        (data: HRVData) => {
          setHeartRate(data.heartRate);
          setRmssd(data.rmssd);
          setSdnn(data.sdnn);
          setPnn50(data.pnn50);
          setSignalQuality(data.signalQuality);
          setRrIntervals(data.rrIntervals);
          if (data.rmssd > 0) {
            setRmssdHistory((prev) => {
              const updated = [...prev, data.rmssd];
              return updated.slice(-60); // Keep last 60 readings
            });
          }
        },
        () => {
          // On disconnect
          setConnectedDevice(null);
          setHeartRate(0);
          setRmssd(0);
          setSdnn(0);
        },
        (error: string) => {
          console.warn('BLE stream error:', error);
        }
      );

      disconnectRef.current = connection.disconnect;
      setConnectedDevice(device || { id: deviceId, name: 'Unknown Device', rssi: -100 });
    } catch (error) {
      console.warn('BLE connect failed:', error);
    }
  }, [devices]);

  const disconnect = useCallback(() => {
    disconnectRef.current?.();
    setConnectedDevice(null);
    setHeartRate(0);
    setRmssd(0);
    setSdnn(0);
    setRmssdHistory([]);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnectRef.current?.();
      stopScanRef.current?.();
    };
  }, []);

  return (
    <BLEContext.Provider
      value={{
        isScanning,
        devices,
        connectedDevice,
        isConnected: connectedDevice !== null,
        heartRate,
        rmssd,
        sdnn,
        pnn50,
        signalQuality,
        rrIntervals,
        rmssdHistory,
        startScan,
        stopScan,
        connectToDevice,
        disconnect,
      }}
    >
      {children}
    </BLEContext.Provider>
  );
}

export const useBLE = () => useContext(BLEContext);
