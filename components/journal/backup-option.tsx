"use client"

import { useState, useEffect } from "react"
import { supabase, isSupabaseConfigured } from "@/lib/supabase"
import { toast } from "sonner"
import { Cloud, Lock, Mail, ArrowRight, Chrome, Download, Loader2, CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface BackupProps {
  onBackupComplete?: () => void
  onRestore?: (cloudEntries: any[]) => void
  entries: any[]
}

export function BackupOption({ onBackupComplete, onRestore, entries }: BackupProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSignedUp, setIsSignedUp] = useState(false)
  const [showEmailForm, setShowEmailForm] = useState(false)
  const [isRestoring, setIsRestoring] = useState(false)
  const [restoreSuccess, setRestoreSuccess] = useState(false)
  const [allRestored, setAllRestored] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)

  // Check if user is already signed in on mount
  useEffect(() => {
    if (!isSupabaseConfigured) return

    const checkUser = async () => {
      const { data: { user } } = await supabase!.auth.getUser()
      setCurrentUser(user)
      if (user) setIsSignedUp(true)
    }

    checkUser()

    // Listen for auth changes
    const { data: { subscription } } = supabase!.auth.onAuthStateChange((_event, session) => {
      setCurrentUser(session?.user ?? null)
      setIsSignedUp(!!session?.user)
    })

    return () => subscription.unsubscribe()
  }, [])

  // Check if all cloud entries are already restored locally
  useEffect(() => {
    if (!isSupabaseConfigured || !currentUser || entries.length === 0) {
      setAllRestored(false)
      return
    }

    const checkAllRestored = async () => {
      const { data: cloudEntries } = await supabase!
        .from('journal_entries')
        .select('local_created_at')
        .eq('user_id', currentUser.id)

      if (!cloudEntries || cloudEntries.length === 0) {
        setAllRestored(false)
        return
      }

      const localTimestamps = new Set(entries.map(e => new Date(e.createdAt).toISOString()))
      const cloudTimestamps = cloudEntries.map(e => new Date(e.local_created_at).toISOString())
      
      // Check if all cloud entries exist locally
      const allExist = cloudTimestamps.every(ts => localTimestamps.has(ts))
      setAllRestored(allExist)
    }

    checkAllRestored()
  }, [currentUser, entries])

  /**
   * Handle manual backup of all local entries to cloud.
   * Authenticates user with email/password, then checks which entries
   * are new before uploading (prevents duplicate uploads).
   */
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
      // Sign up or sign in user with email/password
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
      setCurrentUser(user)

      // Check if entries already exist in cloud
      const entryTimestamps = entries.map(e => e.createdAt)
      
      const { data: existingEntries } = await supabase!
        .from('journal_entries')
        .select('local_created_at')
        .eq('user_id', user.id)
        .in('local_created_at', entryTimestamps)
      
      const existingTimestamps = new Set(
        existingEntries?.map(e => new Date(e.local_created_at).toISOString()) || []
      )
      const newEntries = entries.filter(e => {
        const entryTime = new Date(e.createdAt).toISOString()
        return !existingTimestamps.has(entryTime)
      })

      // Only upsert new/changed entries
      if (newEntries.length > 0) {
        const backupPromises = newEntries.map(async (entry) => {
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
        toast.info("All entries already backed up")
      }

      setIsSignedUp(true)
      onBackupComplete?.()

    } catch (error) {
      console.error("Backup error:", error)
      toast.error("Backup failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Handle restoring entries from cloud to local storage.
   * Fetches all cloud entries for the user and passes them to the parent
   * component for merging with local entries (prevents duplicates).
   */
  const handleRestore = async () => {
    if (!isSupabaseConfigured) {
      toast.error("Cloud backup not available. Please configure Supabase.")
      return
    }

    setIsRestoring(true)

    try {
      // Use current user from state
      const user = currentUser
      if (!user) {
        toast.error("Please sign in first")
        setIsRestoring(false)
        return
      }

      // Fetch entries from cloud
      const { data: cloudEntries, error } = await supabase!
        .from('journal_entries')
        .select('*')
        .eq('user_id', user.id)
        .order('local_created_at', { ascending: false })

      if (error) {
        throw error
      }

      if (!cloudEntries || cloudEntries.length === 0) {
        toast.info("No entries found in cloud backup")
        return
      }

      // Convert to local format
      const restoredEntries = cloudEntries.map((entry: any) => ({
        id: entry.id,
        content: entry.content,
        mood: entry.mood,
        createdAt: entry.local_created_at,
        updatedAt: entry.local_updated_at,
      }))

      // Pass to parent for merging
      onRestore?.(restoredEntries)
      toast.success(`Restored ${restoredEntries.length} entries from cloud!`)
      setRestoreSuccess(true)
      setAllRestored(true)
      setTimeout(() => setRestoreSuccess(false), 3000) // Reset after 3 seconds

    } catch (error) {
      console.error("Restore error:", error)
      toast.error("Failed to restore from cloud. Please try again.")
    } finally {
      setIsRestoring(false)
    }
  }

  const handleOAuthSignIn = async (provider: 'google') => {
    if (!isSupabaseConfigured) {
      toast.error("Cloud backup not available. Please configure Supabase.")
      return
    }

    try {
      const { data, error } = await supabase!.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: typeof window !== 'undefined' ? `${window.location.origin}/auth/callback` : undefined,
        },
      })

      if (error) {
        if (error.message.includes('provider is not enabled')) {
          toast.error(`${provider} sign-in is not enabled in Supabase. Please enable it in your dashboard.`)
          return
        }
        throw error
      }

      // OAuth opens in popup/redirect, backup happens after auth callback
      toast.success(`Redirecting to ${provider}...`)
    } catch (error: any) {
      console.error(`${provider} sign in error:`, error)
      toast.error(error.message || `Failed to sign in with ${provider}. Please try again.`)
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
          {/* Social Sign In Buttons */}
          <div className="space-y-3">
            <button
              onClick={() => handleOAuthSignIn('google')}
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-lg border border-border/20 bg-background hover:bg-accent transition-all duration-300 flex items-center justify-center gap-3"
            >
              <Chrome className="h-5 w-5 text-red-500" />
              <span className="text-sm font-medium">Continue with Google</span>
            </button>
            
          </div>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border/20" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-background px-2 text-muted-foreground">or</span>
            </div>
          </div>

          {/* Email Option Toggle */}
          {!showEmailForm ? (
            <button
              onClick={() => setShowEmailForm(true)}
              className="w-full py-3 px-4 rounded-lg border border-border/20 bg-background hover:bg-accent transition-all duration-300 flex items-center justify-center gap-3"
            >
              <Mail className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm font-medium">Continue with Email</span>
            </button>
          ) : (
            <div className="space-y-3 animate-in fade-in duration-300">
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
              
              <button
                onClick={() => setShowEmailForm(false)}
                className="w-full py-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                ← Back to sign in options
              </button>
            </div>
          )}

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
          
          {/* Restore button */}
          <button
            onClick={handleRestore}
            disabled={isRestoring || allRestored}
            className={cn(
              "w-full py-3.5 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 mt-4 shadow-sm",
              isRestoring
                ? "bg-muted text-muted-foreground cursor-not-allowed shadow-inner"
                : restoreSuccess
                  ? "bg-green-500 text-white shadow-green-500/25 shadow-lg scale-[0.98]"
                : allRestored
                  ? "bg-muted text-muted-foreground cursor-not-allowed shadow-none"
                  : "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-blue-500/25 shadow-md hover:shadow-lg hover:shadow-blue-500/30 hover:-translate-y-0.5 active:scale-[0.98] active:translate-y-0"
            )}
          >
            {isRestoring ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Restoring...</span>
              </>
            ) : restoreSuccess ? (
              <>
                <CheckCircle2 className="h-5 w-5" />
                <span>Restored!</span>
              </>
            ) : allRestored ? (
              <>
                <CheckCircle2 className="h-5 w-5" />
                <span>All entries up to date</span>
              </>
            ) : (
              <>
                <Download className="h-5 w-5" />
                <span>Restore from Cloud</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  )
}
