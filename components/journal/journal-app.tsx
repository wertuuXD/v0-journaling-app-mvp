"use client"

import { useState, useCallback } from "react"
import { useJournal, type JournalEntry } from "@/hooks/use-journal"
import { WritingEditor } from "./writing-editor"
import { Timeline } from "./timeline"
import { EntryViewer } from "./entry-viewer"
import { cn } from "@/lib/utils"
import { BookOpen, PenLine, Sparkles, Lock } from "lucide-react"

type View = "write" | "timeline" | "entry"

export function JournalApp() {
  const { entries, isLoaded, createEntry, updateEntry, deleteEntry, getEntry } =
    useJournal()
  const [currentView, setCurrentView] = useState<View>("write")
  const [selectedEntryId, setSelectedEntryId] = useState<string>()
  const [showPrompts, setShowPrompts] = useState(false)

  const handleSaveNewEntry = useCallback(
    (content: string, mood?: string) => {
      createEntry(content, mood)
      // Reset to write view with fresh state
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

  const handleBackToWrite = useCallback(() => {
    setSelectedEntryId(undefined)
    setCurrentView("write")
  }, [])

  const selectedEntry = selectedEntryId ? getEntry(selectedEntryId) : undefined

  // Loading state
  if (!isLoaded) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-background animate-in fade-in duration-700">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-border/30 px-4 py-4 md:px-8">
        <h1 className="font-serif text-xl tracking-tight text-foreground">
          Unwind
        </h1>
        <div className="flex items-center gap-1">
          {/* Prompt toggle */}
          <button
            onClick={() => setShowPrompts(!showPrompts)}
            className={cn(
              "rounded-lg p-2 transition-colors",
              showPrompts
                ? "bg-primary/20 text-primary"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            )}
            title={showPrompts ? "Hide prompts" : "Show prompts"}
          >
            <Sparkles className="h-5 w-5" />
          </button>
          {/* Navigation */}
          <button
            onClick={() => setCurrentView("write")}
            className={cn(
              "rounded-lg p-2 transition-colors",
              currentView === "write"
                ? "bg-primary/20 text-primary"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            )}
            title="New entry"
          >
            <PenLine className="h-5 w-5" />
          </button>
          <button
            onClick={() => setCurrentView("timeline")}
            className={cn(
              "rounded-lg p-2 transition-colors",
              currentView === "timeline" || currentView === "entry"
                ? "bg-primary/20 text-primary"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            )}
            title="Past entries"
          >
            <BookOpen className="h-5 w-5" />
          </button>
        </div>
      </header>

      {/* Main content */}
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-4 py-8 md:px-8">
        {currentView === "write" && (
          <WritingEditor
            onSave={handleSaveNewEntry}
            showPrompts={showPrompts}
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
            onBack={handleBackToWrite}
          />
        )}
      </main>

      {/* Footer - Privacy notice */}
      <footer className="border-t border-border/20 px-4 py-4 md:px-8">
        <div className="mx-auto flex max-w-2xl items-center justify-center gap-2 text-xs text-muted-foreground/60">
          <Lock className="h-3 w-3" />
          <span>Your entries stay on this device. Private by default.</span>
        </div>
      </footer>
    </div>
  )
}
