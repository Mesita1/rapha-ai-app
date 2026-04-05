import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const DEVICE_ID_KEY = 'rapha_device_id';
const TRIAL_USED_KEY = 'rapha_trial_used_device';

// Generate or retrieve a persistent device ID
export async function getDeviceId(): Promise<string> {
  let id = await AsyncStorage.getItem(DEVICE_ID_KEY);
  if (!id) {
    // Generate a UUID-like ID
    id = 'dev_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 9);
    await AsyncStorage.setItem(DEVICE_ID_KEY, id);
  }
  return id;
}

// Mark that this device has used a trial
export async function markTrialUsed(): Promise<void> {
  await AsyncStorage.setItem(TRIAL_USED_KEY, 'true');
}

// Check if this device already used a trial
export async function hasDeviceUsedTrial(): Promise<boolean> {
  const used = await AsyncStorage.getItem(TRIAL_USED_KEY);
  return used === 'true';
}
