import { useCallback, useEffect, useMemo, useState } from 'react'
import { useAppStore } from '@/store'
import { dbApi } from '@/lib/db'
import { calculateStreak, getToday } from '@/lib/utils'
import type { Goal, PomodoroLog, MockInterviewSession } from '@/lib/types'
import { dateKey, rangeForType } from '@/components/planner/planner-utils'
import { PlannerStats } from '@/components/planner/PlannerStats'
import { PomodoroCard } from '@/components/planner/PomodoroCard'
import { GoalSection } from '@/components/planner/GoalSection'
import { CalendarCard } from '@/components/planner/CalendarCard'

export default function Planner() {
  const { activities, dailyTarget } = useAppStore()
  const [pomodoroLogs, setPomodoroLogs] = useState<PomodoroLog[]>([])
  const [goals, setGoals] = useState<Goal[]>([])
  const [mockSessions, setMockSessions] = useState<MockInterviewSession[]>([])

  const loadPomodoroLogs = useCallback(async () => {
    try {
      setPomodoroLogs(await dbApi.loadPomodoroLogs())
    } catch {}
  }, [])

  const loadGoals = useCallback(async () => {
    try {
      setGoals(await dbApi.loadGoals())
    } catch {}
  }, [])

  const loadMockSessions = useCallback(async () => {
    try {
      setMockSessions(await dbApi.loadMockInterviews())
    } catch {}
  }, [])

  useEffect(() => {
    loadPomodoroLogs()
    loadGoals()
    loadMockSessions()
  }, [loadPomodoroLogs, loadGoals, loadMockSessions])

  const solvedByDate = useMemo(() => {
    const map = new Map<string, number>()
    for (const a of activities) {
      if (a.problems_solved) map.set(a.date, (map.get(a.date) ?? 0) + a.problems_solved)
    }
    return map
  }, [activities])

  const focusMinutesByDate = useMemo(() => {
    const map = new Map<string, number>()
    for (const log of pomodoroLogs) {
      if (log.type !== 'focus' || !log.completed) continue
      const d = dateKey(new Date(log.started_at))
      map.set(d, (map.get(d) ?? 0) + log.duration_minutes)
    }
    return map
  }, [pomodoroLogs])

  const today = getToday()
  const todaySolved = solvedByDate.get(today) ?? 0
  const weekSolved = useMemo(() => {
    const range = rangeForType('weekly')
    let total = 0
    solvedByDate.forEach((v, d) => {
      if (d >= range.start && d <= range.end) total += v
    })
    return total
  }, [solvedByDate])
  const todayMinutes = focusMinutesByDate.get(today) ?? 0
  const streak = calculateStreak(activities)

  // Question ids the user has marked "solved" in any mock interview session.
  const solvedQuestionIds = useMemo(() => {
    const solved = new Set<string>()
    for (const sess of mockSessions) {
      sess.questions.forEach((q, i) => {
        if (sess.results?.[i] === 'solved') solved.add(q.id)
      })
    }
    return solved
  }, [mockSessions])

  const goalProgress = useCallback(
    (g: Goal): number => {
      if (g.type === 'streak') return streak
      if (g.category === 'problems') {
        let total = 0
        solvedByDate.forEach((v, d) => {
          if (d >= g.start_date && d <= g.end_date) total += v
        })
        return total
      }
      if (g.category === 'minutes') {
        let total = 0
        for (const log of pomodoroLogs) {
          if (log.type !== 'focus' || !log.completed) continue
          const d = dateKey(new Date(log.started_at))
          if (d >= g.start_date && d <= g.end_date) total += log.duration_minutes
        }
        return total
      }
      if (g.category === 'questions') {
        return (g.questions ?? []).filter((q) => solvedQuestionIds.has(q.id)).length
      }
      return g.current_value
    },
    [solvedByDate, pomodoroLogs, streak, solvedQuestionIds]
  )

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Goals & Planner</h2>
        <p className="text-muted-foreground mt-1">
          Set targets, run focused study sessions, and track your progress on a calendar
        </p>
      </div>

      <PlannerStats
        todaySolved={todaySolved}
        weekSolved={weekSolved}
        todayMinutes={todayMinutes}
        streak={streak}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <PomodoroCard
          logs={pomodoroLogs}
          onComplete={loadPomodoroLogs}
        />

        <GoalSection
          goals={goals}
          goalProgress={goalProgress}
          solvedQuestionIds={solvedQuestionIds}
          onReload={loadGoals}
        />
      </div>

      <CalendarCard
        solvedByDate={solvedByDate}
        focusMinutesByDate={focusMinutesByDate}
        dailyTarget={dailyTarget}
        today={today}
        todaySolved={todaySolved}
        activities={activities}
      />
    </div>
  )
}