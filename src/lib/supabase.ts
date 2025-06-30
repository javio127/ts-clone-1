import { createClient } from '@supabase/supabase-js';

// For server-side (API routes), use regular env vars without NEXT_PUBLIC_
const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);

export type SearchRecord = {
  id?: string;
  query: string;
  answer: string;
  created_at?: string;
}; 