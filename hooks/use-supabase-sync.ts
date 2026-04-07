"use client"

import { useState, useEffect, useCallback } from "react"
import { supabase, isSupabaseConfigured } from "@/lib/supabase"
import { type JournalEntry } from "./use-journal"

interface SyncState {
  isSyncing: boolean
  lastSync: string | null
  syncEnabled: boolean
  error: string | null
}

export function useSupabaseSync() {
  const [syncState, setSyncState] = useState<SyncState>({
    isSyncing: false,
    lastSync: null,
    syncEnabled: false,
    error: null,
  })

  // Check if Supabase is configured
  const isSupabaseConfigured = !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL && 
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )

  // Load sync settings from localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem('unwind-sync-settings')
    if (savedSettings) {
      const settings = JSON.parse(savedSettings)
      setSyncState(prev => ({ ...prev, syncEnabled: settings.syncEnabled }))
    }
  }, [])

  // Save sync settings to localStorage
  const saveSyncSettings = useCallback((enabled: boolean) => {
    localStorage.setItem('unwind-sync-settings', JSON.stringify({ syncEnabled: enabled }))
    setSyncState(prev => ({ ...prev, syncEnabled: enabled }))
  }, [])

  // Upload entries to Supabase
  const uploadEntries = useCallback(async (entries: JournalEntry[]) => {
    if (!isSupabaseConfigured || !syncState.syncEnabled || !supabase) return false

    try {
      setSyncState(prev => ({ ...prev, isSyncing: true, error: null }))

      // Get user ID (create if doesn't exist)
      const { data: { user } } = await supabase.auth.getUser()
      let userId = user?.id

      if (!userId) {
        // Create anonymous user
        const { data: { user: newUser } } = await supabase.auth.signInAnonymously()
        userId = newUser?.id
      }

      if (!userId) throw new Error('Failed to get user ID')

      // Upload entries
      const { error } = await supabase
        .from('journal_entries')
        .upsert(
          entries.map(entry => ({
            ...entry,
            user_id: userId,
            local_created_at: entry.createdAt,
            local_updated_at: entry.updatedAt
          })),
          { onConflict: 'id' }
        )

      if (error) throw error

      setSyncState(prev => ({
        ...prev,
        isSyncing: false,
        lastSync: new Date().toISOString(),
        error: null
      }))

      return true
    } catch (error) {
      console.error('Sync failed:', error)
      setSyncState(prev => ({
        ...prev,
        isSyncing: false,
        error: error instanceof Error ? error.message : 'Sync failed'
      }))
      return false
    }
  }, [isSupabaseConfigured, syncState.syncEnabled])

  // Download entries from Supabase
  const downloadEntries = useCallback(async (): Promise<JournalEntry[]> => {
    if (!isSupabaseConfigured || !syncState.syncEnabled || !supabase) return []

    try {
      setSyncState(prev => ({ ...prev, isSyncing: true, error: null }))

      // Get user ID
      const { data: { user } } = await supabase.auth.getUser()
      if (!user?.id) throw new Error('User not authenticated')

      // Download entries
      const { data, error } = await supabase
        .from('journal_entries')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error

      const entries: JournalEntry[] = (data || []).map(entry => ({
        id: entry.id,
        content: entry.content,
        mood: entry.mood,
        createdAt: entry.local_created_at || entry.created_at,
        updatedAt: entry.local_updated_at || entry.updated_at
      }))

      setSyncState(prev => ({
        ...prev,
        isSyncing: false,
        lastSync: new Date().toISOString(),
        error: null
      }))

      return entries
    } catch (error) {
      console.error('Download failed:', error)
      setSyncState(prev => ({
        ...prev,
        isSyncing: false,
        error: error instanceof Error ? error.message : 'Download failed'
      }))
      return []
    }
  }, [isSupabaseConfigured, syncState.syncEnabled])

  // Toggle sync
  const toggleSync = useCallback((enabled: boolean) => {
    saveSyncSettings(enabled)
  }, [saveSyncSettings])

  // Clear sync data
  const clearSyncData = useCallback(async () => {
    if (!isSupabaseConfigured || !supabase) return

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user?.id) return

      await supabase
        .from('journal_entries')
        .delete()
        .eq('user_id', user.id)

      setSyncState(prev => ({
        ...prev,
        lastSync: null,
        error: null
      }))
    } catch (error) {
      console.error('Clear sync data failed:', error)
      setSyncState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to clear sync data'
      }))
    }
  }, [isSupabaseConfigured])

  return {
    ...syncState,
    isSupabaseConfigured,
    uploadEntries,
    downloadEntries,
    toggleSync,
    clearSyncData,
  }
}
