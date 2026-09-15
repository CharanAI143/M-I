import { RefreshCw, Clock } from 'lucide-react'
import { useAppStore } from '@/store'
import { Button } from '@/components/ui/button'
import { syncAllPlatforms } from '@/lib/api'
import { dbApi } from '@/store'
import { getGlowBackground } from '@/lib/colorScheme'
import { AppIcon } from '@/components/AppIcon'
import { useState, useEffect } from 'react'

const MODULE_TITLES: Record<string, string> = {
  dashboard: 'Dashboard',
  profiles: 'Profiles',
  notes: 'Notes',
  roadmap: 'AI Roadmap Generator',
  interview: 'Mock Interview',
  sql: 'SQL Practice',
  planner: 'Goals & Planner',
  settings: 'Settings',
}

export function Header() {
  const { activeModule, lastSynced, isSyncing, setLastSynced, setIsSyncing, setProfiles } = useAppStore()
  const [schemeColor, setSchemeColor] = useState(() => getGlowBackground())

  useEffect(() => {
    const sync = () => setSchemeColor(getGlowBackground())
    const observer = new MutationObserver(sync)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['style'] })
    window.addEventListener('storage', sync)
    sync()
    return () => {
      observer.disconnect()
      window.removeEventListener('storage', sync)
    }
  }, [])

  const handleSync = async () => {
    if (isSyncing) return
    setIsSyncing(true)
    try {
      const profiles = await dbApi.loadProfiles()
      const platformProfiles = profiles
        .filter(p => p.username)
        .map(p => ({ platform: p.platform as any, username: p.username }))
      if (platformProfiles.length > 0) {
        await syncAllPlatforms(platformProfiles)
      }
      const updated = await dbApi.loadProfiles()
      setProfiles(updated)
      setLastSynced(new Date().toISOString())
    } catch (e) {
      console.error('Sync failed:', e)
    } finally {
      setIsSyncing(false)
    }
  }

  return (
    <header className="flex h-14 items-center justify-between border-b bg-card px-6">
      <div className="flex items-center gap-2">
        <AppIcon size={26} className="shrink-0 rounded-md shadow-sm" />
        <h1 className="text-lg font-semibold">{MODULE_TITLES[activeModule] || 'Dashboard'}</h1>
      </div>

      <div className="flex items-center gap-4">
        {lastSynced && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>Last synced: {new Date(lastSynced).toLocaleTimeString()}</span>
          </div>
        )}
        <Button
          variant="outline"
          size="sm"
          onClick={handleSync}
          disabled={isSyncing}
          className="gap-2 border-transparent text-white shadow-sm"
          style={{ backgroundImage: schemeColor }}
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
          Sync Now
        </Button>
      </div>
    </header>
  )
}
