import { createClient } from '@supabase/supabase-js'

// These are public anon keys — safe to expose in client-side code.
// Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null
