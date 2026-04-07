"use client"

import { useCallback } from "react"
import { type JournalEntry } from "@/hooks/use-journal"
import { cn } from "@/lib/utils"
import { Download, Upload, AlertCircle, CheckCircle } from "lucide-react"

interface DataManagerProps {
  entries: JournalEntry[]
  onImport: (entries: JournalEntry[]) => void
}

export function DataManager({ entries, onImport }: DataManagerProps) {
  const handleExport = useCallback(() => {
    try {
      const dataStr = JSON.stringify(entries, null, 2)
      const dataBlob = new Blob([dataStr], { type: "application/json" })
      const url = URL.createObjectURL(dataBlob)
      
      const link = document.createElement("a")
      link.href = url
      link.download = `unwind-journal-backup-${new Date().toISOString().split("T")[0]}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Failed to export entries:", error)
    }
  }, [entries])

  const handleImport = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string
        const importedEntries = JSON.parse(content) as JournalEntry[]
        
        // Validate the imported data
        if (!Array.isArray(importedEntries)) {
          throw new Error("Invalid file format")
        }

        const validEntries = importedEntries.filter(entry => 
          entry.id && 
          entry.content && 
          entry.createdAt && 
          entry.updatedAt
        )

        if (validEntries.length === 0) {
          throw new Error("No valid entries found")
        }

        onImport(validEntries)
      } catch (error) {
        console.error("Failed to import entries:", error)
        alert("Failed to import entries. Please check the file format.")
      }
    }
    reader.readAsText(file)
    
    // Reset the input
    event.target.value = ""
  }, [onImport])

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3">
        {/* Export Button */}
        <button
          onClick={handleExport}
          disabled={entries.length === 0}
          className={cn(
            "flex items-center justify-center gap-2 rounded-lg border border-border/30 bg-card/50 px-4 py-3 text-sm transition-colors hover:border-border hover:bg-card",
            entries.length === 0 && "cursor-not-allowed opacity-50"
          )}
        >
          <Download className="h-4 w-4" />
          Export All Entries ({entries.length})
        </button>

        {/* Import Button */}
        <div className="relative">
          <input
            type="file"
            accept=".json"
            onChange={handleImport}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <div className="flex items-center justify-center gap-2 rounded-lg border border-border/30 bg-card/50 px-4 py-3 text-sm transition-colors hover:border-border hover:bg-card cursor-pointer">
            <Upload className="h-4 w-4" />
            Import Entries
          </div>
        </div>
      </div>

      {/* Info Messages */}
      <div className="space-y-2">
        <div className="flex items-start gap-2 text-xs text-muted-foreground">
          <AlertCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
          <span>Export creates a backup file with all your entries</span>
        </div>
        <div className="flex items-start gap-2 text-xs text-muted-foreground">
          <CheckCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
          <span>Import merges entries from a backup file</span>
        </div>
      </div>
    </div>
  )
}
