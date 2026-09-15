import { useCallback, useEffect, useState } from 'react'
import { useAppStore } from '@/store'
import { dbApi } from '@/lib/db'
import { calculateStreak } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { fetchCodeChefContests, fetchLeetCodeContests, fetchCodeForcesContests, type Contest } from '@/lib/contests'
import { cfSolveKey } from '@/lib/codeforces'
import { fetchCodeforcesSolved } from '@/lib/codeforces'
import { AnimalCard, LevelCard } from '@/components/ScoreCard'
import type { Ladder } from '@/lib/types'
import { AlarmClock } from 'lucide-react'
import { LaddersDialog } from '@/components/ladders/LaddersDialog'
import Wordle from '@/components/games/Wordle'
import { ActivityHeatMapGrid } from '@/components/ActivityHeatMapGrid'
import { StreakCard } from '@/components/dashboard/StreakCard'
import { TodoCard } from '@/components/dashboard/TodoCard'
import { LaddersCard } from '@/components/dashboard/LaddersCard'
import { ContestCard } from '@/components/dashboard/ContestCard'
import { useTodos } from '@/components/dashboard/useTodos'
import { useContestAlarm, type ContestPlatform } from '@/components/dashboard/useContestAlarm'

export default function Dashboard() {
  const { activities, profiles, settings, clockWarning, setClockWarning } = useAppStore()
  const streak = calculateStreak(activities)

  // ── Ladders (Codeforces) ───────────────────────────────────────
  const cfHandle = profiles.find((pr) => pr.platform === 'codeforces')?.username ?? ''
  const [ladders, setLadders] = useState<(Ladder & { solvedCount: number })[]>([])
  const [laddersOpen, setLaddersOpen] = useState(false)
  const [solvedKeys, setSolvedKeys] = useState<Set<string>>(new Set())

  const loadLadders = useCallback(async () => {
    if (!cfHandle) return
    try {
      const data = await dbApi.loadLadders(cfHandle)
      let keys = new Set<string>()
      try {
        const s = await fetchCodeforcesSolved(cfHandle)
        keys = s.keys
      } catch {}
      setSolvedKeys(keys)
      setLadders(data.map((l) => ({
        ...l,
        solvedCount: l.problems.filter((p) => keys.has(cfSolveKey(p.contestId, p.index))).length,
      })))
    } catch {}
  }, [cfHandle])

  useEffect(() => {
    loadLadders()
  }, [loadLadders])

  // ── Contest Countdown (live) ───────────────────────────────────
  const [contests, setContests] = useState<Record<ContestPlatform, Contest[]>>({
    codechef: [],
    leetcode: [],
    codeforces: [],
  })
  const [contestsLoading, setContestsLoading] = useState(false)
  const [contestsError, setContestsError] = useState('')

  const loadContests = useCallback(async () => {
    setContestsLoading(true)
    setContestsError('')
    try {
      const [codechef, leetcode, codeforces] = await Promise.all([
        fetchCodeChefContests(),
        fetchLeetCodeContests(),
        fetchCodeForcesContests(),
      ])
      setContests({ codechef, leetcode, codeforces })
    } catch (err: any) {
      setContestsError(err?.message || 'Failed to load contests')
    } finally {
      setContestsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadContests()
  }, [loadContests])

  const { contestPlatform, setContestPlatform, alarmOn, toggleAlarm, remindMinutes } = useContestAlarm(
    contests,
    setContestsError
  )

  const { todos, picking, pickError, handlePickProblems, isBeginner } = useTodos(profiles)

  // ── Heat Map ───────────────────────────────────────────────────
  return (
    <div className="space-y-6 h-full flex flex-col">
      {clockWarning && (
        <div className="flex items-start justify-between gap-3 rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3">
          <div className="flex items-start gap-2">
            <AlarmClock className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
            <p className="text-xs leading-relaxed text-amber-200/90">{clockWarning}</p>
          </div>
          <Button variant="ghost" size="sm" className="-m-1 text-amber-300 hover:bg-amber-500/10 hover:text-amber-100" onClick={() => setClockWarning(null)} aria-label="Dismiss warning">
            ✕
          </Button>
        </div>
      )}
      {/* Row 1: Streak + Animal + Badges + Todos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StreakCard streak={streak} />

        {/* Animal identity (dominant topic badge) */}
        <AnimalCard />

        {/* Coder level */}
        <LevelCard />

        {/* Daily Todos */}
        <TodoCard
          todos={todos}
          picking={picking}
          pickError={pickError}
          isBeginner={isBeginner}
          onPickFresh={() => handlePickProblems()}
        />
      </div>

      {/* Row 2: Heat Map */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Activity Heat Map</CardTitle>
        </CardHeader>
        <CardContent>
          <ActivityHeatMapGrid activities={activities} />
        </CardContent>
      </Card>

      {/* Row 3: Ladders + Contest Countdown + Wordle */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        {/* Ladders (Codeforces) */}
        {cfHandle && (
          <LaddersCard
            ladders={ladders}
            solvedKeys={solvedKeys}
            onManage={() => setLaddersOpen(true)}
          />
        )}

        {/* Contest Countdown (Live) */}
        <ContestCard
          hasLadders={!!cfHandle}
          alarmOn={alarmOn}
          toggleAlarm={toggleAlarm}
          remindMinutes={remindMinutes}
          contestPlatform={contestPlatform}
          onPlatformChange={setContestPlatform}
          contests={contests}
          contestsLoading={contestsLoading}
          contestsError={contestsError}
          onRefresh={loadContests}
          animePoster={!!settings?.animePoster}
          posterCategory={settings?.posterCategory}
        />

        {/* Wordle */}
        <div className="lg:col-span-1 h-full">
          <Wordle />
        </div>
      </div>

      {cfHandle && (
        <LaddersDialog open={laddersOpen} onOpenChange={setLaddersOpen} handle={cfHandle} />
      )}
    </div>
  )
}