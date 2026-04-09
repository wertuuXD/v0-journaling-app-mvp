"use client"

import { useState, useEffect } from "react"
import { type JournalEntry } from "@/hooks/use-journal"
import { WritingEditor } from "./writing-editor"
import { format } from "date-fns"
import { ArrowLeft, Pencil, Trash2, X } from "lucide-react"

interface EntryViewerProps {
  entry: JournalEntry
  onUpdate: (content: string, mood?: string) => void
  onDelete: () => void
  onBack: () => void
}

export function EntryViewer({
  entry,
  onUpdate,
  onDelete,
  onBack,
}: EntryViewerProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleSave = (content: string, mood?: string) => {
    onUpdate(content, mood)
    setIsEditing(false)
  }

  const handleDelete = () => {
    onDelete()
    setShowDeleteConfirm(false)
  }

  if (isEditing) {
    return (
      <div className="flex h-full flex-col animate-in fade-in duration-500">
        <div className="mb-8 flex items-center gap-4">
          <button
            onClick={() => setIsEditing(false)}
            className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground/60 hover:text-foreground transition-colors"
          >
            <X className="h-3 w-3" />
            Cancel
          </button>
        </div>
        <div className="flex-1">
          <WritingEditor
            initialContent={entry.content}
            initialMood={entry.mood}
            onSave={handleSave}
            autoFocus
          />
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col animate-in fade-in slide-in-from-bottom-4 duration-1000">
      {/* Header */}
      <div className="mb-10 flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground/60 hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-3 w-3" />
          Back
        </button>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsEditing(true)}
            className="text-muted-foreground/40 transition-all hover:text-foreground hover:scale-110"
            title="Edit"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="text-muted-foreground/40 transition-all hover:text-destructive hover:scale-110"
            title="Delete"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Entry content */}
      <div className="flex-1 space-y-8">
        <div className="flex items-center justify-between border-b border-border/10 pb-6">
          <div className="space-y-1">
            <time className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/40 font-semibold">
              {mounted ? format(new Date(entry.createdAt), "EEEE, MMMM d, yyyy") : "Loading..."}
            </time>
            <p className="text-xs text-muted-foreground/30">
              {mounted ? format(new Date(entry.createdAt), "h:mm a") : ""}
            </p>
          </div>
          {entry.mood && (
            <div className="flex flex-col items-center gap-1">
              <span className="text-3xl grayscale-0">{entry.mood}</span>
            </div>
          )}
        </div>
        
        <div className="whitespace-pre-wrap break-words text-xl leading-relaxed text-foreground/80 md:text-2xl" style={{ lineHeight: "1.8" }}>
          {entry.content}
        </div>
      </div>

      {/* Delete confirmation modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/95 backdrop-blur-sm" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}>
          <div className="w-full max-w-md mx-4 rounded-2xl border border-border/30 bg-card p-8 sm:p-10 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="text-center space-y-6">
              <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
                <Trash2 className="h-6 w-6 text-destructive" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold">Delete this entry?</h3>
                <p className="text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto">
                  This will remove your thoughts from this device forever. This action cannot be undone.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 rounded-xl bg-secondary py-3 px-4 text-sm font-medium text-foreground/80 transition-all hover:bg-secondary/80 active:scale-[0.98]"
                >
                  Keep Entry
                </button>
                <button
                  onClick={handleDelete}
                  className="flex-1 rounded-xl bg-destructive py-3 px-4 text-sm font-semibold text-destructive-foreground transition-all hover:bg-destructive/90 active:scale-[0.98]"
                >
                  Delete Forever
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
