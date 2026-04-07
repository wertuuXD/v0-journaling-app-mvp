"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { type JournalEntry } from "@/hooks/use-journal"
import { cn } from "@/lib/utils"
import { format, isToday, isYesterday } from "date-fns"
import { Search } from "lucide-react"
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

  const entriesToGroup = isSearching ? searchResults : entries
  const groupedEntries = useMemo(() => {
    if (!mounted) return {}
    return entriesToGroup.reduce<Record<string, JournalEntry[]>>((acc, entry) => {
      const dateKey = formatDate(entry.createdAt)
      if (!acc[dateKey]) {
        acc[dateKey] = []
      }
      acc[dateKey].push(entry)
      return acc
    }, {})
  }, [entriesToGroup, mounted])

  if (!mounted) return null

  // Show no results message when search returns empty
  if (isSearching && entriesToGroup.length === 0) {
    return (
      <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-1000 pb-20">
        <SearchBar 
          entries={entries}
          onResults={handleSearchResults}
          onClear={handleClearSearch}
        />
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="flex justify-center mb-6">
            <div className="rounded-full bg-muted/50 p-4">
              <Search className="h-6 w-6 text-muted-foreground/40" />
            </div>
          </div>
          <h3 className="text-lg font-medium text-foreground mb-2">No entries found</h3>
          <p className="text-muted-foreground/60 text-sm mb-4">
            Try different keywords or check your spelling
          </p>
          <button
            onClick={handleClearSearch}
            className="text-xs text-muted-foreground/40 hover:text-foreground transition-colors"
          >
            Clear search
          </button>
        </div>
      </div>
    )
  }

  if (entries.length === 0 && !isSearching) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in duration-700">
        <p className="text-muted-foreground/40 text-sm italic">Silence is a valid entry...</p>
        <p className="mt-2 text-xs text-muted-foreground/30">Start writing when you're ready.</p>
      </div>
    )
  }

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-1000 pb-20">
      <SearchBar 
        entries={entries}
        onResults={handleSearchResults}
        onClear={handleClearSearch}
      />

      {Object.entries(groupedEntries).map(([date, dateEntries]) => (
        <div key={date} className="space-y-6">
          <h3 className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/40 font-semibold px-2">
            {date}
          </h3>
          <div className="flex flex-col gap-4">
            {dateEntries.map((entry) => (
              <button
                key={entry.id}
                onClick={() => onSelect(entry)}
                className={cn(
                  "group relative w-full rounded-2xl p-6 text-left transition-all duration-300",
                  "bg-card/50 hover:bg-card border border-border/20 hover:border-border/40 hover:shadow-xl hover:shadow-primary/5 active:scale-[0.99]",
                  selectedId === entry.id && "ring-2 ring-primary/20 bg-card"
                )}
              >
                <div className="flex items-start justify-between mb-3">
                  <span className="text-[10px] font-medium text-muted-foreground/50">
                    {formatTime(entry.createdAt)}
                  </span>
                  {entry.mood && <span className="text-xl group-hover:scale-110 transition-transform">{entry.mood}</span>}
                </div>
                <p className="text-sm leading-relaxed text-foreground/80 line-clamp-3">
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
