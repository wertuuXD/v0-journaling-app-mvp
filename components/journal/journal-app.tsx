"use client"

import { useState, useCallback, useEffect } from "react"
import { useJournal, type JournalEntry } from "@/hooks/use-journal"
import { WritingEditor } from "./writing-editor"
import { Timeline } from "./timeline"
import { EntryViewer } from "./entry-viewer"
import { DataManager } from "./data-manager"
import { ThemeToggle } from "@/components/theme-toggle"
import { cn } from "@/lib/utils"
import { BookOpen, PenLine, Settings, Lock, User as UserIcon, LogOut, Loader2, CheckCircle2 } from "lucide-react"
import { supabase, isSupabaseConfigured } from "@/lib/supabase"
import { User } from "@supabase/supabase-js"
import { toast } from "sonner"
import { UnwindLogo } from "./unwind-logo"
import { ErrorBoundary } from "@/components/error-boundary"

type View = "write" | "timeline" | "entry" | "data"

export function JournalApp() {
  const { entries, isLoaded, createEntry, updateEntry, deleteEntry, getEntry, importEntries } =
    useJournal()
  const [currentView, setCurrentView] = useState<View>("write")
  const [selectedEntryId, setSelectedEntryId] = useState<string>()
  const [user, setUser] = useState<User | null>(null)
  const [isSyncing, setIsSyncing] = useState(false)
  const [lastSynced, setLastSynced] = useState<Date | null>(null)

  // Handle URL parameters (for OAuth callback redirect)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const view = params.get('view')
    if (view === 'data') {
      setCurrentView('data')
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname)
    }
  }, [])

  // Check auth state on mount
  useEffect(() => {
    if (!isSupabaseConfigured) return

    const checkUser = async () => {
      const { data: { user } } = await supabase!.auth.getUser()
      setUser(user)
    }

    checkUser()

    // Listen for auth changes
    const { data: { subscription } } = supabase!.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  // Keyboard navigation handler
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Only handle keyboard shortcuts when not typing in text areas
      if (event.target instanceof HTMLTextAreaElement || event.target instanceof HTMLInputElement) {
        return
      }

      // Detect mobile device
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
      
      if (isMobile) {
        // Mobile-friendly shortcuts (using simple keys)
        if (event.key === 'n' || event.key === 'N') {
          event.preventDefault()
          setCurrentView("write")
          return
        }
        if (event.key === 't' || event.key === 'T') {
          event.preventDefault()
          setCurrentView("timeline")
          return
        }
        if (event.key === 's' || event.key === 'S') {
          event.preventDefault()
          setCurrentView("data")
          return
        }
      } else {
        // Desktop shortcuts (using Alt to avoid browser conflicts)
        if (event.altKey && event.key === 'n') {
          event.preventDefault()
          setCurrentView("write")
          return
        }
        if (event.altKey && event.key === 't') {
          event.preventDefault()
          setCurrentView("timeline")
          return
        }
        if (event.altKey && event.key === 's') {
          event.preventDefault()
          setCurrentView("data")
          return
        }
      }

      // Escape: Go back to timeline (works on both mobile and desktop)
      if (event.key === 'Escape') {
        if (currentView === "entry") {
          setSelectedEntryId(undefined)
          setCurrentView("timeline")
        } else if (currentView !== "timeline") {
          setCurrentView("timeline")
        }
        return
      }

      // Number keys: Quick navigation (works on both)
      if (event.key === '1') {
        setCurrentView("write")
        return
      }
      if (event.key === '2') {
        setCurrentView("timeline")
        return
      }
      if (event.key === '3') {
        setCurrentView("data")
        return
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [currentView])

  /**
   * Sync a single entry to cloud storage.
   * Uses upsert with onConflict to prevent duplicates based on user_id + local_created_at.
   * Called automatically when creating or updating entries if user is signed in.
   */
  const syncToCloud = useCallback(async (entry: JournalEntry) => {
    // Check if Supabase is configured and user is signed in
    if (!isSupabaseConfigured || !user) return
    
    // Set syncing state to true
    setIsSyncing(true)
    
    try {
      await supabase!.from('journal_entries').upsert({
        user_id: user.id,
        content: entry.content,
        mood: entry.mood,
        local_created_at: entry.createdAt,
        local_updated_at: entry.updatedAt,
      }, {
        onConflict: 'user_id,local_created_at'
      })
      setLastSynced(new Date())
    } catch {
      // Silent fail - don't interrupt user workflow
    } finally {
      setIsSyncing(false)
    }
  }, [user])

  /**
   * Save a new journal entry and auto-sync to cloud if user is signed in.
   * The sync happens silently in the background without blocking the UI.
   */
  const handleSaveNewEntry = useCallback(
    (content: string, mood?: string) => {
      const newEntry = createEntry(content, mood)
      if (newEntry) {
        // Auto-sync to cloud if signed in (happens in background)
        syncToCloud(newEntry)
        setCurrentView("timeline")
      }
      // If newEntry is null, the error toast is already shown by useJournal hook
    },
    [createEntry, syncToCloud]
  )

  const handleSelectEntry = useCallback((entry: JournalEntry) => {
    setSelectedEntryId(entry.id)
    setCurrentView("entry")
  }, [])

  /**
   * Update an existing entry and auto-sync changes to cloud.
   * Preserves the original ID and timestamps for proper cloud synchronization.
   */
  const handleUpdateEntry = useCallback(
    (content: string, mood?: string) => {
      if (selectedEntryId) {
        // Get current entry before update to preserve metadata
        const currentEntry = getEntry(selectedEntryId)
        if (currentEntry) {
          updateEntry(selectedEntryId, content, mood)
          // Auto-sync to cloud if signed in (happens in background)
          const updatedEntry: JournalEntry = {
            ...currentEntry,
            content,
            mood,
            updatedAt: new Date().toISOString(),
          }
          syncToCloud(updatedEntry)
        }
      }
    },
    [selectedEntryId, updateEntry, getEntry, syncToCloud]
  )

  /**
   * Delete an entry from cloud storage when deleted locally.
   * Uses createdAt timestamp to identify the entry to delete.
   * Keeps cloud storage in sync with local deletions.
   */
  const syncDeleteToCloud = useCallback(async (entryId: string, createdAt: string) => {
    if (!isSupabaseConfigured || !user) return
    
    try {
      await supabase!.from('journal_entries')
        .delete()
        .eq('user_id', user.id)
        .eq('local_created_at', createdAt)
      setLastSynced(new Date())
    } catch {
      // Silent fail - don't interrupt user workflow
    }
  }, [user])

  /**
   * Delete an entry locally and sync the deletion to cloud.
   * Uses the entry's createdAt timestamp to identify it in cloud storage.
   */
  const handleDeleteEntry = useCallback(() => {
    if (selectedEntryId) {
      const entry = getEntry(selectedEntryId)
      if (entry) {
        // Delete from cloud first (silent), then locally
        syncDeleteToCloud(entry.id, entry.createdAt)
      }
      deleteEntry(selectedEntryId)
      setSelectedEntryId(undefined)
      setCurrentView("timeline")
    }
  }, [selectedEntryId, deleteEntry, getEntry, syncDeleteToCloud])

  const handleImport = useCallback((importedEntries: JournalEntry[]) => {
    importEntries(importedEntries)
    setCurrentView("timeline")
  }, [importEntries])

  const handleSignOut = useCallback(async () => {
    if (!isSupabaseConfigured) return
    await supabase!.auth.signOut()
    setUser(null)
    toast.success("Signed out successfully")
  }, [])

  const selectedEntry = selectedEntryId ? getEntry(selectedEntryId) : undefined

  if (!isLoaded) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-background animate-in fade-in duration-700">
      {/* Centered header */}
      <header className="mx-auto w-full max-w-2xl px-6 py-8 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <UnwindLogo />
          <h1 className="text-xl font-semibold tracking-tight text-foreground/95">
            Unwind
          </h1>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setCurrentView("write")}
            className={cn(
              "rounded-full p-2.5 transition-all duration-300 transform",
              currentView === "write"
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-105"
                : "text-muted-foreground hover:bg-accent hover:text-foreground hover:scale-110 hover:shadow-md"
            )}
            title="New entry (N on mobile, Alt+N on desktop)"
            aria-label="New entry (N on mobile, Alt+N on desktop)"
            aria-keyshortcuts="N; Alt+N"
          >
            <PenLine className="h-5 w-5 transition-transform duration-200" />
          </button>
          <button
            onClick={() => setCurrentView("timeline")}
            className={cn(
              "rounded-full p-2.5 transition-all duration-300 transform",
              currentView === "timeline" || currentView === "entry"
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-105"
                : "text-muted-foreground hover:bg-accent hover:text-foreground hover:scale-110 hover:shadow-md"
            )}
            title="Timeline (T on mobile, Alt+T on desktop)"
            aria-label="Timeline (T on mobile, Alt+T on desktop)"
            aria-keyshortcuts="T; Alt+T"
          >
            <BookOpen className="h-5 w-5 transition-transform duration-200" />
          </button>
          <button
            onClick={() => setCurrentView("data")}
            className={cn(
              "rounded-full p-2.5 transition-all duration-300 transform",
              currentView === "data"
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-105"
                : "text-muted-foreground hover:bg-accent hover:text-foreground hover:scale-110 hover:shadow-md"
            )}
            title="Settings (S on mobile, Alt+S on desktop)"
            aria-label="Settings (S on mobile, Alt+S on desktop)"
            aria-keyshortcuts="S; Alt+S"
          >
            <Settings className="h-5 w-5 transition-transform duration-200" />
          </button>
          <div className="ml-1 h-6 w-[1px] bg-border/20 mx-1" />
          <ThemeToggle />
          
          {/* User indicator */}
          {user && (
            <div className="flex items-center gap-2 ml-2 pl-2 border-l border-border/20">
              {/* Sync indicator */}
              {isSyncing ? (
                <div className="flex items-center" title="Syncing to cloud...">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                </div>
              ) : lastSynced && (
                <div 
                  className="flex items-center" 
                  title={`Last synced: ${lastSynced.toLocaleTimeString()}`}
                >
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                </div>
              )}
              <div className="flex items-center text-muted-foreground" title={user.email || undefined}>
                <UserIcon className="h-4 w-4" />
              </div>
              <button
                onClick={handleSignOut}
                className="p-1.5 rounded-md hover:bg-accent transition-colors"
                title="Sign out"
              >
                <LogOut className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main content centered with max width and mobile padding */}
      <main className="mx-auto w-full max-w-2xl flex-1 flex flex-col px-6 pb-8">
        <div className="flex-1 flex flex-col gap-8">
          <div className="relative">
            {currentView === "write" && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-500 absolute inset-0">
                <ErrorBoundary fallback={
                  <div className="flex-1 flex items-center justify-center">
                    <p className="text-muted-foreground">Writing editor temporarily unavailable. Please refresh.</p>
                  </div>
                }>
                  <WritingEditor
                    onSave={handleSaveNewEntry}
                    placeholder="What's on your mind?"
                  />
                </ErrorBoundary>
              </div>
            )}

            {currentView === "timeline" && (
              <div className="animate-in fade-in slide-in-from-left-4 duration-500 absolute inset-0">
                <ErrorBoundary fallback={
                  <div className="flex-1 flex items-center justify-center">
                    <p className="text-muted-foreground">Timeline temporarily unavailable. Please refresh.</p>
                  </div>
                }>
                  <Timeline
                    entries={entries}
                    selectedId={selectedEntryId}
                    onSelect={handleSelectEntry}
                  />
                </ErrorBoundary>
              </div>
            )}

            {currentView === "entry" && selectedEntry && (
              <div className="animate-in fade-in zoom-in-95 duration-500 absolute inset-0">
                <ErrorBoundary fallback={
                  <div className="flex-1 flex items-center justify-center">
                    <p className="text-muted-foreground">Entry viewer temporarily unavailable. Please refresh.</p>
                  </div>
                }>
                  <EntryViewer
                    entry={selectedEntry}
                    onUpdate={handleUpdateEntry}
                    onDelete={handleDeleteEntry}
                    onBack={() => {
                      setSelectedEntryId(undefined)
                      setCurrentView("timeline")
                    }}
                  />
                </ErrorBoundary>
              </div>
            )}

            {currentView === "data" && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-8">
                <ErrorBoundary fallback={
                  <div className="flex-1 flex items-center justify-center">
                    <p className="text-muted-foreground">Settings temporarily unavailable. Please refresh.</p>
                  </div>
                }>
                  <DataManager
                    entries={entries}
                    onImport={handleImport}
                  />
                </ErrorBoundary>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Subtle footer */}
      <footer className="mx-auto w-full max-w-2xl px-6 py-6 border-t border-border/10">
        <div className="flex items-center justify-center gap-2 text-[10px] uppercase tracking-widest text-muted-foreground/40">
          <Lock className="h-2.5 w-2.5" />
          <span>Private & Secure</span>
        </div>
      </footer>
    </div>
  )
}
