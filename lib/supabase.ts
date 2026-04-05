import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fzktdrwgqijjzrmqivqf.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ6a3RkcndncWlqanpybXFpdnFmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUzNTY3MDksImV4cCI6MjA5MDkzMjcwOX0.k3DX5nEWHp0Lq1-hErkep-_4kdlAltU8OIEpwo3JCik';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

export const isSupabaseConfigured = true;
