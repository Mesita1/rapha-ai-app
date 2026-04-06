export type SubscriptionTier = 'free' | 'pro_trial' | 'pro' | 'elite' | 'practitioner';
export type DeviceType = 'polar_h10' | 'apple_watch' | 'garmin' | 'whoop' | 'oura' | 'muse' | 'other';
export type DeviceStatus = 'connected' | 'disconnected';
export type AutonomicState = 'parasympathetic' | 'transitional' | 'sympathetic' | 'dorsal_vagal';
export type HRVTrend = 'rising' | 'falling' | 'stable';
export type InterventionCategory = 'supplement' | 'therapy' | 'activity' | 'food' | 'prayer' | 'breathwork' | 'rest' | 'stress' | 'medication' | 'other';
export type ChatRole = 'user' | 'assistant';

export interface Profile {
  id: string;
  name: string;
  age: number;
  health_goals: string[];
  conditions: string;
  subscription_tier: SubscriptionTier;
  created_at: string;
}

export interface Device {
  id: string;
  user_id: string;
  type: DeviceType;
  name: string;
  last_connected: string;
  status: DeviceStatus;
}

export interface HRVReading {
  id: string;
  user_id: string;
  device_id: string;
  timestamp: string;
  heart_rate: number;
  rmssd: number;
  sdnn: number;
  autonomic_state: AutonomicState;
}

export interface Intervention {
  id: string;
  user_id: string;
  timestamp: string;
  raw_text: string;
  category: InterventionCategory;
  parsed_name: string;
  dose: string | null;
  pre_rmssd: number | null;
  post_rmssd: number | null;
  rmssd_delta: number | null;
  impact_score: number | null;
}

export interface ChatMessage {
  id: string;
  user_id?: string;
  role: ChatRole;
  content: string;
  timestamp: string;
  intervention_id?: string | null;
}

export interface InsightPattern {
  id: string;
  user_id: string;
  intervention_name: string;
  category: string;
  observation_count: number;
  avg_rmssd_delta: number;
  confidence_score: number;
}

export interface SleepRecord {
  id: string;
  user_id: string;
  date: string;
  avg_overnight_rmssd: number;
  avg_overnight_hr: number;
  sleep_score: number;
}

export interface CommunityInsight {
  id: string;
  intervention_name: string;
  category: string;
  avg_rmssd_delta: number;
  observation_count: number;
  user_count: number;
  confidence_score: number;
  last_updated: string;
}

export interface CurrentHRV {
  rmssd: number;
  heartRate: number;
  sdnn: number;
  sd1: number;
  autonomicState: AutonomicState;
  trend: HRVTrend;
  timestamp: string;
}
