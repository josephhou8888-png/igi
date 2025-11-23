
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Helper to access environment variables in both Vite and Create React App environments
const getEnv = (key: string) => {
  // Check for Vite environment (import.meta.env)
  // @ts-ignore
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    // @ts-ignore
    return import.meta.env[key];
  }
  // Check for Node/CRA environment (process.env)
  if (typeof process !== 'undefined' && process.env) {
    return process.env[key];
  }
  return undefined;
};

// Try VITE_ prefix first (standard for Vite), then REACT_APP_ (standard for CRA), then fallback
const supabaseUrl = getEnv('VITE_SUPABASE_URL') || getEnv('REACT_APP_SUPABASE_URL') || 'YOUR_SUPABASE_URL_HERE';
const supabaseAnonKey = getEnv('VITE_SUPABASE_ANON_KEY') || getEnv('REACT_APP_SUPABASE_ANON_KEY') || 'YOUR_SUPABASE_ANON_KEY_HERE';

const isValidUrl = (url: string) => {
  try {
    return new URL(url).protocol.startsWith('http');
  } catch (e) {
    return false;
  }
};

// Initialize Supabase only if valid configuration exists
export const supabase: SupabaseClient | null = (isValidUrl(supabaseUrl) && supabaseAnonKey !== 'YOUR_SUPABASE_ANON_KEY_HERE')
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;
