"use client"

import { useCallback } from "react"
import { type JournalEntry } from "@/hooks/use-journal"
import { cn } from "@/lib/utils"
import { FileText, FileDown } from "lucide-react"
import { format } from "date-fns"
import { DateRange } from "react-day-picker"

const MOOD_LABELS: Record<string, string> = {
  "😌": "Calm",
  "😊": "Happy",
  "😔": "Down",
  "😤": "Frustrated",
  "😴": "Tired",
  "🤔": "Reflective",
  "😰": "Anxious"
}

interface ExportActionsProps {
  entries: JournalEntry[]
  dateRange: DateRange | undefined
}

export default function ExportActions({ entries, dateRange }: ExportActionsProps) {
  const handleExportText = useCallback(() => {
    try {
      let text = "UNWIND JOURNAL EXPORT\n"
      text += `Generated on: ${format(new Date(), "PPP")}\n`
      if (dateRange?.from) {
        text += `Range: ${format(dateRange.from, "PP")} - ${dateRange.to ? format(dateRange.to, "PP") : format(dateRange.from, "PP")}\n`
      }
      text += "=".repeat(30) + "\n\n"

      entries.forEach((entry) => {
        const entryDate = new Date(entry.createdAt)
        if (Number.isNaN(entryDate.getTime())) return

        const date = format(entryDate, "PPPP")
        const time = format(entryDate, "p")
        text += `${date} at ${time}\n`
        if (entry.mood) text += `Mood: ${entry.mood}\n`
        text += "-".repeat(10) + "\n"
        text += `${entry.content}\n\n`
        text += "=".repeat(20) + "\n\n"
      })

      const dataBlob = new Blob([text], { type: "text/plain" })
      const url = URL.createObjectURL(dataBlob)
      const link = document.createElement("a")
      link.href = url
      link.download = `unwind-export-${new Date().toISOString().split("T")[0]}.txt`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Failed to export Text:", error)
    }
  }, [entries, dateRange])

  const handleExportPdf = useCallback(async () => {
    try {
      const { jsPDF } = await import("jspdf")
      const doc = new jsPDF()
      const pageWidth = doc.internal.pageSize.getWidth()
      const margin = 20
      const contentWidth = pageWidth - 2 * margin
      let y = 20

      // Branding
      doc.setFontSize(22)
      doc.setTextColor(124, 92, 255) // #7C5CFF
      doc.text("Unwind", margin, y)

      doc.setFontSize(10)
      doc.setTextColor(150, 150, 150)
      doc.text("No-Pressure Journaling", margin + 28, y)

      y += 10
      doc.setDrawColor(232, 226, 216)
      doc.line(margin, y, pageWidth - margin, y)
      y += 15

      // Header Info
      doc.setFontSize(10)
      doc.setTextColor(100, 100, 100)
      doc.text(`Exported on ${format(new Date(), "PPP")}`, margin, y)
      y += 7
      if (dateRange?.from) {
        const rangeText = `${format(dateRange.from, "PP")} - ${dateRange.to ? format(dateRange.to, "PP") : format(dateRange.from, "PP")}`
        doc.text(`Range: ${rangeText}`, margin, y)
        y += 10
      } else {
        y += 5
      }

      // Entries
      entries.forEach((entry, index) => {
        const entryDate = new Date(entry.createdAt)
        if (Number.isNaN(entryDate.getTime())) return

        // Check if we need a new page
        if (y > 270) {
          doc.addPage()
          y = 20
        }

        const dateStr = format(entryDate, "PPPP")
        const timeStr = format(entryDate, "p")

        doc.setFontSize(12)
        doc.setTextColor(60, 60, 60)
        doc.setFont("helvetica", "bold")
        doc.text(dateStr, margin, y)

        doc.setFontSize(9)
        doc.setFont("helvetica", "normal")
        doc.setTextColor(150, 150, 150)
        doc.text(timeStr, pageWidth - margin, y, { align: "right" })

        y += 7

        if (entry.mood) {
          doc.setFontSize(10)
          doc.setTextColor(124, 92, 255)
          const moodLabel = MOOD_LABELS[entry.mood] || entry.mood
          doc.text(`Mood: ${moodLabel}`, margin, y)
          y += 7
        }

        doc.setFontSize(11)
        doc.setTextColor(80, 80, 80)
        doc.setFont("helvetica", "normal")

        const lines = doc.splitTextToSize(entry.content, contentWidth)
        doc.text(lines, margin, y)

        y += (lines.length * 6) + 15

        // Separator between entries
        if (index < entries.length - 1) {
          doc.setDrawColor(240, 240, 240)
          doc.line(margin, y - 8, pageWidth - margin, y - 8)
        }
      })

      doc.save(`unwind-export-${new Date().toISOString().split("T")[0]}.pdf`)
    } catch (error) {
      console.error("Failed to export PDF:", error)
    }
  }, [entries, dateRange])

  return (
    <>
      <button
        onClick={handleExportPdf}
        disabled={entries.length === 0}
        className={cn(
          "flex items-center justify-between rounded-2xl border border-border/10 bg-secondary/20 p-5 transition-all duration-300",
          "hover:bg-secondary/40 hover:border-border/30 active:scale-[0.98]",
          entries.length === 0 && "opacity-20 cursor-not-allowed"
        )}
      >
        <div className="flex items-center gap-4">
          <div className="rounded-full bg-primary/10 p-2.5 text-primary">
            <FileDown className="h-5 w-5" />
          </div>
          <div className="text-left">
            <p className="text-sm font-medium">Download PDF</p>
            <p className="text-[10px] text-muted-foreground/50">Styled document for reading</p>
          </div>
        </div>
      </button>

      <button
        onClick={handleExportText}
        disabled={entries.length === 0}
        className={cn(
          "flex items-center justify-between rounded-2xl border border-border/10 bg-secondary/20 p-5 transition-all duration-300",
          "hover:bg-secondary/40 hover:border-border/30 active:scale-[0.98]",
          entries.length === 0 && "opacity-20 cursor-not-allowed"
        )}
      >
        <div className="flex items-center gap-4">
          <div className="rounded-full bg-primary/10 p-2.5 text-primary">
            <FileText className="h-5 w-5" />
          </div>
          <div className="text-left">
            <p className="text-sm font-medium">Download Text</p>
            <p className="text-[10px] text-muted-foreground/50">Plain text for easy sharing</p>
          </div>
        </div>
      </button>
    </>
  )
}
