"use client"

import { useCallback } from "react"
import { type JournalEntry } from "@/hooks/use-journal"
import { cn } from "@/lib/utils"
import { Download, Upload, Shield } from "lucide-react"

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
      link.download = `unwind-backup-${new Date().toISOString().split("T")[0]}.json`
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
        
        if (!Array.isArray(importedEntries)) {
          throw new Error("Invalid format")
        }

        const validEntries = importedEntries.filter(entry => 
          entry.id && entry.content && entry.createdAt
        )

        onImport(validEntries)
      } catch (error) {
        console.error("Failed to import:", error)
      }
    }
    reader.readAsText(file)
    event.target.value = ""
  }, [onImport])

  return (
    <div className="flex flex-col gap-10 animate-in fade-in slide-in-from-bottom-4 duration-1000 pb-20">
      <div className="space-y-4">
        <h3 className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/40 font-semibold px-2">
          Data Management
        </h3>

        <div className="flex flex-col gap-4">
          <button
            onClick={handleExport}
            disabled={entries.length === 0}
            className={cn(
              "flex items-center justify-between rounded-2xl border border-border/10 bg-secondary/20 p-6 transition-all duration-300",
              "hover:bg-secondary/40 hover:border-border/30 active:scale-[0.99]",
              entries.length === 0 && "opacity-20 cursor-not-allowed"
            )}
          >
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-primary/10 p-3 text-primary">
                <Download className="h-5 w-5" />
              </div>
              <div className="text-left">
                <p className="text-sm font-medium">Export Backup</p>
                <p className="text-xs text-muted-foreground/50">Download your {entries.length} entries</p>
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
            <div className="flex items-center justify-between rounded-2xl border border-border/10 bg-secondary/20 p-6 transition-all duration-300 hover:bg-secondary/40 hover:border-border/30">
              <div className="flex items-center gap-4">
                <div className="rounded-full bg-primary/10 p-3 text-primary">
                  <Upload className="h-5 w-5" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium">Import Backup</p>
                  <p className="text-xs text-muted-foreground/50">Restore from a JSON file</p>
                </div>
              </div>
            </div>
          </div>
        </div>
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
