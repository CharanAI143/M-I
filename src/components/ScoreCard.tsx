import { useEffect, useState } from 'react'
import { useAppStore } from '@/store'
import {
  getCoderLevel,
  totalSolvedAcross,
  dominantBadge,
  mergeCounts,
  fetchCfTagHistory,
  fetchLeetCodeTagStats,
} from '@/lib/badges'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Crown, Star, TrendingUp } from 'lucide-react'
import { AnimalAvatar } from '@/components/AnimalAnimation'

// Shared hook: merges todo tallies + Codeforces + LeetCode history.
function useBadgeCounts() {
  const { profiles, tagCounts } = useAppStore()
  const cfHandle = profiles.find((p) => p.platform === 'codeforces')?.username ?? ''
  const lcUsername = profiles.find((p) => p.platform === 'leetcode')?.username ?? ''
  const [cfHistory, setCfHistory] = useState<Record<string, number>>({})
  const [lcHistory, setLcHistory] = useState<Record<string, number>>({})
  const [historyLoading, setHistoryLoading] = useState(false)

  useEffect(() => {
    const handles = { cf: cfHandle, lc: lcUsername }
    if (!handles.cf && !handles.lc) return
    let active = true
    setHistoryLoading(true)
    const tasks: Promise<void>[] = []
    if (handles.cf) {
      tasks.push(
        fetchCfTagHistory(handles.cf)
          .then((c) => {
            if (active) setCfHistory(c)
          })
          .catch(() => {})
      )
    }
    if (handles.lc) {
      tasks.push(
        fetchLeetCodeTagStats(handles.lc)
          .then((c) => {
            if (active) setLcHistory(c)
          })
          .catch(() => {})
      )
    }
    Promise.all(tasks).finally(() => {
      if (active) setHistoryLoading(false)
    })
    return () => {
      active = false
    }
  }, [cfHandle, lcUsername])

  const merged = mergeCounts(tagCounts, cfHistory, lcHistory)
  return { counts: merged, historyLoading }
}

export function AnimalCard() {
  const { counts, historyLoading } = useBadgeCounts()
  const main = dominantBadge(counts)

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">Your Animal</CardTitle>
        <Star className="h-5 w-5 text-yellow-500" />
      </CardHeader>
      <CardContent className="flex-1 flex flex-col justify-center space-y-3">
        {main ? (
          <>
            <div className="flex items-center gap-3">
              <AnimalAvatar badgeId={main.badge.id} size={64} />
              <div className="min-w-0 flex-1">
                <p className="text-xl font-bold leading-none">{main.badge.animal}</p>
                <p className="mt-1 text-sm text-muted-foreground">{main.badge.theme} expert</p>
                <p className="mt-1 text-xs text-muted-foreground">{main.count} solved</p>
              </div>
              {historyLoading && (
                <div className="h-3 w-3 shrink-0 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              )}
            </div>
            <p className="text-sm text-muted-foreground">{main.badge.desc}</p>
          </>
        ) : (
          <div className="flex items-center gap-3">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-secondary">
              <TrendingUp className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium leading-none">Undiscovered</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Complete tagged problems to find your spirit animal.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export function LevelCard() {
  const { profiles } = useAppStore()
  const totalSolved = totalSolvedAcross(profiles)
  const { level, nextLevel, progressPct } = getCoderLevel(totalSolved)

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">Coder Level</CardTitle>
        <Crown className="h-5 w-5 text-primary" />
      </CardHeader>
      <CardContent className="flex-1 flex flex-col justify-center space-y-3">
        <div className="flex items-center gap-3">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
            <Crown className="h-8 w-8" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xl font-bold leading-none">Level {level.index}</p>
            <p className="mt-1 text-sm text-muted-foreground">{level.name}</p>
            <p className="mt-1 text-xs text-muted-foreground">{totalSolved} problems solved</p>
          </div>
        </div>

        {nextLevel && (
          <div className="rounded-lg border bg-card/50 p-3 space-y-2">
            <Progress value={progressPct} className="h-1.5" indicatorClassName="bg-primary" />
            <p className="text-xs text-muted-foreground">
              {nextLevel.minSolved - totalSolved} more for Level {nextLevel.index} · {nextLevel.name}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}