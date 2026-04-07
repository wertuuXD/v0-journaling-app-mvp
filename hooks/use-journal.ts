"use client"

import { useState, useEffect, useCallback } from "react"

export interface JournalEntry {
  id: string
  content: string
  mood?: string
  createdAt: string
  updatedAt: string
}

const STORAGE_KEY = "unwind-journal-entries"

export function useJournal() {
  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  // Load entries from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        setEntries(JSON.parse(stored))
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
        localStorage.setItem(STORAGE_KEY, JSON.stringify(entries))
      } catch (error) {
        console.error("Failed to save journal entries:", error)
      }
    }
  }, [entries, isLoaded])

  const createEntry = useCallback((content: string, mood?: string): JournalEntry => {
    const now = new Date().toISOString()
    const newEntry: JournalEntry = {
      id: crypto.randomUUID(),
      content,
      mood,
      createdAt: now,
      updatedAt: now,
    }
    setEntries((prev) => [newEntry, ...prev])
    return newEntry
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
      // Merge entries, avoiding duplicates by ID
      const existingIds = new Set(prev.map(entry => entry.id))
      const newEntries = importedEntries.filter(entry => !existingIds.has(entry.id))
      
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
