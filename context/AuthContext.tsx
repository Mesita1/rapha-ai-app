import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

interface LocalUser {
  email: string;
  displayName: string;
}

interface AuthContextType {
  user: LocalUser | null;
  isLoading: boolean;
  isLoggedIn: boolean;
  isOnboarded: boolean;
  signUp: (email: string, password: string, displayName: string) => Promise<{ error: string | null }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  setIsOnboarded: (val: boolean) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  isLoggedIn: false,
  isOnboarded: false,
  signUp: async () => ({ error: null }),
  signIn: async () => ({ error: null }),
  signOut: async () => {},
  setIsOnboarded: () => {},
});

const AUTH_KEY = 'rapha_auth';
const ONBOARDED_KEY = 'rapha_onboarded';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<LocalUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isOnboarded, setIsOnboardedState] = useState(false);

  // On mount: check Supabase session first, then local fallback
  useEffect(() => {
    (async () => {
      if (isSupabaseConfigured) {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            const displayName = session.user.user_metadata?.display_name || session.user.email?.split('@')[0] || '';
            const userData: LocalUser = { email: session.user.email || '', displayName };
            await AsyncStorage.setItem(AUTH_KEY, JSON.stringify(userData));
            setUser(userData);
            const onboarded = await AsyncStorage.getItem(ONBOARDED_KEY);
            if (onboarded === 'true') setIsOnboardedState(true);
            setIsLoading(false);
            return;
          }
        } catch {
          // Supabase unavailable — check local
        }
      }

      // Local fallback
      try {
        const saved = await AsyncStorage.getItem(AUTH_KEY);
        const onboarded = await AsyncStorage.getItem(ONBOARDED_KEY);
        if (saved) setUser(JSON.parse(saved));
        if (onboarded === 'true') setIsOnboardedState(true);
      } catch {}
      setIsLoading(false);
    })();
  }, []);

  const signUp = async (email: string, password: string, displayName: string) => {
    if (!email || !password || !displayName) return { error: 'All fields are required' };
    if (!email.includes('@')) return { error: 'Please enter a valid email' };
    if (password.length < 6) return { error: 'Password must be at least 6 characters' };

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim().toLowerCase(),
          password,
          options: { data: { display_name: displayName.trim() } },
        });

        if (error) {
          console.warn('Supabase signup failed, using local:', error.message);
          // Fall through to local fallback below
        } else {
          // Supabase succeeded — also save locally for offline access
          const userData: LocalUser = { email: email.trim().toLowerCase(), displayName: displayName.trim() };
          await AsyncStorage.setItem(AUTH_KEY, JSON.stringify(userData));
          setUser(userData);
          return { error: null };
        }
      } catch {
        // Network error — use local auth
      }
    }

    // Local fallback
    const userData: LocalUser = { email: email.trim().toLowerCase(), displayName: displayName.trim() };
    try {
      await AsyncStorage.setItem(AUTH_KEY, JSON.stringify(userData));
      await AsyncStorage.setItem('rapha_pw', password);
      setUser(userData);
      return { error: null };
    } catch {
      return { error: 'Failed to create account' };
    }
  };

  const signIn = async (email: string, password: string) => {
    if (!email || !password) return { error: 'Email and password are required' };

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim().toLowerCase(),
          password,
        });

        if (!error && data.user) {
          const displayName = data.user.user_metadata?.display_name || email.split('@')[0];
          const userData: LocalUser = { email: data.user.email || email, displayName };
          await AsyncStorage.setItem(AUTH_KEY, JSON.stringify(userData));
          setUser(userData);
          return { error: null };
        }
        // If Supabase fails, try local
      } catch {
        // Network error — try local
      }
    }

    // Local fallback
    try {
      const saved = await AsyncStorage.getItem(AUTH_KEY);
      const savedPw = await AsyncStorage.getItem('rapha_pw');
      if (!saved) return { error: 'No account found. Please sign up first.' };
      const savedUser = JSON.parse(saved);
      if (savedUser.email !== email.trim().toLowerCase()) return { error: 'No account found with that email.' };
      if (savedPw !== password) return { error: 'Incorrect password.' };
      setUser(savedUser);
      return { error: null };
    } catch {
      return { error: 'Login failed' };
    }
  };

  const signOut = async () => {
    try { await supabase.auth.signOut(); } catch {}
    try { await AsyncStorage.multiRemove([AUTH_KEY, 'rapha_pw', ONBOARDED_KEY]); } catch {}
    setUser(null);
    setIsOnboardedState(false);
  };

  const setIsOnboarded = async (val: boolean) => {
    setIsOnboardedState(val);
    try { await AsyncStorage.setItem(ONBOARDED_KEY, val ? 'true' : 'false'); } catch {}
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, isLoggedIn: user !== null, isOnboarded, signUp, signIn, signOut, setIsOnboarded }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
