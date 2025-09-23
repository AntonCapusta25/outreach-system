import { createClient } from '@supabase/supabase-js';

// The URL and anon key are now read from environment variables.
// The NEXT_PUBLIC_ prefix is a Next.js convention for client-side variables.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
