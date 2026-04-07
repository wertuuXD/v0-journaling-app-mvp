"use client"

import { useState, useEffect, useCallback } from "react"
import { toast } from "sonner"

export interface JournalEntry {
  id: string
  content: string
  mood?: string
  createdAt: string
  updatedAt: string
}

const STORAGE_KEY = "unwind-journal-entries"

function isValidEntry(entry: any): entry is JournalEntry {
  if (!entry || typeof entry !== 'object') return false
  if (typeof entry.id !== 'string') return false
  if (typeof entry.content !== 'string') return false
  if (typeof entry.createdAt !== 'string' || Number.isNaN(Date.parse(entry.createdAt))) return false
  // updatedAt is optional for legacy entries, but must be valid if present
  if (entry.updatedAt !== undefined && (typeof entry.updatedAt !== 'string' || Number.isNaN(Date.parse(entry.updatedAt)))) return false
  return true
}

export function useJournal() {
  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  // Load entries from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed)) {
          setEntries(parsed.filter(isValidEntry))
        }
      }
    } catch (error) {
      console.error("Failed to load journal entries:", error)
    }
    setIsLoaded(true)
  }, [])

  // Save entries to localStorage whenever they change
  useEffect(() => {
    if (isLoaded) {
      try {
        const dataStr = JSON.stringify(entries)
        
        // Check if we're approaching localStorage quota
        const storageSize = new Blob([dataStr]).size
        const quotaLimit = 5 * 1024 * 1024 // 5MB typical localStorage limit
        const warningThreshold = quotaLimit * 0.8 // 80% warning
        
        if (storageSize > quotaLimit) {
          // Storage quota exceeded - prevent save and show error
          toast.error("Storage quota exceeded. Please export and delete some entries to free up space.")
          return
        } else if (storageSize > warningThreshold) {
          // Approaching quota limit - show warning
          toast.warning("Storage space getting low. Consider exporting and cleaning up old entries.")
        }
        
        localStorage.setItem(STORAGE_KEY, dataStr)
      } catch (error) {
        console.error("Failed to save journal entries:", error)
        if (error instanceof DOMException && error.name === 'QuotaExceededError') {
          toast.error("Storage quota exceeded. Please export and delete some entries to free up space.")
        } else {
          toast.error("Failed to save entries. Please try again.")
        }
      }
    }
  }, [entries, isLoaded])

  const createEntry = useCallback((content: string, mood?: string): JournalEntry | null => {
    const now = new Date().toISOString()
    const newEntry: JournalEntry = {
      id: crypto.randomUUID(),
      content,
      mood,
      createdAt: now,
      updatedAt: now,
    }
    
    try {
      // Pre-check if adding this entry would exceed quota
      const currentData = localStorage.getItem(STORAGE_KEY)
      const currentSize = currentData ? new Blob([currentData]).size : 0
      const entrySize = new Blob([JSON.stringify(newEntry)]).size
      const quotaLimit = 5 * 1024 * 1024 // 5MB
      
      if (currentSize + entrySize > quotaLimit) {
        toast.error("Cannot save entry - storage quota exceeded. Please export and delete some entries first.")
        return null
      }
      
      setEntries((prev) => [newEntry, ...prev])
      return newEntry
    } catch (error) {
      console.error("Failed to create entry:", error)
      toast.error("Failed to save entry. Please try again.")
      return null
    }
  }, [])

  const updateEntry = useCallback((id: string, content: string, mood?: string) => {
    setEntries((prev) =>
      prev.map((entry) =>
        entry.id === id
          ? { ...entry, content, mood, updatedAt: new Date().toISOString() }
          : entry
      )
    )
  }, [])

  const deleteEntry = useCallback((id: string) => {
    setEntries((prev) => prev.filter((entry) => entry.id !== id))
  }, [])

  const getEntry = useCallback(
    (id: string) => entries.find((entry) => entry.id === id),
    [entries]
  )

  const importEntries = useCallback((importedEntries: JournalEntry[]) => {
    setEntries((prev) => {
      // Merge entries, avoiding duplicates by ID and validating
      const existingIds = new Set(prev.map(entry => entry.id))
      const newEntries = importedEntries.filter(entry =>
        isValidEntry(entry) && !existingIds.has(entry.id)
      )
      
      // Combine and sort by creation date (newest first)
      const allEntries = [...newEntries, ...prev]
      return allEntries.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
    })
  }, [])

  return {
    entries,
    isLoaded,
    createEntry,
    updateEntry,
    deleteEntry,
    getEntry,
    importEntries,
  }
}
