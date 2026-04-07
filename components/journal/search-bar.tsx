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

  const handleClear = useCallback(() => {
    setQuery("")
    onClear()
  }, [onClear])

  const handleQueryChange = useCallback((newQuery: string) => {
    setQuery(newQuery)
    if (!newQuery.trim()) {
      onClear()
    } else {
      const searchTerm = newQuery.toLowerCase()
      const filtered = entries.filter(entry => 
        entry.content.toLowerCase().includes(searchTerm) ||
        (entry.mood && entry.mood.toLowerCase().includes(searchTerm))
      )
      onResults(filtered)
    }
  }, [entries, onResults, onClear])

  return (
    <div className="space-y-4">
      <div className="group relative">
        <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/30 transition-colors group-focus-within:text-primary" />
        <input
          type="text"
          value={query}
          onChange={(e) => handleQueryChange(e.target.value)}
          placeholder="Search your thoughts..."
          className={cn(
            "w-full h-14 rounded-2xl border border-border/10 bg-secondary/20 pl-11 pr-11 text-sm transition-all duration-300",
            "placeholder:text-muted-foreground/30 focus:bg-secondary/40 focus:border-primary/20 focus:outline-none focus:ring-4 focus:ring-primary/5"
          )}
        />
        {query && (
          <button
            onClick={handleClear}
            className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted-foreground/30 hover:bg-secondary hover:text-foreground transition-all"
          >
            <X className="h-3 w-3" />
          </button>
        )}
      </div>
    </div>
  )
}
