
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Replace these with your actual values from the Supabase Dashboard -> Settings -> API
// or use Environment Variables
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'YOUR_SUPABASE_URL_HERE';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY_HERE';

const isValidUrl = (url: string) => {
  try {
    return new URL(url).protocol.startsWith('http');
  } catch (e) {
    return false;
  }
};

export const supabase: SupabaseClient | null = (isValidUrl(supabaseUrl) && supabaseAnonKey !== 'YOUR_SUPABASE_ANON_KEY_HERE')
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;
