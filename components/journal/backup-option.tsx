"use client"

import { useState } from "react"
import { supabase, isSupabaseConfigured } from "@/lib/supabase"
import { toast } from "sonner"
import { Cloud, Lock, Mail, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface BackupProps {
  onBackupComplete?: () => void
  entries: any[]
}

export function BackupOption({ onBackupComplete, entries }: BackupProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSignedUp, setIsSignedUp] = useState(false)

  const handleBackup = async () => {
    if (!isSupabaseConfigured) {
      toast.error("Cloud backup not available. Please configure Supabase.")
      return
    }

    if (!email || !password) {
      toast.error("Please enter email and password")
      return
    }

    setIsLoading(true)

    try {
      // Sign up or sign in user
      const { data: authData, error: authError } = await supabase!.auth.signInWithPassword({
        email,
        password,
      })

      if (authError) {
        // If sign in fails, try sign up
        const { data: signUpData, error: signUpError } = await supabase!.auth.signUp({
          email,
          password,
        })

        if (signUpError) {
          throw signUpError
        }

        // Sign in after successful sign up
        const { data: signInData, error: signInError } = await supabase!.auth.signInWithPassword({
          email,
          password,
        })

        if (signInError) {
          throw signInError
        }
      }

      // Get current user
      const { data: { user } } = await supabase!.auth.getUser()
      if (!user) throw new Error("Authentication failed")

      // Backup all existing entries
      const backupPromises = entries.map(async (entry) => {
        return supabase!.from('journal_entries').upsert({
          user_id: user.id,
          content: entry.content,
          mood: entry.mood,
          local_created_at: entry.createdAt,
          local_updated_at: entry.updatedAt,
        })
      })

      await Promise.all(backupPromises)

      setIsSignedUp(true)
      toast.success(`Successfully backed up ${entries.length} entries to the cloud!`)
      onBackupComplete?.()

    } catch (error) {
      console.error("Backup error:", error)
      toast.error("Backup failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  if (!isSupabaseConfigured) {
    return (
      <div className="space-y-6">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-muted/20 rounded-full mb-4">
            <Cloud className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-muted-foreground">Cloud Backup</h3>
          <p className="text-sm text-muted-foreground/60 max-w-sm mx-auto">
            Cloud backup is not configured. Set up Supabase to enable cloud sync.
          </p>
          <div className="text-xs text-muted-foreground/40">
            Configure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
          <Cloud className="h-8 w-8 text-primary" />
        </div>
        <h3 className="text-lg font-semibold">Keep Your Thoughts Forever</h3>
        <p className="text-sm text-muted-foreground max-w-sm mx-auto">
          Back up your journal to the cloud and access it from any device. Your thoughts stay private and secure.
        </p>
      </div>

      {!isSignedUp ? (
        <div className="space-y-4">
          <div className="space-y-3">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-3 py-3 bg-background border border-border/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-3 bg-background border border-border/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>

          <button
            onClick={handleBackup}
            disabled={isLoading || !email.trim() || !password.trim()}
            className={cn(
              "w-full py-3 rounded-lg font-medium transition-all duration-300 flex items-center justify-center gap-2",
              isLoading || !email.trim() || !password.trim()
                ? "bg-muted text-muted-foreground cursor-not-allowed"
                : "bg-primary text-primary-foreground hover:bg-primary/90 active:scale-[0.98]"
            )}
          >
            {isLoading ? (
              "Creating backup..."
            ) : (
              <>
                Back Up to Cloud
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>

          <p className="text-xs text-muted-foreground text-center flex items-center justify-center gap-1">
            <Lock className="h-3 w-3" />
            Your data is encrypted and private
          </p>
        </div>
      ) : (
        <div className="text-center space-y-4 py-6">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-green-500/10 rounded-full">
            <Cloud className="h-6 w-6 text-green-500" />
          </div>
          <h4 className="font-medium text-green-500">Backup Active</h4>
          <p className="text-sm text-muted-foreground">
            Your journal is safely backed up to the cloud
          </p>
        </div>
      )}
    </div>
  )
}
