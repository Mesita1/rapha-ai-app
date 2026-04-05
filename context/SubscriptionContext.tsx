import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { SubscriptionTier } from '../lib/types';

const TRIAL_START_KEY = 'rapha_trial_start';
const SUBSCRIPTION_KEY = 'rapha_subscription_tier';
const TRIAL_DURATION_DAYS = 14;

interface SubscriptionContextType {
  tier: SubscriptionTier;
  trialDaysRemaining: number | null;
  isTrialActive: boolean;
  hasProAccess: boolean;
  startTrial: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType>({
  tier: 'free',
  trialDaysRemaining: null,
  isTrialActive: false,
  hasProAccess: false,
  startTrial: async () => {},
});

function getSubscriptionTier(
  storedTier: string | null,
  trialStart: string | null,
): { tier: SubscriptionTier; trialDaysRemaining: number | null } {
  if (storedTier === 'pro' || storedTier === 'practitioner') {
    return { tier: storedTier as SubscriptionTier, trialDaysRemaining: null };
  }

  if (trialStart) {
    const start = new Date(trialStart);
    const now = new Date();
    const daysSince = Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    const remaining = TRIAL_DURATION_DAYS - daysSince;

    if (remaining > 0) {
      return { tier: 'pro_trial', trialDaysRemaining: remaining };
    }
  }

  return { tier: 'free', trialDaysRemaining: null };
}

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
  const [tier, setTier] = useState<SubscriptionTier>('free');
  const [trialDaysRemaining, setTrialDaysRemaining] = useState<number | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const [storedTier, trialStart] = await Promise.all([
          AsyncStorage.getItem(SUBSCRIPTION_KEY),
          AsyncStorage.getItem(TRIAL_START_KEY),
        ]);

        const result = getSubscriptionTier(storedTier, trialStart);
        setTier(result.tier);
        setTrialDaysRemaining(result.trialDaysRemaining);
      } catch {
        setTier('free');
      }
    })();
  }, []);

  const startTrial = async () => {
    const now = new Date().toISOString();
    await AsyncStorage.setItem(TRIAL_START_KEY, now);
    setTier('pro_trial');
    setTrialDaysRemaining(TRIAL_DURATION_DAYS);
  };

  const isTrialActive = tier === 'pro_trial';
  const hasProAccess = tier === 'pro_trial' || tier === 'pro' || tier === 'practitioner';

  return (
    <SubscriptionContext.Provider value={{ tier, trialDaysRemaining, isTrialActive, hasProAccess, startTrial }}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export const useSubscription = () => useContext(SubscriptionContext);
