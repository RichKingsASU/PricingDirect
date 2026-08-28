/// <reference types="vite/client" />
import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database';

const supabaseUrl = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.VITE_SUPABASE_URL : undefined;
const supabaseAnonKey = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.VITE_SUPABASE_ANON_KEY : undefined;

if (!supabaseUrl || !supabaseAnonKey) {
  // Safe warning in development/standalone mode
}

// Create a single supabase client for interacting with your database
export const supabase = createClient<Database>(
  supabaseUrl || 'https://placeholder-url.supabase.co',
  supabaseAnonKey || 'placeholder-anon-key'
);
