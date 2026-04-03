import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useBLE } from './BLEContext';
import {
  startTracking,
  checkPendingSnapshots,
  getTrackers,
  cleanupTrackers,
  getNextCheckTime,
  getCorrelationSummary,
  type InterventionTracker,
} from '../lib/hrvTracker';

interface Notification {
  id: number;
  interventionName: string;
  label: string;
  delta: number;
  rmssd: number;
  timestamp: number;
}

interface HRVTrackerContextType {
  activeTrackers: InterventionTracker[];
  notifications: Notification[];
  trackIntervention: (id: string, name: string, category: string) => Promise<void>;
  dismissNotification: (id: number) => void;
  getNextCheck: (tracker: InterventionTracker) => string | null;
  getSummary: (tracker: InterventionTracker) => string;
  refreshTrackers: () => Promise<void>;
}

const HRVTrackerContext = createContext<HRVTrackerContextType>({
  activeTrackers: [],
  notifications: [],
  trackIntervention: async () => {},
  dismissNotification: () => {},
  getNextCheck: () => null,
  getSummary: () => '',
  refreshTrackers: async () => {},
});

export function HRVTrackerProvider({ children }: { children: React.ReactNode }) {
  const { isConnected, rmssd, heartRate } = useBLE();
  const [activeTrackers, setActiveTrackers] = useState<InterventionTracker[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const notifIdRef = useRef(0);

  const refreshTrackers = useCallback(async () => {
    const trackers = await getTrackers();
    setActiveTrackers(trackers.filter(t => !t.completed));
  }, []);

  // Poll every 15 seconds when BLE is connected
  useEffect(() => {
    if (!isConnected || rmssd <= 0) return;

    const interval = setInterval(async () => {
      const results = await checkPendingSnapshots(rmssd, heartRate);
      if (results.length > 0) {
        const newNotifs = results.map(r => ({
          id: ++notifIdRef.current,
          interventionName: r.interventionName,
          label: r.label,
          delta: r.delta,
          rmssd: r.rmssd,
          timestamp: Date.now(),
        }));
        setNotifications(prev => [...prev, ...newNotifs]);
        await refreshTrackers();

        // Auto-dismiss after 8 seconds
        setTimeout(() => {
          const ids = newNotifs.map(n => n.id);
          setNotifications(prev => prev.filter(n => !ids.includes(n.id)));
        }, 8000);
      }
    }, 15000);

    return () => clearInterval(interval);
  }, [isConnected, rmssd, heartRate, refreshTrackers]);

  // Load trackers on mount and cleanup old ones
  useEffect(() => {
    cleanupTrackers().then(refreshTrackers);
  }, [refreshTrackers]);

  const trackIntervention = useCallback(async (id: string, name: string, category: string) => {
    const currentRmssd = isConnected && rmssd > 0 ? rmssd : null;
    await startTracking(id, name, category, currentRmssd, heartRate);
    await refreshTrackers();
  }, [isConnected, rmssd, heartRate, refreshTrackers]);

  const dismissNotification = useCallback((id: number) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  return (
    <HRVTrackerContext.Provider value={{
      activeTrackers,
      notifications,
      trackIntervention,
      dismissNotification,
      getNextCheck: getNextCheckTime,
      getSummary: getCorrelationSummary,
      refreshTrackers,
    }}>
      {children}
    </HRVTrackerContext.Provider>
  );
}

export const useHRVTracker = () => useContext(HRVTrackerContext);
