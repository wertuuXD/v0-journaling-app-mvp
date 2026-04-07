"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { type JournalEntry } from "@/hooks/use-journal"
import { cn } from "@/lib/utils"
import { format, isToday, isYesterday } from "date-fns"
import { SearchBar } from "./search-bar"

interface TimelineProps {
  entries: JournalEntry[]
  selectedId?: string
  onSelect: (entry: JournalEntry) => void
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  if (isToday(date)) return "Today"
  if (isYesterday(date)) return "Yesterday"
  return format(date, "MMM d, yyyy")
}

function formatTime(dateString: string): string {
  return format(new Date(dateString), "h:mm a")
}

export function Timeline({ entries, selectedId, onSelect }: TimelineProps) {
  const [mounted, setMounted] = useState(false)
  const [searchResults, setSearchResults] = useState<JournalEntry[]>([])
  const [isSearching, setIsSearching] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleSearchResults = useCallback((results: JournalEntry[]) => {
    setSearchResults(results)
    setIsSearching(true)
  }, [])

  const handleClearSearch = useCallback(() => {
    setSearchResults([])
    setIsSearching(false)
  }, [])

  // Memoize grouped entries to avoid recalculating on every render
  const groupedEntries = useMemo(() => {
    if (!mounted) return {}
    const entriesToGroup = isSearching ? searchResults : entries
    return entriesToGroup.reduce<Record<string, JournalEntry[]>>((acc, entry) => {
      const dateKey = formatDate(entry.createdAt)
      if (!acc[dateKey]) {
        acc[dateKey] = []
      }
      acc[dateKey].push(entry)
      return acc
    }, {})
  }, [entries, searchResults, isSearching, mounted])
  // Show loading placeholder before mount to avoid hydration mismatch
  if (!mounted) {
    return (
      <div className="flex h-full flex-col items-center justify-center text-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  if (entries.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center text-center">
        <div className="mb-4 text-4xl opacity-30">📝</div>
        <p className="text-muted-foreground">No entries yet</p>
        <p className="mt-1 text-sm text-muted-foreground/70">
          Start writing to create your first entry
        </p>
      </div>
    )
  }

  if (isSearching && searchResults.length === 0) {
    return (
      <div className="space-y-6">
        <SearchBar 
          entries={entries}
          onResults={handleSearchResults}
          onClear={handleClearSearch}
        />
        <div className="flex h-full flex-col items-center justify-center text-center">
          <div className="mb-4 text-4xl opacity-30">🔍</div>
          <p className="text-muted-foreground">No results found</p>
          <p className="mt-1 text-sm text-muted-foreground/70">
            Try different keywords
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 min-h-0 pb-8">
      {/* Search Bar */}
      <SearchBar 
        entries={entries}
        onResults={handleSearchResults}
        onClear={handleClearSearch}
      />
      
      {/* Search Results Header */}
      {isSearching && (
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-muted-foreground">
            Search Results
          </h3>
          <button
            onClick={handleClearSearch}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            Clear search
          </button>
        </div>
      )}

      {/* Entries */}
      {Object.entries(groupedEntries).map(([date, dateEntries]) => (
        <div key={date}>
          <h3 className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {date}
          </h3>
          <div className="space-y-2">
            {dateEntries.map((entry) => (
              <button
                key={entry.id}
                onClick={() => onSelect(entry)}
                className={cn(
                  "w-full rounded-lg border p-4 text-left transition-all",
                  selectedId === entry.id
                    ? "border-primary/50 bg-primary/10"
                    : "border-border/30 bg-card/50 hover:border-border hover:bg-card"
                )}
              >
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    {formatTime(entry.createdAt)}
                  </span>
                  {entry.mood && <span className="text-lg">{entry.mood}</span>}
                </div>
                <p className="text-sm text-foreground/80 whitespace-pre-wrap break-words">
                  {entry.content}
                </p>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
