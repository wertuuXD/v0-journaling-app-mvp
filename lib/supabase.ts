import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Validate URL is actually a valid HTTP/HTTPS URL (not a placeholder)
const isValidUrl = (url: string | undefined): boolean => {
  if (!url) return false
  try {
    const parsed = new URL(url)
    return parsed.protocol === 'http:' || parsed.protocol === 'https:'
  } catch {
    return false
  }
}

// Check if key is a valid Supabase key (JWT format or new publishable format)
const isValidKey = (key: string | undefined): boolean => {
  if (!key) return false
  // Reject placeholder values
  if (key.includes('your_') || key.includes('placeholder')) return false
  // Accept new format: sb_publishable_xxx
  if (key.startsWith('sb_publishable_')) return true
  // Accept old JWT format: eyJ...
  if (key.startsWith('eyJ')) return true
  return false
}

export const supabase = isValidUrl(supabaseUrl) && isValidKey(supabaseAnonKey)
  ? createClient(supabaseUrl!, supabaseAnonKey!)
  : null

export const isSupabaseConfigured = !!(isValidUrl(supabaseUrl) && isValidKey(supabaseAnonKey))
