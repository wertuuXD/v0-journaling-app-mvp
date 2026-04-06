"use client"

import { useRef, useEffect, useState, useCallback } from "react"
import Image from "next/image"
import { cn } from "@/lib/utils"

const PROMPTS = [
  "What happened today?",
  "How do you feel?",
  "What's on your mind?",
]

const MOODS = ["😌", "😊", "😔", "😤", "😴", "🤔"]

const MOOD_IMAGES: Record<string, string[]> = {
  "😌": ["/moods/calm.jpg"],
  "😊": ["/moods/happy.jpg"],
  "😔": ["/moods/sad.jpg"],
  "😤": ["/moods/frustrated.jpg"],
  "😴": ["/moods/sleepy.jpg"],
  "🤔": ["/moods/thoughtful.jpg"],
}

const MOOD_LABELS: Record<string, string> = {
  "😌": "Calm & peaceful",
  "😊": "Happy & content",
  "😔": "A bit down",
  "😤": "Frustrated",
  "😴": "Sleepy",
  "🤔": "Thoughtful",
}

interface WritingEditorProps {
  initialContent?: string
  initialMood?: string
  showPrompts?: boolean
  onSave: (content: string, mood?: string) => void
  onAutoSave?: (content: string, mood?: string) => void
  autoFocus?: boolean
  placeholder?: string
}

export function WritingEditor({
  initialContent = "",
  initialMood,
  showPrompts = false,
  onSave,
  onAutoSave,
  autoFocus = true,
  placeholder = "Start writing...",
}: WritingEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [content, setContent] = useState(initialContent)
  const [mood, setMood] = useState<string | undefined>(initialMood)
  const [moodImage, setMoodImage] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout>()

  const handleMoodClick = (emoji: string) => {
    if (mood === emoji) {
      setMood(undefined)
      setMoodImage(null)
    } else {
      setMood(emoji)
      const images = MOOD_IMAGES[emoji]
      if (images && images.length > 0) {
        const randomImage = images[Math.floor(Math.random() * images.length)]
        setMoodImage(randomImage)
      }
    }
  }

  // Auto-focus on mount
  useEffect(() => {
    if (autoFocus && textareaRef.current) {
      textareaRef.current.focus()
    }
  }, [autoFocus])

  // Auto-save with debounce
  useEffect(() => {
    if (onAutoSave && content.trim()) {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current)
      }
      autoSaveTimeoutRef.current = setTimeout(() => {
        setIsSaving(true)
        onAutoSave(content, mood)
        setTimeout(() => setIsSaving(false), 500)
      }, 1000)
    }
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current)
      }
    }
  }, [content, mood, onAutoSave])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      // Save on Cmd/Ctrl + Enter
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter" && content.trim()) {
        e.preventDefault()
        onSave(content, mood)
      }
    },
    [content, mood, onSave]
  )

  const handlePromptClick = (prompt: string) => {
    const newContent = content ? `${content}\n\n${prompt}\n` : `${prompt}\n`
    setContent(newContent)
    textareaRef.current?.focus()
  }

  return (
    <div className="flex h-full flex-col">
      {/* Prompts */}
      {showPrompts && (
        <div className="mb-6 flex flex-wrap gap-2 animate-in fade-in duration-500">
          {PROMPTS.map((prompt) => (
            <button
              key={prompt}
              onClick={() => handlePromptClick(prompt)}
              className="rounded-full border border-border/50 bg-secondary/50 px-4 py-2 text-sm text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground"
            >
              {prompt}
            </button>
          ))}
        </div>
      )}

      {/* Writing area */}
      <div className="relative flex-1">
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={cn(
            "h-full w-full resize-none bg-transparent text-lg leading-relaxed text-foreground placeholder:text-muted-foreground/50 focus:outline-none",
            "scrollbar-thin scrollbar-track-transparent scrollbar-thumb-border/50"
          )}
          style={{ lineHeight: "1.8" }}
        />

        {/* Saving indicator */}
        {isSaving && (
          <div className="absolute bottom-4 right-4 text-xs text-muted-foreground animate-in fade-in duration-200">
            Saving...
          </div>
        )}
      </div>

      {/* Mood image display */}
      {moodImage && mood && (
        <div className="mt-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="relative overflow-hidden rounded-2xl border border-border/30 bg-card/50">
            <div className="relative aspect-video w-full max-w-sm">
              <Image
                src={moodImage}
                alt={MOOD_LABELS[mood] || "Mood illustration"}
                fill
                className="object-cover"
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent" />
            <div className="absolute bottom-3 left-3 right-3">
              <p className="text-sm font-medium text-foreground/90">
                {MOOD_LABELS[mood]}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Footer with mood and save */}
      <div className="mt-6 flex items-center justify-between border-t border-border/30 pt-4">
        {/* Mood selector */}
        <div className="flex items-center gap-1">
          <span className="mr-2 text-xs text-muted-foreground">Mood:</span>
          {MOODS.map((emoji) => (
            <button
              key={emoji}
              onClick={() => handleMoodClick(emoji)}
              title={MOOD_LABELS[emoji]}
              className={cn(
                "rounded-full p-2 text-xl transition-all",
                mood === emoji
                  ? "scale-110 bg-primary/20"
                  : "opacity-50 hover:opacity-100"
              )}
            >
              {emoji}
            </button>
          ))}
        </div>

        {/* Save button */}
        <button
          onClick={() => content.trim() && onSave(content, mood)}
          disabled={!content.trim()}
          className={cn(
            "rounded-full bg-primary px-6 py-2 text-sm font-medium text-primary-foreground transition-all",
            content.trim()
              ? "hover:bg-primary/90"
              : "cursor-not-allowed opacity-50"
          )}
        >
          Save Entry
        </button>
      </div>
    </div>
  )
}
