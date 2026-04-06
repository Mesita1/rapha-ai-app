import { Platform } from 'react-native';

// RevenueCat Product IDs (to be configured in RevenueCat dashboard)
// These are placeholder IDs — Steve needs to create these in RevenueCat + App Store Connect
export const PRODUCT_IDS = {
  pro_monthly: 'rapha_pro_monthly_1999',
  pro_annual: 'rapha_pro_annual_12999',
  elite_monthly: 'rapha_elite_monthly_2999',
  elite_annual: 'rapha_elite_annual_19999',
  practitioner_monthly: 'rapha_practitioner_monthly_4999',
  practitioner_annual: 'rapha_practitioner_annual_39999',
};

// RevenueCat API keys (to be filled in by Steve from RevenueCat dashboard)
export const RC_IOS_KEY = 'REVENUECAT_IOS_KEY_HERE';
export const RC_ANDROID_KEY = 'REVENUECAT_ANDROID_KEY_HERE';

let Purchases: any = null;

export function initRevenueCat(userId?: string) {
  if (Platform.OS === 'web') return;
  try {
    const RC = require('react-native-purchases');
    Purchases = RC.default;
    const apiKey = Platform.OS === 'ios' ? RC_IOS_KEY : RC_ANDROID_KEY;

    if (apiKey === 'REVENUECAT_IOS_KEY_HERE' || apiKey === 'REVENUECAT_ANDROID_KEY_HERE') {
      console.log('RevenueCat: API keys not configured yet — running in mock mode');
      return;
    }

    Purchases.configure({ apiKey });
    if (userId) {
      Purchases.logIn(userId);
    }
  } catch (e) {
    console.warn('RevenueCat not available:', e);
  }
}

export async function getOfferings() {
  if (!Purchases) return null;
  try {
    const offerings = await Purchases.getOfferings();
    return offerings.current;
  } catch {
    return null;
  }
}

export async function purchasePackage(packageToPurchase: any) {
  if (!Purchases) return { success: false, error: 'RevenueCat not initialized' };
  try {
    const { customerInfo } = await Purchases.purchasePackage(packageToPurchase);
    return { success: true, customerInfo };
  } catch (e: any) {
    if (e.userCancelled) return { success: false, cancelled: true };
    return { success: false, error: e.message };
  }
}

export async function restorePurchases() {
  if (!Purchases) return null;
  try {
    const customerInfo = await Purchases.restorePurchases();
    return customerInfo;
  } catch {
    return null;
  }
}

export async function getCurrentEntitlements() {
  if (!Purchases) return null;
  try {
    const customerInfo = await Purchases.getCustomerInfo();
    return customerInfo.entitlements.active;
  } catch {
    return null;
  }
}
