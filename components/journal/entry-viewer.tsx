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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-md animate-in fade-in duration-300 px-6">
          <div className="w-full max-w-sm rounded-3xl border border-border/20 bg-card p-10 shadow-2xl animate-in zoom-in-95 duration-300 text-center">
            <h3 className="mb-3 text-xl font-medium">Delete this entry?</h3>
            <p className="mb-10 text-sm text-muted-foreground/60 leading-relaxed">
              This will remove your thoughts from this device forever.
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={handleDelete}
                className="w-full rounded-2xl bg-destructive py-4 text-sm font-semibold text-destructive-foreground transition-all hover:opacity-90 active:scale-[0.98]"
              >
                Delete Forever
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="w-full rounded-2xl bg-secondary/50 py-4 text-sm font-medium text-foreground/60 transition-all hover:bg-secondary active:scale-[0.98]"
              >
                Keep Entry
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
