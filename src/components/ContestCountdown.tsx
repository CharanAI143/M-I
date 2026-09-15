import { useState, useEffect } from 'react'
import { ExternalLink } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import type { Contest } from '@/lib/contests'

function formatCountdown(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds))
  const days = Math.floor(s / 86400)
  const hours = Math.floor((s % 86400) / 3600)
  const minutes = Math.floor((s % 3600) / 60)

  if (days > 0) {
    return `${days}d ${String(hours).padStart(2, '0')}h ${String(minutes).padStart(2, '0')}m`
  }
  if (hours > 0) {
    return `${String(hours).padStart(2, '0')}h ${String(minutes).padStart(2, '0')}m`
  }
  return `${String(minutes).padStart(2, '0')}m`
}

/**
 * Self-contained contest countdown. Owns its own tick so the rest of the
 * dashboard doesn't re-render every second. Transitions to "Live" on its own
 * once the contest start time passes.
 */
export function ContestCountdown({ contest }: { contest: Contest | null }) {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])

  if (!contest) {
    return (
      <div className="text-center py-6 text-sm text-muted-foreground">
        No upcoming contests right now.
      </div>
    )
  }

  const isLive = now >= contest.startTime
  const isEnded = now >= contest.startTime + contest.duration
  const remainLive = Math.max(0, contest.startTime + contest.duration - now)
  const timeToStart = Math.max(0, contest.startTime - now)

  return (
    <div className="space-y-3">
      <div className="text-center">
        {isLive ? (
          <span className="text-2xl font-mono font-bold tracking-wider text-green-500">
            {formatCountdown(remainLive / 1000)}
          </span>
        ) : (
          <span
            className={`text-4xl font-mono font-bold tracking-wider ${
              timeToStart <= 60000 ? 'text-red-500 animate-pulse' : ''
            }`}
          >
            {formatCountdown(timeToStart / 1000)}
          </span>
        )}
        <div className="text-xs text-muted-foreground mt-1">
          {isEnded ? 'Contest ended' : isLive ? 'Live now — ends in' : 'Contest starts in'}
        </div>
        <div className="mt-2 text-sm font-medium break-words">
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault()
              window.open(contest.url, '_blank', 'noopener,noreferrer')
            }}
            className="inline-flex items-center gap-1 text-primary hover:underline"
          >
            {contest.title}
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
        <Badge variant={isLive ? 'default' : 'secondary'} className="mt-1">
          {isLive ? 'Live' : new Date(contest.startTime).toLocaleString()}
        </Badge>
      </div>
    </div>
  )
}