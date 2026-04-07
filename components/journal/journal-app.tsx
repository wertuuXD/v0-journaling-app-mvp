"use client"

import { useState, useCallback, useEffect } from "react"
import { useJournal, type JournalEntry } from "@/hooks/use-journal"
import { WritingEditor } from "./writing-editor"
import { Timeline } from "./timeline"
import { EntryViewer } from "./entry-viewer"
import { DataManager } from "./data-manager"
import { ThemeToggle } from "@/components/theme-toggle"
import { cn } from "@/lib/utils"
import { BookOpen, PenLine, Settings, Lock } from "lucide-react"
import { UnwindLogo } from "./unwind-logo"
import { ErrorBoundary } from "@/components/error-boundary"

type View = "write" | "timeline" | "entry" | "data"

export function JournalApp() {
  const { entries, isLoaded, createEntry, updateEntry, deleteEntry, getEntry, importEntries } =
    useJournal()
  const [currentView, setCurrentView] = useState<View>("write")
  const [selectedEntryId, setSelectedEntryId] = useState<string>()

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

  const handleSaveNewEntry = useCallback(
    (content: string, mood?: string) => {
      const newEntry = createEntry(content, mood)
      if (newEntry) {
        setCurrentView("timeline")
      }
      // If newEntry is null, the error toast is already shown by useJournal hook
    },
    [createEntry]
  )

  const handleSelectEntry = useCallback((entry: JournalEntry) => {
    setSelectedEntryId(entry.id)
    setCurrentView("entry")
  }, [])

  const handleUpdateEntry = useCallback(
    (content: string, mood?: string) => {
      if (selectedEntryId) {
        updateEntry(selectedEntryId, content, mood)
      }
    },
    [selectedEntryId, updateEntry]
  )

  const handleDeleteEntry = useCallback(() => {
    if (selectedEntryId) {
      deleteEntry(selectedEntryId)
      setSelectedEntryId(undefined)
      setCurrentView("timeline")
    }
  }, [selectedEntryId, deleteEntry])

  const handleImport = useCallback((importedEntries: JournalEntry[]) => {
    importEntries(importedEntries)
    setCurrentView("timeline")
  }, [importEntries])

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
        </div>
      </header>

      {/* Main content centered with max width and mobile padding */}
      <main className="mx-auto w-full max-w-2xl flex-1 flex flex-col px-6 pb-20">
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
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 absolute inset-0">
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
          <span>Local & Private</span>
        </div>
      </footer>
    </div>
  )
}
