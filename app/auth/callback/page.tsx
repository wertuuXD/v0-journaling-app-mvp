/**
 * OAuth Callback Page
 * 
 * Handles the redirect from Google OAuth after sign-in.
 * Automatically backs up local journal entries to cloud after successful authentication.
 * Prevents duplicate uploads by checking which entries already exist in cloud storage.
 */

"use client"

import { useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { Loader2, Cloud } from "lucide-react"

const STORAGE_KEY = "unwind-journal-entries"

export default function AuthCallback() {
  const router = useRouter()

  useEffect(() => {
    const handleAuth = async () => {
      try {
        // Get the session from the URL hash
        const { data: { session }, error } = await supabase!.auth.getSession()

        if (error) throw error

        if (session) {
          // Get current user
          const { data: { user } } = await supabase!.auth.getUser()
          if (!user) throw new Error("No user found")

          // Get local entries
          let entries: any[] = []
          try {
            const stored = localStorage.getItem(STORAGE_KEY)
            if (stored) {
              const parsed = JSON.parse(stored)
              if (Array.isArray(parsed)) {
                entries = parsed
              }
            }
          } catch (e) {
            console.error("Failed to load local entries:", e)
          }

          // Backup all entries to cloud (only new ones)
          if (entries.length > 0) {
            // Check which entries already exist
            const entryTimestamps = entries.map((e: any) => e.createdAt)
            
            const { data: existingEntries } = await supabase!
              .from('journal_entries')
              .select('local_created_at')
              .eq('user_id', user.id)
              .in('local_created_at', entryTimestamps)

            const existingTimestamps = new Set(
              existingEntries?.map((e: any) => new Date(e.local_created_at).toISOString()) || []
            )
            
            const newEntries = entries.filter((e: any) => {
              const entryTime = new Date(e.createdAt).toISOString()
              return !existingTimestamps.has(entryTime)
            })

            // Only backup new entries
            if (newEntries.length > 0) {
              const backupPromises = newEntries.map(async (entry: any) => {
                return supabase!.from('journal_entries').upsert({
                  user_id: user.id,
                  content: entry.content,
                  mood: entry.mood,
                  local_created_at: entry.createdAt,
                  local_updated_at: entry.updatedAt,
                }, {
                  onConflict: 'user_id,local_created_at'
                })
              })

              await Promise.all(backupPromises)
              toast.success(`Backed up ${newEntries.length} new entries to the cloud!`)
            } else {
              toast.success("Signed in successfully! All entries already backed up.")
            }
          } else {
            toast.success("Signed in successfully!")
          }

          // Redirect to data manager
          router.push("/?view=data")
        } else {
          toast.error("Authentication failed")
          router.push("/?view=data")
        }
      } catch (error) {
        // Log detailed error only in development
        if (process.env.NODE_ENV === 'development') {
          console.error("Auth callback error:", error)
        }
        // Show generic message to users (security: don't leak implementation details)
        toast.error("Sign in failed. Please try again.")
        router.push("/?view=data")
      }
    }

    handleAuth()
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full">
          <Cloud className="h-8 w-8 text-primary animate-pulse" />
        </div>
        <h2 className="text-lg font-semibold">Completing sign in...</h2>
        <div className="flex items-center justify-center gap-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm">Please wait</span>
        </div>
      </div>
    </div>
  )
}
