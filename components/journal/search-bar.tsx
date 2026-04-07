"use client"

import { useState, useCallback, useMemo } from "react"
import { type JournalEntry } from "@/hooks/use-journal"
import { cn } from "@/lib/utils"
import { Search, X } from "lucide-react"

interface SearchBarProps {
  entries: JournalEntry[]
  onResults: (results: JournalEntry[]) => void
  onClear: () => void
}

export function SearchBar({ entries, onResults, onClear }: SearchBarProps) {
  const [query, setQuery] = useState("")
  const [isActive, setIsActive] = useState(false)

  const handleClear = useCallback(() => {
    setQuery("")
    setIsActive(false)
    onResults([])
  }, [onResults])

  const filteredEntries = useMemo(() => {
    if (!query.trim()) return []
    
    const searchTerm = query.toLowerCase()
    return entries.filter(entry => 
      entry.content.toLowerCase().includes(searchTerm) ||
      (entry.mood && entry.mood.toLowerCase().includes(searchTerm))
    )
  }, [entries, query])

  const handleQueryChange = useCallback((newQuery: string) => {
    setQuery(newQuery)
    // Calculate filtered entries inline to avoid circular dependency
    if (!newQuery.trim()) {
      onResults([])
    } else {
      const searchTerm = newQuery.toLowerCase()
      const filtered = entries.filter(entry => 
        entry.content.toLowerCase().includes(searchTerm) ||
        (entry.mood && entry.mood.toLowerCase().includes(searchTerm))
      )
      onResults(filtered)
    }
  }, [entries, onResults])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") {
        setQuery("")
        setIsActive(false)
        onResults([])
      }
    }
  , [onResults])

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          value={query}
          onChange={(e) => handleQueryChange(e.target.value)}
          onFocus={() => setIsActive(true)}
          onBlur={() => setIsActive(false)}
          onKeyDown={handleKeyDown}
          placeholder="Search entries..."
          className="w-full h-12 rounded-lg border border-border/30 bg-card/50 pl-10 pr-10 py-2 text-sm placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          autoFocus
        />
        <button
          onClick={handleClear}
          className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 rounded-full p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <X className="h-3 w-3" />
        </button>
      </div>
      
      {query && (
        <div className="text-xs text-muted-foreground animate-in fade-in duration-200">
          {filteredEntries.length} {filteredEntries.length === 1 ? "result" : "results"} found
        </div>
      )}
    </div>
  )
}
