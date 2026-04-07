"use client"

import { useState, useEffect } from "react"
import { type JournalEntry } from "@/hooks/use-journal"
import { WritingEditor } from "./writing-editor"
import { format } from "date-fns"
import { ArrowLeft, Pencil, Trash2 } from "lucide-react"
import Image from "next/image"

// Import mood images and labels from writing editor
const MOOD_IMAGES: Record<string, string[]> = {
  "😌": ["/moods/calm.jpg"],
  "😊": ["/moods/happy.jpg"],
  "😔": ["/moods/sad.jpg"],
  "😤": ["/moods/frustrated.jpg"],
  "😴": ["/moods/sleepy.jpg"],
  "🤔": ["/moods/thoughtful.jpg"],
  "😰": ["/moods/anxious.jpg"]
}

const MOOD_LABELS: Record<string, string> = {
  "😌": "Calm & peaceful",
  "😊": "Happy & content",
  "😔": "Feeling down",
  "😤": "Frustrated",
  "😴": "Sleepy & tired",
  "🤔": "Thoughtful & reflective",
  "😰": "Anxious & worried"
}

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
  const [formattedDate, setFormattedDate] = useState("")

  useEffect(() => {
    setMounted(true)
    setFormattedDate(
      format(new Date(entry.createdAt), "EEEE, MMMM d, yyyy 'at' h:mm a")
    )
  }, [entry.createdAt])

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
      <div className="flex-1 overflow-y-auto">
        <div className="mb-4 flex items-center gap-3">
          <time className="text-sm text-muted-foreground">
            {mounted ? formattedDate : "Loading..."}
          </time>
          {entry.mood && <span className="text-xl">{entry.mood}</span>}
        </div>
        
        {/* Mood image display */}
        {entry.mood && MOOD_IMAGES[entry.mood] && (
          <div className="mb-6 flex justify-center">
            <div className="relative w-full overflow-hidden rounded-2xl border border-border/30 bg-card/50">
              <div className="relative aspect-video w-full">
                <Image
                  src={MOOD_IMAGES[entry.mood][0]}
                  alt={MOOD_LABELS[entry.mood] || "Mood illustration"}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent" />
              <div className="absolute bottom-3 left-3 right-3">
                <p className="text-sm font-medium text-foreground/90">
                  {MOOD_LABELS[entry.mood]}
                </p>
              </div>
            </div>
          </div>
        )}
        
        <div className="whitespace-pre-wrap break-words text-lg leading-relaxed text-foreground/90">
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
