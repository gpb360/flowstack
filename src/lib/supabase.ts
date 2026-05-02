import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log('Supabase Init: URL present?', !!supabaseUrl, 'Key present?', !!supabaseAnonKey);

// Use 'any' for Database generic to avoid PostgREST v12 type resolution issues
// with the current database.types.ts format. This trades query-level type safety
// for compilation. The types can be regenerated with `supabase gen types` once
// the Supabase project is connected.
export const supabase = createClient<any>(supabaseUrl || '', supabaseAnonKey || '');

// Re-export the Database type for components that need row types
export type { Database };
