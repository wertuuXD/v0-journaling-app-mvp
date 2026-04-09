import { JournalApp } from "@/components/journal/journal-app"
import { ErrorBoundary } from "@/components/error-boundary"
import { isSupabaseConfigured } from "@/lib/supabase"

// Debug: Check Supabase config on server
console.log('[Server] Supabase configured:', isSupabaseConfigured)
console.log('[Server] URL exists:', !!process.env.NEXT_PUBLIC_SUPABASE_URL)
console.log('[Server] Key exists:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
console.log('[Server] Key prefix:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 10))

export default function Page() {
  return (
    <ErrorBoundary>
      <JournalApp />
    </ErrorBoundary>
  )
}
