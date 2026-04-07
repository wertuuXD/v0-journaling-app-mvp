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
      
      // Escape key: Clear content and go back to timeline
      if (e.key === "Escape") {
        if (content.trim()) {
          setContent("")
          setMood(undefined)
        } else {
          // If already empty, go back to timeline
          window.location.hash = "#timeline"
        }
      }
      
      // Tab: Navigate to mood selection
      if (e.key === "Tab" && !e.shiftKey) {
        e.preventDefault()
        // Focus first mood button
        const moodButtons = document.querySelector('[data-mood-button]')
        if (moodButtons) {
          (moodButtons as HTMLElement).focus()
        }
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
            className="rounded-full border border-border/20 bg-secondary/50 px-5 py-2 text-xs font-medium text-muted-foreground/80 transition-all hover:bg-accent hover:text-foreground hover:border-primary/20"
            title={`Insert prompt: ${prompt}`}
            aria-label={`Insert prompt: ${prompt}`}
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
            "h-full w-full resize-none bg-transparent text-xl leading-relaxed text-foreground placeholder:text-muted-foreground/40 focus:outline-none md:text-2xl transition-colors duration-500 font-normal",
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
          <span className="text-[11px] font-semibold text-muted-foreground/40 uppercase tracking-wider">Mood</span>
          <div className="flex items-center gap-4">
            {MOODS.map((emoji) => (
              <button
                key={emoji}
                onClick={() => handleMoodClick(emoji)}
                title={`${MOOD_LABELS[emoji]} (Tab to navigate, Enter to select)`}
                aria-label={`${MOOD_LABELS[emoji]} mood`}
                data-mood-button
                className={cn(
                  "text-2xl transition-all duration-300 transform",
                  mood === emoji
                    ? "scale-125 brightness-110 animate-pulse"
                    : "opacity-30 grayscale hover:opacity-100 hover:grayscale-0 hover:scale-110 hover:rotate-6 hover:drop-shadow-lg"
                )}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    handleMoodClick(emoji)
                  }
                  if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
                    e.preventDefault()
                    const currentIndex = MOODS.indexOf(emoji)
                    const nextIndex = e.key === 'ArrowRight' 
                      ? (currentIndex + 1) % MOODS.length
                      : (currentIndex - 1 + MOODS.length) % MOODS.length
                    const nextButton = document.querySelector(`[data-mood-button]:nth-child(${nextIndex + 1})`) as HTMLElement
                    nextButton?.focus()
                  }
                  if (e.key === 'Tab' && !e.shiftKey && emoji === MOODS[MOODS.length - 1]) {
                    e.preventDefault()
                    // Focus save button
                    const saveButton = document.querySelector('[data-save-button]') as HTMLElement
                    saveButton?.focus()
                  }
                }}
              >
                <span className="inline-block transition-transform duration-200 hover:animate-bounce">{emoji}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Full-width Clean Save Button */}
        <button
          onClick={() => content.trim() && onSave(content, mood)}
          disabled={!content.trim()}
          data-save-button
          className={cn(
            "w-full rounded-2xl bg-primary py-5 text-sm font-semibold text-primary-foreground transition-all duration-300 shadow-xl shadow-primary/10 transform",
            content.trim()
              ? "active:scale-[0.98] hover:scale-[1.02] hover:opacity-90 hover:shadow-2xl hover:shadow-primary/20"
              : "opacity-10 cursor-not-allowed"
          )}
          title="Save entry (Ctrl+Enter)"
          aria-label="Save entry (Ctrl+Enter)"
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              if (content.trim()) {
                onSave(content, mood)
              }
            }
            if (e.key === 'Tab' && !e.shiftKey) {
              e.preventDefault()
              // Loop back to first mood button
              const firstMoodButton = document.querySelector('[data-mood-button]') as HTMLElement
              firstMoodButton?.focus()
            }
          }}
        >
          <span className="flex items-center justify-center gap-2">
            Save Entry
            {content.trim() && (
              <span className="w-2 h-2 bg-white/30 rounded-full animate-pulse" />
            )}
          </span>
        </button>
      </div>
    </div>
  )
}
