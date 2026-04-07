"use client"

import { useRef, useEffect, useState, useCallback } from "react"
import { cn } from "@/lib/utils"

const PROMPTS = [
  "What happened today?",
  "How do you feel?",
  "What's on your mind?",
]

const MOODS = ["😌", "😊", "😔", "😤", "😴", "🤔", "😰"]

const MOOD_LABELS: Record<string, string> = {
  "😌": "Calm",
  "😊": "Happy",
  "😔": "Down",
  "😤": "Frustrated",
  "😴": "Tired",
  "🤔": "Reflective",
  "😰": "Anxious"
}

interface WritingEditorProps {
  initialContent?: string
  initialMood?: string
  onSave: (content: string, mood?: string) => void
  autoFocus?: boolean
  placeholder?: string
}

export function WritingEditor({
  initialContent = "",
  initialMood,
  onSave,
  autoFocus = true,
  placeholder = "Start writing...",
}: WritingEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [content, setContent] = useState(initialContent)
  const [mood, setMood] = useState<string | undefined>(initialMood)

  const handleMoodClick = (emoji: string) => {
    setMood(mood === emoji ? undefined : emoji)
  }

  useEffect(() => {
    if (autoFocus && textareaRef.current) {
      textareaRef.current.focus()
    }
  }, [autoFocus])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
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
    <div className="flex h-full flex-col gap-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      {/* Subtle Prompt Chips */}
      <div className="flex flex-wrap gap-3">
        {PROMPTS.map((prompt) => (
          <button
            key={prompt}
            onClick={() => handlePromptClick(prompt)}
            className="rounded-full border border-border/10 bg-secondary/30 px-5 py-2 text-xs font-medium text-muted-foreground/80 transition-all hover:bg-accent hover:text-foreground"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Writing Area Focused */}
      <div className="relative flex-1">
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={cn(
            "h-full w-full resize-none bg-transparent text-xl leading-relaxed text-foreground placeholder:text-muted-foreground/30 focus:outline-none md:text-2xl",
            "scrollbar-none"
          )}
          style={{ 
            lineHeight: "1.8",
            minHeight: "400px"
          }}
        />
      </div>

      {/* Footer Controls: Mood & Save */}
      <div className="flex flex-col gap-10 pb-8">
        {/* Minimal Mood Selector */}
        <div className="flex items-center justify-between px-2">
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground/40">Mood</span>
          <div className="flex items-center gap-4">
            {MOODS.map((emoji) => (
              <button
                key={emoji}
                onClick={() => handleMoodClick(emoji)}
                title={MOOD_LABELS[emoji]}
                className={cn(
                  "text-2xl transition-all duration-300",
                  mood === emoji
                    ? "scale-125 brightness-125"
                    : "opacity-30 grayscale hover:opacity-100 hover:grayscale-0"
                )}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>

        {/* Full-width Clean Save Button */}
        <button
          onClick={() => content.trim() && onSave(content, mood)}
          disabled={!content.trim()}
          className={cn(
            "w-full rounded-2xl bg-primary py-5 text-sm font-semibold text-primary-foreground transition-all duration-300 shadow-xl shadow-primary/20",
            content.trim()
              ? "active:scale-[0.98] hover:opacity-90"
              : "opacity-10 cursor-not-allowed"
          )}
        >
          Save Entry
        </button>
      </div>
    </div>
  )
}
