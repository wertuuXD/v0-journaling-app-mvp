"use client"

import { Cloud, CloudOff, RefreshCw, AlertTriangle, CheckCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface SyncSettingsProps {
  isSupabaseConfigured: boolean
  syncEnabled: boolean
  isSyncing: boolean
  lastSync: string | null
  error: string | null
  onToggleSync: (enabled: boolean) => void
  onSyncNow: () => void
  onClearData: () => void
}

export function SyncSettings({
  isSupabaseConfigured,
  syncEnabled,
  isSyncing,
  lastSync,
  error,
  onToggleSync,
  onSyncNow,
  onClearData,
}: SyncSettingsProps) {
  const formatLastSync = (dateString: string | null) => {
    if (!dateString) return "Never"
    return new Date(dateString).toLocaleString()
  }

  if (!isSupabaseConfigured) {
    return (
      <div className="space-y-4">
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
            <div className="space-y-1">
              <h3 className="font-medium text-yellow-800">Cloud Sync Not Configured</h3>
              <p className="text-sm text-yellow-700">
                To enable cloud sync, you need to set up Supabase credentials:
              </p>
              <ol className="text-sm text-yellow-700 list-decimal list-inside space-y-1 mt-2">
                <li>1. Create a free account at <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-yellow-800">supabase.com</a></li>
                <li>2. Create a new project</li>
                <li>3. Copy your project URL and anon key</li>
                <li>4. Create a <span className="bg-yellow-100 px-1 rounded font-mono">.env.local</span> file with the credentials</li>
              </ol>
            </div>
          </div>
        </div>

        <div className="text-center">
          <p className="text-xs text-muted-foreground">
            Or continue using local storage only - your entries stay private on your device
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Sync Toggle */}
      <div className="space-y-3">
        <h3 className="text-lg font-medium">Cloud Sync</h3>
        
        <div className="flex items-center justify-between rounded-lg border p-4">
          <div className="flex items-center gap-3">
            {syncEnabled ? (
              <Cloud className="h-5 w-5 text-green-600" />
            ) : (
              <CloudOff className="h-5 w-5 text-muted-foreground" />
            )}
            <div>
              <p className="font-medium">
                {syncEnabled ? "Sync Enabled" : "Sync Disabled"}
              </p>
              <p className="text-sm text-muted-foreground">
                {syncEnabled 
                  ? "Entries will backup to cloud automatically" 
                  : "Entries stored only on this device"
                }
              </p>
            </div>
          </div>
          
          <button
            onClick={() => onToggleSync(!syncEnabled)}
            disabled={isSyncing}
            className={cn(
              "rounded-lg px-4 py-2 text-sm font-medium transition-colors",
              syncEnabled
                ? "bg-red-100 text-red-700 hover:bg-red-200"
                : "bg-green-100 text-green-700 hover:bg-green-200",
              isSyncing && "opacity-50 cursor-not-allowed"
            )}
          >
            {syncEnabled ? "Disable" : "Enable"}
          </button>
        </div>
      </div>

      {/* Sync Status */}
      {syncEnabled && (
        <div className="space-y-3">
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-1">
              <p className="text-sm font-medium">Last Sync</p>
              <p className="text-sm text-muted-foreground">
                {formatLastSync(lastSync)}
              </p>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={onSyncNow}
                disabled={isSyncing}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors",
                  "bg-blue-100 text-blue-700 hover:bg-blue-200",
                  isSyncing && "opacity-50 cursor-not-allowed"
                )}
              >
                <RefreshCw className={cn("h-4 w-4", isSyncing && "animate-spin")} />
                {isSyncing ? "Syncing..." : "Sync Now"}
              </button>
              
              <button
                onClick={onClearData}
                disabled={isSyncing}
                className="rounded-lg px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
              >
                Clear Cloud Data
              </button>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          )}

          {/* Success Message */}
          {lastSync && !error && !isSyncing && (
            <div className="rounded-lg border border-green-200 bg-green-50 p-3">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <p className="text-sm text-green-700">
                  All entries synced successfully!
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Privacy Notice */}
      <div className="rounded-lg border p-4">
        <div className="space-y-2">
          <h4 className="font-medium">Privacy & Storage</h4>
          <div className="text-sm text-muted-foreground space-y-1">
            <p>• Cloud sync uses Supabase's free tier (500MB storage)</p>
            <p>• Entries are encrypted during transmission</p>
            <p>• You maintain full control of your data</p>
            <p>• Local storage always works as backup</p>
          </div>
        </div>
      </div>
    </div>
  )
}
