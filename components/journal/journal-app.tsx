"use client"

import { useState, useCallback } from "react"
import { useJournal, type JournalEntry } from "@/hooks/use-journal"
import { WritingEditor } from "./writing-editor"
import { Timeline } from "./timeline"
import { EntryViewer } from "./entry-viewer"
import { DataManager } from "./data-manager"
import { ThemeToggle } from "@/components/theme-toggle"
import { cn } from "@/lib/utils"
import { BookOpen, PenLine, Settings, Lock } from "lucide-react"
import { UnwindLogo } from "./unwind-logo"

type View = "write" | "timeline" | "entry" | "data"

export function JournalApp() {
  const { entries, isLoaded, createEntry, updateEntry, deleteEntry, getEntry, importEntries } =
    useJournal()
  const [currentView, setCurrentView] = useState<View>("write")
  const [selectedEntryId, setSelectedEntryId] = useState<string>()

  const handleSaveNewEntry = useCallback(
    (content: string, mood?: string) => {
      createEntry(content, mood)
      setCurrentView("timeline")
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
          <h1 className="text-xl font-medium tracking-tight text-foreground/90">
            Unwind
          </h1>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setCurrentView("write")}
            className={cn(
              "rounded-full p-2.5 transition-all duration-200",
              currentView === "write"
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                : "text-muted-foreground hover:bg-accent hover:text-foreground"
            )}
            title="New entry"
          >
            <PenLine className="h-5 w-5" />
          </button>
          <button
            onClick={() => setCurrentView("timeline")}
            className={cn(
              "rounded-full p-2.5 transition-all duration-200",
              currentView === "timeline" || currentView === "entry"
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                : "text-muted-foreground hover:bg-accent hover:text-foreground"
            )}
            title="Timeline"
          >
            <BookOpen className="h-5 w-5" />
          </button>
          <button
            onClick={() => setCurrentView("data")}
            className={cn(
              "rounded-full p-2.5 transition-all duration-200",
              currentView === "data"
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                : "text-muted-foreground hover:bg-accent hover:text-foreground"
            )}
            title="Settings"
          >
            <Settings className="h-5 w-5" />
          </button>
          <div className="ml-1 h-6 w-[1px] bg-border/20 mx-1" />
          <ThemeToggle />
        </div>
      </header>

      {/* Main content centered with max width and mobile padding */}
      <main className="mx-auto w-full max-w-2xl flex-1 flex flex-col px-6 pb-20">
        <div className="flex-1 flex flex-col gap-8">
          {currentView === "write" && (
            <WritingEditor
              onSave={handleSaveNewEntry}
              placeholder="What's on your mind?"
            />
          )}

          {currentView === "timeline" && (
            <Timeline
              entries={entries}
              selectedId={selectedEntryId}
              onSelect={handleSelectEntry}
            />
          )}

          {currentView === "entry" && selectedEntry && (
            <EntryViewer
              entry={selectedEntry}
              onUpdate={handleUpdateEntry}
              onDelete={handleDeleteEntry}
              onBack={() => {
                setSelectedEntryId(undefined)
                setCurrentView("timeline")
              }}
            />
          )}

          {currentView === "data" && (
            <DataManager
              entries={entries}
              onImport={handleImport}
            />
          )}
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
