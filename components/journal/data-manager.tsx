"use client"

import { useState, useCallback, useMemo, useEffect } from "react"
import { type JournalEntry } from "@/hooks/use-journal"
import { cn } from "@/lib/utils"
import { Download, Upload, Shield, Calendar as CalendarIcon, Loader2 } from "lucide-react"
import { format, isWithinInterval, startOfDay, endOfDay } from "date-fns"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { DateRange } from "react-day-picker"
import dynamic from "next/dynamic"
import { toast } from "sonner"

// Use next/dynamic with ssr: false for components that use libraries incompatible with SSR/Turbopack Node.js environments
const ExportActions = dynamic(() => import("./export-actions"), {
  ssr: false,
  loading: () => (
    <div className="h-[108px] flex items-center justify-center col-span-1 md:col-span-2 text-muted-foreground/20 rounded-2xl border border-border/10 bg-secondary/5">
      <Loader2 className="h-5 w-5 animate-spin" />
    </div>
  )
})

interface DataManagerProps {
  entries: JournalEntry[]
  onImport: (entries: JournalEntry[]) => void
}

export function DataManager({ entries, onImport }: DataManagerProps) {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: undefined,
    to: undefined,
  })

  const filteredEntries = useMemo(() => {
    if (!dateRange?.from) return entries

    const start = startOfDay(dateRange.from)
    const end = dateRange.to ? endOfDay(dateRange.to) : endOfDay(dateRange.from)

    return entries.filter((entry) => {
      const date = new Date(entry.createdAt)
      if (Number.isNaN(date.getTime())) return false
      return isWithinInterval(date, { start, end })
    })
  }, [entries, dateRange])

  const handleExportJson = useCallback(() => {
    try {
      const dataStr = JSON.stringify(filteredEntries, null, 2)
      const dataBlob = new Blob([dataStr], { type: "application/json" })
      const url = URL.createObjectURL(dataBlob)
      
      const link = document.createElement("a")
      link.href = url
      link.download = `unwind-backup-${new Date().toISOString().split("T")[0]}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      toast.success(`JSON backup completed! ${filteredEntries.length} entries exported`)
    } catch (error) {
      console.error("Failed to export JSON:", error)
      toast.error("Failed to export JSON backup. Please try again.")
    }
  }, [filteredEntries])

  const handleImport = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string
        
        // Enhanced validation
        if (!content || content.trim().length === 0) {
          throw new Error("File is empty")
        }
        
        // Check file size (prevent huge files)
        if (content.length > 10 * 1024 * 1024) { // 10MB limit
          throw new Error("File too large. Maximum size is 10MB.")
        }
        
        let importedEntries
        try {
          importedEntries = JSON.parse(content)
        } catch (parseError) {
          throw new Error("Invalid JSON format. Please ensure the file is a valid JSON.")
        }
        
        if (!Array.isArray(importedEntries)) {
          throw new Error("Invalid format. File must contain an array of journal entries.")
        }

        if (importedEntries.length === 0) {
          toast.warning("Import file contains no entries.")
          return
        }

        if (importedEntries.length > 10000) {
          throw new Error("Too many entries. Maximum 10,000 entries allowed.")
        }

        const validEntries = importedEntries.filter((entry, index) => {
          // Basic structure validation
          if (!entry || typeof entry !== 'object') {
            console.warn(`Invalid entry at index ${index}: not an object`)
            return false
          }

          // Required fields validation
          if (typeof entry.id !== 'string' || entry.id.length === 0) {
            console.warn(`Invalid entry at index ${index}: missing or invalid id`)
            return false
          }

          if (typeof entry.content !== 'string' || entry.content.length === 0) {
            console.warn(`Invalid entry at index ${index}: missing or empty content`)
            return false
          }

          if (typeof entry.createdAt !== 'string') {
            console.warn(`Invalid entry at index ${index}: missing or invalid createdAt`)
            return false
          }

          // Date validation
          const entryDate = new Date(entry.createdAt)
          if (Number.isNaN(entryDate.getTime())) {
            console.warn(`Invalid entry at index ${index}: invalid date format`)
            return false
          }

          // Content length validation (prevent abuse)
          if (entry.content.length > 100000) { // 100KB per entry
            console.warn(`Invalid entry at index ${index}: content too long`)
            return false
          }

          // Date range validation (reasonable dates only)
          const minDate = new Date('2000-01-01')
          const maxDate = new Date('2030-12-31')
          if (entryDate < minDate || entryDate > maxDate) {
            console.warn(`Invalid entry at index ${index}: date out of reasonable range`)
            return false
          }

          // Optional mood validation
          if (entry.mood && typeof entry.mood !== 'string') {
            console.warn(`Invalid entry at index ${index}: mood must be a string`)
            return false
          }

          return true
        })

        const invalidCount = importedEntries.length - validEntries.length
        if (validEntries.length === 0) {
          throw new Error(`No valid entries found. All ${importedEntries.length} entries were invalid.`)
        }

        // Check for duplicate IDs
        const idSet = new Set(validEntries.map(e => e.id))
        if (idSet.size !== validEntries.length) {
          console.warn('Duplicate entry IDs detected, duplicates will be ignored')
          const uniqueEntries = validEntries.filter((entry, index, self) => 
            index === self.findIndex(e => e.id === entry.id)
          )
          onImport(uniqueEntries)
          toast.success(`Import completed! ${uniqueEntries.length} unique entries imported (${invalidCount} invalid entries skipped)`)
          return
        }

        onImport(validEntries)
        if (invalidCount > 0) {
          toast.warning(`Import completed with warnings. ${validEntries.length} entries imported, ${invalidCount} invalid entries skipped.`)
        } else {
          toast.success(`Import completed! ${validEntries.length} entries imported`)
        }
      } catch (error) {
        console.error("Failed to import:", error)
        const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"
        toast.error(`Import failed: ${errorMessage}`)
      }
    }
    reader.readAsText(file)
    event.target.value = ""
  }, [onImport])

  return (
    <div className="flex flex-col gap-10 animate-in fade-in slide-in-from-bottom-4 duration-1000 pb-20">
      <div className="space-y-6">
        <div className="flex items-center justify-between px-2">
          <h3 className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/40 font-semibold">
            Export Options
          </h3>

          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "h-8 text-[10px] uppercase tracking-wider text-muted-foreground hover:text-primary transition-colors",
                  dateRange?.from && "text-primary font-bold"
                )}
              >
                <CalendarIcon className="mr-2 h-3.5 w-3.5" />
                {dateRange?.from ? (
                  dateRange.to ? (
                    <>
                      {format(dateRange.from, "MMM d")} - {format(dateRange.to, "MMM d")}
                    </>
                  ) : (
                    format(dateRange.from, "MMM d")
                  )
                ) : (
                  "All Time"
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={dateRange?.from}
                selected={dateRange}
                onSelect={setDateRange}
                numberOfMonths={1}
              />
              <div className="p-3 border-t border-border/50 flex justify-end">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setDateRange(undefined)}
                  className="text-[10px] uppercase tracking-widest"
                >
                  Clear Range
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ExportActions entries={filteredEntries} dateRange={dateRange} />

          <button
            onClick={handleExportJson}
            disabled={filteredEntries.length === 0}
            className={cn(
              "flex items-center justify-between rounded-2xl border border-border/10 bg-secondary/20 p-5 transition-all duration-300",
              "hover:bg-secondary/40 hover:border-border/30 active:scale-[0.98]",
              filteredEntries.length === 0 && "opacity-20 cursor-not-allowed"
            )}
          >
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-primary/10 p-2.5 text-primary">
                <Download className="h-5 w-5" />
              </div>
              <div className="text-left">
                <p className="text-sm font-medium">Backup JSON</p>
                <p className="text-[10px] text-muted-foreground/50">Raw data for importing back</p>
              </div>
            </div>
          </button>

          <div className="relative">
            <input
              type="file"
              accept=".json"
              onChange={handleImport}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="flex items-center justify-between rounded-2xl border border-border/10 bg-secondary/20 p-5 transition-all duration-300 hover:bg-secondary/40 hover:border-border/30">
              <div className="flex items-center gap-4">
                <div className="rounded-full bg-primary/10 p-2.5 text-primary">
                  <Upload className="h-5 w-5" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium">Import Backup</p>
                  <p className="text-[10px] text-muted-foreground/50">Restore from a JSON file</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {filteredEntries.length > 0 && (
          <p className="text-center text-[10px] text-muted-foreground/30 animate-in fade-in duration-500">
            {filteredEntries.length} {filteredEntries.length === 1 ? 'entry' : 'entries'} ready for export
          </p>
        )}
      </div>

      <div className="rounded-3xl bg-secondary/10 p-8 border border-border/5">
        <div className="flex items-start gap-4">
          <Shield className="h-5 w-5 text-primary/40 mt-1" />
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-foreground/80">Privacy First</h4>
            <p className="text-xs leading-relaxed text-muted-foreground/50">
              Your entries are stored locally on your device. We don't have servers that store your content, making it truly private. Backup your data often to ensure you never lose your thoughts.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
