import { RefreshCw, Clock } from 'lucide-react'
import { useLocation } from 'react-router-dom'
import { useAppStore } from '@/store'
import { Button } from '@/components/ui/button'
import { getGlowBackground } from '@/lib/colorScheme'
import { AppIcon } from '@/components/AppIcon'
import { ROUTES } from '@/lib/routes'
import type { RoutePath } from '@/lib/routes'
import { useState, useEffect } from 'react'

const MODULE_TITLES: Record<RoutePath, string> = {
  [ROUTES.dashboard]: 'Dashboard',
  [ROUTES.profiles]: 'Profiles',
  [ROUTES.notes]: 'Notes',
  [ROUTES.roadmap]: 'AI Roadmap Generator',
  [ROUTES.interview]: 'Mock Interview',
  [ROUTES.sql]: 'SQL Practice',
  [ROUTES.planner]: 'Goals & Planner',
  [ROUTES.settings]: 'Settings',
}

export function Header() {
  const { lastSynced, isSyncing } = useAppStore()
  const location = useLocation()
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

  const handleSync = () => {
    useAppStore.getState().syncNow()
  }

  return (
    <header className="flex h-14 items-center justify-between border-b bg-card px-6">
      <div className="flex items-center gap-2">
        <AppIcon size={26} className="shrink-0 rounded-md shadow-sm" />
        <h1 className="text-lg font-semibold">{MODULE_TITLES[location.pathname as RoutePath] ?? 'CodeTracker'}</h1>
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
