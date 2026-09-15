import { LayoutDashboard, User, StickyNote, Sparkles, Settings, Loader2, Mic, Target, Database } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/store'
import { AppIcon } from '@/components/AppIcon'

const baseNavItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'profiles', label: 'Profiles', icon: User },
  { id: 'notes', label: 'Notes', icon: StickyNote },
  { id: 'roadmap', label: 'Study', icon: Sparkles },
  { id: 'interview', label: 'Interview', icon: Mic },
  { id: 'planner', label: 'Planner', icon: Target },
  { id: 'settings', label: 'Settings', icon: Settings },
]

export function Sidebar() {
  const { activeModule, setActiveModule, isSyncing, settings } = useAppStore()

  const navItems = [
    ...baseNavItems.slice(0, -1),
    ...(settings?.sqlMode
      ? [{ id: 'sql', label: 'SQL', icon: Database }]
      : []),
    ...baseNavItems.slice(-1),
  ]

  return (
    <aside className="flex h-screen w-60 flex-col border-r bg-card">
      <div className="flex items-center gap-2 border-b px-6 py-4">
        <AppIcon size={32} className="shrink-0 rounded-lg shadow-sm" />
        <span className="text-lg font-bold tracking-tight">CodeTracker</span>
      </div>

      <nav className="flex-1 space-y-1 p-3">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveModule(item.id)}
            className={cn(
              'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
              activeModule === item.id
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
            )}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </button>
        ))}
      </nav>

      <div className="border-t p-4">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {isSyncing ? (
            <>
              <Loader2 className="h-3 w-3 animate-spin" />
              <span>Syncing...</span>
            </>
          ) : (
            <>
              <div className="h-2 w-2 rounded-full bg-green-500" />
              <span>Connected</span>
            </>
          )}
        </div>
      </div>
    </aside>
  )
}
