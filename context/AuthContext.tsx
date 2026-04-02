import React, { createContext, useContext, useEffect, useState } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  signUp: (email: string, password: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  isOnboarded: boolean;
  setIsOnboarded: (val: boolean) => void;
  displayName: string;
  setDisplayName: (name: string) => void;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  isLoading: true,
  signUp: async () => ({ error: null }),
  signIn: async () => ({ error: null }),
  signOut: async () => {},
  isOnboarded: false,
  setIsOnboarded: () => {},
  displayName: '',
  setDisplayName: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isOnboarded, setIsOnboarded] = useState(false);
  const [displayName, setDisplayName] = useState('');

  useEffect(() => {
    // Gracefully handle Supabase connection failures (e.g. missing credentials)
    let subscription: { unsubscribe: () => void } | null = null;

    try {
      supabase.auth.getSession().then(({ data: { session: s } }) => {
        setSession(s);
        setIsLoading(false);
      }).catch(() => {
        // Supabase unavailable — continue in demo/offline mode
        setIsLoading(false);
      });

      const { data } = supabase.auth.onAuthStateChange((_event, s) => {
        setSession(s);
      });
      subscription = data?.subscription ?? null;
    } catch {
      // Supabase init failed — continue in demo/offline mode
      setIsLoading(false);
    }

    return () => {
      try {
        subscription?.unsubscribe();
      } catch {
        // ignore cleanup errors
      }
    };
  }, []);

  const signUp = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signUp({ email, password });
      return { error: error as Error | null };
    } catch (e) {
      return { error: e as Error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      return { error: error as Error | null };
    } catch (e) {
      return { error: e as Error };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch {
      // ignore
    }
    setSession(null);
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user: session?.user ?? null,
        isLoading,
        signUp,
        signIn,
        signOut,
        isOnboarded,
        setIsOnboarded,
        displayName,
        setDisplayName,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
