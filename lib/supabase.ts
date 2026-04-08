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

export const supabase = isValidUrl(supabaseUrl) && supabaseAnonKey && !supabaseAnonKey.includes('your_')
  ? createClient(supabaseUrl!, supabaseAnonKey)
  : null

export const isSupabaseConfigured = !!(isValidUrl(supabaseUrl) && supabaseAnonKey && !supabaseAnonKey.includes('your_'))
