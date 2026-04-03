import AsyncStorage from '@react-native-async-storage/async-storage';

const TRACKER_KEY = 'rapha_hrv_trackers';

export interface HRVSnapshot {
  rmssd: number;
  heartRate: number;
  timestamp: string;
  label: string;
}

export interface InterventionTracker {
  interventionId: string;
  interventionName: string;
  category: string;
  loggedAt: string;
  baselineRmssd: number | null;
  snapshots: HRVSnapshot[];
  pendingChecks: string[];
  completed: boolean;
}

const CHECK_INTERVALS = [
  { label: '2min', delayMs: 2 * 60 * 1000 },
  { label: '5min', delayMs: 5 * 60 * 1000 },
  { label: '10min', delayMs: 10 * 60 * 1000 },
  { label: '30min', delayMs: 30 * 60 * 1000 },
  { label: '1hr', delayMs: 60 * 60 * 1000 },
  { label: '2hr', delayMs: 2 * 60 * 60 * 1000 },
];

export async function getTrackers(): Promise<InterventionTracker[]> {
  try {
    const saved = await AsyncStorage.getItem(TRACKER_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch { return []; }
}

async function saveTrackers(trackers: InterventionTracker[]): Promise<void> {
  await AsyncStorage.setItem(TRACKER_KEY, JSON.stringify(trackers));
}

export async function startTracking(
  interventionId: string,
  interventionName: string,
  category: string,
  currentRmssd: number | null,
  currentHR: number = 0
): Promise<void> {
  const trackers = await getTrackers();
  const newTracker: InterventionTracker = {
    interventionId,
    interventionName,
    category,
    loggedAt: new Date().toISOString(),
    baselineRmssd: currentRmssd,
    snapshots: currentRmssd ? [{
      rmssd: currentRmssd, heartRate: currentHR,
      timestamp: new Date().toISOString(), label: 'baseline',
    }] : [],
    pendingChecks: CHECK_INTERVALS.map(c => c.label),
    completed: false,
  };
  trackers.push(newTracker);
  await saveTrackers(trackers);
}

export async function checkPendingSnapshots(
  currentRmssd: number,
  currentHR: number
): Promise<{ interventionName: string; label: string; delta: number; rmssd: number }[]> {
  const trackers = await getTrackers();
  const notifications: { interventionName: string; label: string; delta: number; rmssd: number }[] = [];
  const now = Date.now();
  let changed = false;

  for (const tracker of trackers) {
    if (tracker.completed) continue;
    const loggedTime = new Date(tracker.loggedAt).getTime();
    const newPending: string[] = [];

    for (const checkLabel of tracker.pendingChecks) {
      const interval = CHECK_INTERVALS.find(c => c.label === checkLabel);
      if (!interval) continue;
      const targetTime = loggedTime + interval.delayMs;
      const windowMs = 30 * 1000;

      if (now >= targetTime - windowMs && now <= targetTime + windowMs) {
        tracker.snapshots.push({
          rmssd: currentRmssd, heartRate: currentHR,
          timestamp: new Date().toISOString(), label: checkLabel,
        });
        const delta = tracker.baselineRmssd
          ? Math.round((currentRmssd - tracker.baselineRmssd) * 10) / 10 : 0;
        notifications.push({ interventionName: tracker.interventionName, label: checkLabel, delta, rmssd: currentRmssd });
        changed = true;
      } else if (now < targetTime + windowMs) {
        newPending.push(checkLabel);
      }
    }
    tracker.pendingChecks = newPending;
    if (newPending.length === 0) tracker.completed = true;
  }

  if (changed) await saveTrackers(trackers);
  return notifications;
}

export function getNextCheckTime(tracker: InterventionTracker): string | null {
  if (tracker.pendingChecks.length === 0) return null;
  const nextLabel = tracker.pendingChecks[0];
  const interval = CHECK_INTERVALS.find(c => c.label === nextLabel);
  if (!interval) return null;
  const targetTime = new Date(tracker.loggedAt).getTime() + interval.delayMs;
  const remaining = targetTime - Date.now();
  if (remaining <= 0) return 'now';
  const mins = Math.ceil(remaining / 60000);
  return mins >= 60 ? `${Math.floor(mins / 60)}h ${mins % 60}m` : `${mins}m`;
}

export function getCorrelationSummary(tracker: InterventionTracker): string {
  if (!tracker.baselineRmssd || tracker.snapshots.length < 2) return 'Tracking in progress...';
  const baseline = tracker.baselineRmssd;
  const latest = tracker.snapshots[tracker.snapshots.length - 1];
  const peak = tracker.snapshots.reduce((max, s) => s.rmssd > max.rmssd ? s : max, tracker.snapshots[0]);
  const overallDelta = Math.round((latest.rmssd - baseline) * 10) / 10;
  const peakDelta = Math.round((peak.rmssd - baseline) * 10) / 10;

  if (overallDelta > 3) return `+${overallDelta}ms overall. Peaked at +${peakDelta}ms (${peak.label}).`;
  if (overallDelta < -3) return `${overallDelta}ms overall. Dipped most at ${tracker.snapshots.reduce((min, s) => s.rmssd < min.rmssd ? s : min, tracker.snapshots[0]).label}.`;
  return `Minimal change (${overallDelta > 0 ? '+' : ''}${overallDelta}ms).`;
}

export async function cleanupTrackers(): Promise<void> {
  const trackers = await getTrackers();
  const cutoff = Date.now() - 24 * 60 * 60 * 1000;
  const active = trackers.filter(t => !t.completed || new Date(t.loggedAt).getTime() > cutoff);
  await saveTrackers(active);
}
