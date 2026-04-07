"use client"

import { useCallback } from "react"
import { type JournalEntry } from "@/hooks/use-journal"
import { cn } from "@/lib/utils"
import { FileText, FileDown } from "lucide-react"
import { format } from "date-fns"
import { DateRange } from "react-day-picker"
import { toast } from "sonner"

interface ExportActionsProps {
  entries: JournalEntry[]
  dateRange: DateRange | undefined
}

export default function ExportActions({ entries, dateRange }: ExportActionsProps) {
  const handleExportText = useCallback(() => {
    try {
      let text = "UNWIND JOURNAL EXPORT\n"
      
      // Format current date as ordinal format
      const today = new Date()
      const currentDay = today.getDate()
      const currentMonth = today.toLocaleDateString('en-US', { month: 'long' })
      const currentYear = today.getFullYear()
      const getOrdinalSuffix = (n: number) => {
        const s = ["th", "st", "nd", "rd"]
        const v = n % 100
        return s[(v - 20) % 10] || s[v] || s[0]
      }
      text += `Generated on: ${currentDay}${getOrdinalSuffix(currentDay)} ${currentMonth}, ${currentYear}\n`
      
      if (dateRange?.from) {
        // Format date range as ordinal format
        const formatDateOrdinal = (date: Date) => {
          const day = date.getDate()
          const month = date.toLocaleDateString('en-US', { month: 'long' })
          const year = date.getFullYear()
          const getOrdinalSuffix = (n: number) => {
            const s = ["th", "st", "nd", "rd"]
            const v = n % 100
            return s[(v - 20) % 10] || s[v] || s[0]
          }
          return `${day}${getOrdinalSuffix(day)} ${month}, ${year}`
        }
        text += `Range: ${formatDateOrdinal(dateRange.from)} - ${dateRange.to ? formatDateOrdinal(dateRange.to) : formatDateOrdinal(dateRange.from)}\n`
      }
      text += "=".repeat(30) + "\n\n"

      entries.forEach((entry) => {
        const entryDate = new Date(entry.createdAt)
        if (Number.isNaN(entryDate.getTime())) return

        // Format date as ordinal format (e.g., "8th April, 2026")
        const day = entryDate.getDate()
        const month = entryDate.toLocaleDateString('en-US', { month: 'long' })
        const year = entryDate.getFullYear()
        
        // Add ordinal suffix to day
        const getOrdinalSuffix = (n: number) => {
          const s = ["th", "st", "nd", "rd"]
          const v = n % 100
          return s[(v - 20) % 10] || s[v] || s[0]
        }
        const date = `${day}${getOrdinalSuffix(day)} ${month}, ${year}`
        const time = format(entryDate, "p")
        
        text += `${date} at ${time}\n`
        if (entry.mood) {
          // Map emoji to text for consistency with PDF
          const moodText: Record<string, string> = {
            "😊": "Happy",
            "😌": "Calm", 
            "😔": "Down",
            "😤": "Frustrated",
            "😴": "Tired",
            "🤔": "Reflective",
            "😰": "Anxious"
          }
          const moodLabel = moodText[entry.mood] || entry.mood
          text += `Mood: ${moodLabel}\n`
        }
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
      toast.success(`Text export completed! ${entries.length} entries exported`)
    } catch (error) {
      console.error("Failed to export Text:", error)
      toast.error("Failed to export text file. Please try again.")
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

      // Enhanced Branding Header
      doc.setFont("helvetica", "bold")
      doc.setFontSize(32)
      doc.setTextColor(124, 92, 255) // #7C5CFF
      doc.text("Unwind", margin, y)
      
      doc.setFont("helvetica", "normal")
      doc.setFontSize(14)
      doc.setTextColor(147, 128, 255) // Lighter purple for subtitle
      doc.text("No-Pressure Journaling", margin, y + 8)
      
      y += 18
      doc.setDrawColor(124, 92, 255)
      doc.setLineWidth(0.5)
      doc.line(margin, y, pageWidth - margin, y)
      y += 15

      // Header Info
      doc.setFontSize(10)
      doc.setTextColor(100, 100, 100)
      // Format current date as ordinal format
      const today = new Date()
      const currentDay = today.getDate()
      const currentMonth = today.toLocaleDateString('en-US', { month: 'long' })
      const currentYear = today.getFullYear()
      const getOrdinalSuffix = (n: number) => {
        const s = ["th", "st", "nd", "rd"]
        const v = n % 100
        return s[(v - 20) % 10] || s[v] || s[0]
      }
      doc.text(`Exported on ${currentDay}${getOrdinalSuffix(currentDay)} ${currentMonth}, ${currentYear}`, margin, y)
      y += 7
      if (dateRange?.from) {
        // Format date range as ordinal format
        const formatDateOrdinal = (date: Date) => {
          const day = date.getDate()
          const month = date.toLocaleDateString('en-US', { month: 'long' })
          const year = date.getFullYear()
          const getOrdinalSuffix = (n: number) => {
            const s = ["th", "st", "nd", "rd"]
            const v = n % 100
            return s[(v - 20) % 10] || s[v] || s[0]
          }
          return `${day}${getOrdinalSuffix(day)} ${month}, ${year}`
        }
        const rangeText = `${formatDateOrdinal(dateRange.from)} - ${dateRange.to ? formatDateOrdinal(dateRange.to) : formatDateOrdinal(dateRange.from)}`
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

        // Format date as ordinal format (e.g., "8th April, 2026")
        const day = entryDate.getDate()
        const month = entryDate.toLocaleDateString('en-US', { month: 'long' })
        const year = entryDate.getFullYear()
        
        // Add ordinal suffix to day
        const getOrdinalSuffix = (n: number) => {
          const s = ["th", "st", "nd", "rd"]
          const v = n % 100
          return s[(v - 20) % 10] || s[v] || s[0]
        }
        const dateStr = `${day}${getOrdinalSuffix(day)} ${month}, ${year}`
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
          // Map emoji to text for PDF compatibility
          const moodText: Record<string, string> = {
            "😊": "Happy",
            "😌": "Calm", 
            "😔": "Down",
            "😤": "Frustrated",
            "😴": "Tired",
            "🤔": "Reflective",
            "😰": "Anxious"
          }
          const moodLabel = moodText[entry.mood] || entry.mood
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
      toast.success(`PDF export completed! ${entries.length} entries exported`)
    } catch (error) {
      console.error("Failed to export PDF:", error)
      toast.error("Failed to export PDF. Please try again.")
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
