"use client"

import { useState } from "react"
import { type JournalEntry } from "@/hooks/use-journal"
import { WritingEditor } from "./writing-editor"
import { format } from "date-fns"
import { ArrowLeft, Pencil, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"

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
      <div className="flex h-full flex-col">
        <div className="mb-4 flex items-center gap-4">
          <button
            onClick={() => setIsEditing(false)}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
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
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsEditing(true)}
            className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Entry content */}
      <div className="flex-1 overflow-auto">
        <div className="mb-4 flex items-center gap-3">
          <time className="text-sm text-muted-foreground">
            {format(new Date(entry.createdAt), "EEEE, MMMM d, yyyy 'at' h:mm a")}
          </time>
          {entry.mood && <span className="text-xl">{entry.mood}</span>}
        </div>
        <div className="whitespace-pre-wrap text-lg leading-relaxed text-foreground/90">
          {entry.content}
        </div>
      </div>

      {/* Delete confirmation modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="mx-4 w-full max-w-sm rounded-xl border border-border bg-card p-6 shadow-xl animate-in zoom-in-95 duration-200">
            <h3 className="mb-2 text-lg font-medium">Delete this entry?</h3>
            <p className="mb-6 text-sm text-muted-foreground">
              This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 rounded-lg border border-border bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground transition-colors hover:bg-secondary/80"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 rounded-lg bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground transition-colors hover:bg-destructive/90"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
