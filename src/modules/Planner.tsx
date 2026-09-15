import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { useAppStore, dbApi } from '@/store'
import { calculateStreak, getToday } from '@/lib/utils'
import type { Goal, GoalType, GoalCategory, PomodoroLog, MockQuestion, MockInterviewSession } from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Target,
  Timer,
  Play,
  Pause,
  RotateCcw,
  Plus,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Pencil,
  Check,
  Flame,
  ListChecks,
  Circle,
  ExternalLink,
} from 'lucide-react'

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function dateKey(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function formatClock(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds))
  const m = Math.floor(s / 60)
  const sec = s % 60
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
}

function rangeForType(type: GoalType): { start: string; end: string } {
  const now = new Date()
  if (type === 'daily') {
    const k = dateKey(now)
    return { start: k, end: k }
  }
  if (type === 'weekly') {
    const start = new Date(now)
    start.setDate(now.getDate() - now.getDay())
    const end = new Date(start)
    end.setDate(start.getDate() + 6)
    return { start: dateKey(start), end: dateKey(end) }
  }
  if (type === 'monthly') {
    const start = new Date(now.getFullYear(), now.getMonth(), 1)
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    return { start: dateKey(start), end: dateKey(end) }
  }
  const start = new Date(now)
  start.setDate(now.getDate() - 29)
  return { start: dateKey(start), end: dateKey(now) }
}

function unitFor(category: GoalCategory, type: GoalType): string {
  if (type === 'streak') return 'days'
  if (category === 'problems') return 'problems'
  if (category === 'minutes') return 'minutes'
  if (category === 'questions') return 'questions'
  return 'topics'
}

function playBeep() {
  try {
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    const ctx = new Ctx()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.type = 'sine'
    osc.frequency.value = 880
    gain.gain.setValueAtTime(0.2, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.7)
    osc.start()
    osc.stop(ctx.currentTime + 0.7)
  } catch {
    // Audio not available — ignore
  }
}

function getHeatColor(count: number): string {
  if (count >= 5) return 'bg-green-600 text-white'
  if (count >= 3) return 'bg-green-400 text-white'
  if (count >= 1) return 'bg-green-200 text-green-900'
  return ''
}

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

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="flex items-center justify-between pt-6">
            <div>
              <p className="text-xs text-muted-foreground">Solved today</p>
              <p className="text-3xl font-bold">{todaySolved}</p>
            </div>
            <ListChecks className="h-8 w-8 text-green-500 opacity-60" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center justify-between pt-6">
            <div>
              <p className="text-xs text-muted-foreground">Solved this week</p>
              <p className="text-3xl font-bold">{weekSolved}</p>
            </div>
            <Calendar className="h-8 w-8 text-blue-500 opacity-60" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center justify-between pt-6">
            <div>
              <p className="text-xs text-muted-foreground">Focus minutes today</p>
              <p className="text-3xl font-bold">{todayMinutes}</p>
            </div>
            <Timer className="h-8 w-8 text-yellow-500 opacity-60" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center justify-between pt-6">
            <div>
              <p className="text-xs text-muted-foreground">Current streak</p>
              <p className="text-3xl font-bold text-orange-500">{streak}</p>
            </div>
            <Flame className="h-8 w-8 text-orange-500 opacity-60" />
          </CardContent>
        </Card>
      </div>

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

// ── Pomodoro Timer ─────────────────────────────────────────────────
function PomodoroCard({ logs, onComplete }: { logs: PomodoroLog[]; onComplete: () => void }) {
  const [mode, setMode] = useState<'focus' | 'break'>('focus')
  const [focusMin, setFocusMin] = useState(25)
  const [breakMin, setBreakMin] = useState(5)
  const [running, setRunning] = useState(false)
  const [remaining, setRemaining] = useState(25 * 60)
  const endRef = useRef(0)
  const doneRef = useRef(false)

  const durationSec = (mode === 'focus' ? focusMin : breakMin) * 60

  const handleComplete = useCallback(() => {
    if (doneRef.current) return
    doneRef.current = true
    const completedMode = mode
    const dur = completedMode === 'focus' ? focusMin : breakMin
    if (completedMode === 'focus') {
      const now = new Date().toISOString()
      dbApi
        .addPomodoroLog({ type: 'focus', duration_minutes: dur, completed: 1, started_at: now, ended_at: now })
        .then(onComplete)
        .catch(() => {})
    }
    playBeep()
    const nextMode: 'focus' | 'break' = completedMode === 'focus' ? 'break' : 'focus'
    setMode(nextMode)
    setRemaining((nextMode === 'focus' ? focusMin : breakMin) * 60)
    setRunning(false)
  }, [mode, focusMin, breakMin, onComplete])

  const completeRef = useRef(handleComplete)
  completeRef.current = handleComplete

  useEffect(() => {
    if (!running) return
    doneRef.current = false
    const id = setInterval(() => {
      const left = Math.max(0, Math.round((endRef.current - Date.now()) / 1000))
      setRemaining(left)
      if (left <= 0) completeRef.current()
    }, 1000)
    return () => clearInterval(id)
  }, [running])

  const start = () => {
    if (remaining <= 0) {
      setRemaining(durationSec)
    }
    endRef.current = Date.now() + remaining * 1000
    doneRef.current = false
    setRunning(true)
  }

  const pause = () => {
    const left = Math.max(0, Math.round((endRef.current - Date.now()) / 1000))
    setRemaining(left)
    setRunning(false)
  }

  const reset = () => {
    setRunning(false)
    setRemaining(durationSec)
    doneRef.current = false
  }

  const pct = durationSec > 0 ? Math.min(1, remaining / durationSec) : 0
  const todaySessions = logs.filter(
    (l) => l.type === 'focus' && l.completed && dateKey(new Date(l.started_at)) === getToday()
  ).length
  const todayMinutes = logs
    .filter((l) => l.type === 'focus' && l.completed && dateKey(new Date(l.started_at)) === getToday())
    .reduce((sum, l) => sum + l.duration_minutes, 0)

  const R = 52
  const C = 2 * Math.PI * R

  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Timer className="h-5 w-5 text-yellow-500" />
          <CardTitle className="text-sm font-medium">Pomodoro Focus</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col space-y-4">
        <div className="flex gap-2">
          <Button
            size="sm"
            variant={mode === 'focus' ? 'default' : 'outline'}
            className="flex-1"
            onClick={() => { if (!running) { setMode('focus'); setRemaining(focusMin * 60) } }}
            disabled={running}
          >
            Focus
          </Button>
          <Button
            size="sm"
            variant={mode === 'break' ? 'default' : 'outline'}
            className="flex-1"
            onClick={() => { if (!running) { setMode('break'); setRemaining(breakMin * 60) } }}
            disabled={running}
          >
            Break
          </Button>
        </div>

        <div className="flex flex-col items-center gap-4 py-2">
          <div className="relative">
            <svg width="132" height="132" viewBox="0 0 120 120" className="-rotate-90">
              <circle cx="60" cy="60" r={R} fill="none" strokeWidth="8" className="stroke-secondary" />
              <circle
                cx="60"
                cy="60"
                r={R}
                fill="none"
                strokeWidth="8"
                strokeLinecap="round"
                className={mode === 'focus' ? 'stroke-yellow-500' : 'stroke-green-500'}
                strokeDasharray={C}
                strokeDashoffset={C * (1 - pct)}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-mono text-2xl font-bold">{formatClock(remaining)}</span>
              <span className="text-xs text-muted-foreground">{mode === 'focus' ? 'Focus' : 'Break'}</span>
            </div>
          </div>

          <div className="flex gap-2">
            {!running ? (
              <Button size="sm" className="gap-1.5" onClick={start} disabled={remaining <= 0}>
                <Play className="h-4 w-4" />
                Start
              </Button>
            ) : (
              <Button size="sm" variant="secondary" className="gap-1.5" onClick={pause}>
                <Pause className="h-4 w-4" />
                Pause
              </Button>
            )}
            <Button size="icon" variant="outline" onClick={reset} title="Reset">
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label className="text-xs">Focus length</Label>
              <Select value={String(focusMin)} onValueChange={(v) => { setFocusMin(Number(v)); if (!running && mode === 'focus') setRemaining(Number(v) * 60) }} disabled={running}>
                <SelectTrigger className="h-8 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[15, 25, 50].map((m) => (
                    <SelectItem key={m} value={String(m)}>{m} min</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Break length</Label>
              <Select value={String(breakMin)} onValueChange={(v) => { setBreakMin(Number(v)); if (!running && mode === 'break') setRemaining(Number(v) * 60) }} disabled={running}>
                <SelectTrigger className="h-8 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[5, 10, 15].map((m) => (
                    <SelectItem key={m} value={String(m)}>{m} min</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="rounded-lg border bg-muted/40 p-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Completed today</span>
              <span className="font-semibold">{todaySessions} sessions</span>
            </div>
            <div className="flex items-center justify-between mt-1">
              <span className="text-muted-foreground">Focus time today</span>
              <span className="font-semibold">{todayMinutes} min</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// ── Goals ───────────────────────────────────────────────────────────
function GoalSection({
  goals,
  goalProgress,
  solvedQuestionIds,
  onReload,
}: {
  goals: Goal[]
  goalProgress: (g: Goal) => number
  solvedQuestionIds: Set<string>
  onReload: () => void
}) {
  const [editing, setEditing] = useState<Goal | 'new' | null>(null)

  const opened = editing === 'new' ? null : editing

  return (
    <Card className="lg:col-span-2 flex flex-col h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div className="flex items-center gap-2">
          <Target className="h-5 w-5 text-primary" />
          <CardTitle className="text-sm font-medium">Goals</CardTitle>
        </div>
        <Button size="sm" className="gap-1.5" onClick={() => setEditing('new')}>
          <Plus className="h-4 w-4" />
          New Goal
        </Button>
      </CardHeader>
      <CardContent className="flex-1 space-y-3">
        {goals.length === 0 ? (
          <p className="text-center py-8 text-sm text-muted-foreground">
            No goals yet. Create a weekly problems goal to get started.
          </p>
        ) : (
          goals.map((g) => {
            const current = goalProgress(g)
            const pct = g.target_value > 0 ? Math.min(100, Math.round((current / g.target_value) * 100)) : 0
            const manual = g.category === 'topics' && g.type !== 'streak'
            const done = current >= g.target_value && g.target_value > 0
            const archived = g.status !== 'active'
            return (
              <div
                key={g.id}
                className={`rounded-lg border p-3 space-y-2 ${archived ? 'opacity-50' : ''}`}
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-medium">{g.title}</span>
                  <Badge variant="secondary" className="capitalize">{g.type}</Badge>
                  <Badge variant="outline" className="capitalize">{g.unit}</Badge>
                  {g.status === 'achieved' && <Badge variant="easy">Achieved</Badge>}
                  <span className={`ml-auto text-sm font-semibold ${done ? 'text-green-500' : ''}`}>
                    {current} / {g.target_value}
                  </span>
                </div>
                <Progress
                  value={pct}
                  className="h-2"
                  indicatorClassName={done ? 'bg-green-500' : 'bg-primary'}
                />
                {g.category === 'questions' && g.questions && g.questions.length > 0 && (
                  <div className="grid grid-cols-1 gap-1 sm:grid-cols-2">
                    {g.questions.map((q) => {
                      const isSolved = solvedQuestionIds.has(q.id)
                      return (
                        <a
                          key={q.id}
                          href="#"
                          onClick={(e) => {
                            e.preventDefault()
                            if (q.url) window.open(q.url, '_blank', 'noopener,noreferrer')
                          }}
                          className="flex items-center gap-1.5 rounded border px-2 py-1 text-xs hover:bg-accent"
                          title={q.title}
                        >
                          {isSolved ? (
                            <Check className="h-3.5 w-3.5 shrink-0 text-green-500" />
                          ) : (
                            <Circle className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                          )}
                          <span className="truncate">{q.title}</span>
                          <ExternalLink className="ml-auto h-3 w-3 shrink-0 text-muted-foreground" />
                        </a>
                      )
                    })}
                  </div>
                )}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  {g.category !== 'questions' && (
                    <span className="text-xs text-muted-foreground mr-auto">
                      {g.start_date === g.end_date ? g.start_date : `${g.start_date} → ${g.end_date}`}
                    </span>
                  )}
                  {g.category === 'questions' && (
                    <span className="text-xs text-muted-foreground mr-auto">
                      Solve these in mock interviews to complete the goal
                    </span>
                  )}
                  {manual && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 gap-1 px-2 text-xs"
                      onClick={async () => {
                        await dbApi.updateGoal(g.id, { current_value: g.current_value + 1 })
                        onReload()
                      }}
                    >
                      <Plus className="h-3 w-3" />
                      Topic done
                    </Button>
                  )}
                  {g.status === 'active' && done && (
                    <Button
                      size="sm"
                      className="h-7 gap-1 px-2 text-xs"
                      onClick={async () => {
                        await dbApi.updateGoal(g.id, { status: 'achieved' })
                        onReload()
                      }}
                    >
                      <Check className="h-3 w-3" />
                      Complete
                    </Button>
                  )}
                  <Button size="icon" variant="ghost" className="h-7 w-7" title="Edit" onClick={() => setEditing(g)}>
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7"
                    title="Delete"
                    onClick={async () => {
                      await dbApi.deleteGoal(g.id)
                      onReload()
                    }}
                  >
                    <Trash2 className="h-3.5 w-3.5 text-red-400" />
                  </Button>
                </div>
              </div>
            )
          })
        )}
      </CardContent>

      <GoalDialog
        goal={opened}
        onClose={() => setEditing(null)}
        onSaved={onReload}
      />
    </Card>
  )
}

function GoalDialog({
  goal,
  onClose,
  onSaved,
}: {
  goal: Goal | null
  onClose: () => void
  onSaved: () => void
}) {
  const [title, setTitle] = useState('')
  const [type, setType] = useState<GoalType>('weekly')
  const [category, setCategory] = useState<GoalCategory>('problems')
  const [target, setTarget] = useState('10')

  useEffect(() => {
    if (goal) {
      setTitle(goal.title)
      setType(goal.type)
      setCategory(goal.category)
      setTarget(String(goal.target_value))
    } else {
      setTitle('')
      setType('weekly')
      setCategory('problems')
      setTarget('10')
    }
  }, [goal])

  const effectiveCategory: GoalCategory = type === 'streak' ? 'problems' : category
  const unit = unitFor(effectiveCategory, type)

  const canSave = title.trim().length > 0 && Number(target) > 0

  const save = async () => {
    if (!canSave) return
    if (goal) {
      await dbApi.updateGoal(goal.id, {
        title: title.trim(),
        type,
        category: effectiveCategory,
        target_value: Number(target),
        unit,
      })
    } else {
      const range = rangeForType(type)
      await dbApi.addGoal({
        title: title.trim(),
        type,
        category: effectiveCategory,
        target_value: Number(target),
        current_value: 0,
        unit,
        start_date: range.start,
        end_date: range.end,
        status: 'active',
      })
    }
    onSaved()
    onClose()
  }

  return (
    <Dialog open={goal !== null} onOpenChange={(open) => { if (!open) onClose() }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{goal ? 'Edit Goal' : 'New Goal'}</DialogTitle>
          <DialogDescription>
            {type === 'streak'
              ? 'Maintain your solving streak for this many days.'
              : `Progress is tracked automatically for problems and focus minutes.`}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs">Title</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. 50 problems this month" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Period</Label>
              <Select value={type} onValueChange={(v) => setType(v as GoalType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="streak">Streak</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Counts</Label>
              <Select
                value={effectiveCategory}
                onValueChange={(v) => setCategory(v as GoalCategory)}
                disabled={type === 'streak'}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="problems">Problems solved</SelectItem>
                  <SelectItem value="minutes">Focus minutes</SelectItem>
                  <SelectItem value="topics">Topics (manual)</SelectItem>
                  {goal && <SelectItem value="questions">Questions (from Interview tab)</SelectItem>}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Target ({unit})</Label>
            <Input
              type="number"
              min={1}
              value={target}
              onChange={(e) => setTarget(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={save} disabled={!canSave}>
            {goal ? 'Save' : 'Create'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ── Calendar ────────────────────────────────────────────────────────
function CalendarCard({
  solvedByDate,
  focusMinutesByDate,
  dailyTarget,
  today,
  todaySolved,
  activities,
}: {
  solvedByDate: Map<string, number>
  focusMinutesByDate: Map<string, number>
  dailyTarget: { easy_target: number; easy_done: number; medium_target: number; medium_done: number; hard_target: number; hard_done: number } | null
  today: string
  todaySolved: number
  activities: Array<{ date: string; problems_solved: number }>
}) {
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth())
  const [selected, setSelected] = useState<string>(today)

  const cells = useMemo(() => {
    const first = new Date(year, month, 1)
    const startOffset = first.getDay()
    const start = new Date(first)
    start.setDate(first.getDate() - startOffset)
    const items: Array<{ date: string; day: number; inMonth: boolean }> = []
    for (let i = 0; i < 42; i++) {
      const d = new Date(start)
      d.setDate(start.getDate() + i)
      items.push({
        date: dateKey(d),
        day: d.getDate(),
        inMonth: d.getMonth() === month,
      })
    }
    return items
  }, [year, month])

  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear(year - 1) } else setMonth(month - 1)
  }
  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear(year + 1) } else setMonth(month + 1)
  }
  const goToday = () => {
    setYear(now.getFullYear())
    setMonth(now.getMonth())
    setSelected(today)
  }

  const monthLabel = new Date(year, month, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  const selSolved = solvedByDate.get(selected) ?? 0
  const selMinutes = focusMinutesByDate.get(selected) ?? 0
  const selDate = new Date(selected)
  const selStreakCount = activities.filter((a) => a.date === selected).reduce((s, a) => s + a.problems_solved, 0)
  const isTodayCell = (d: string) => d === today

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-blue-500" />
          <CardTitle className="text-sm font-medium">Study Calendar</CardTitle>
        </div>
        <div className="flex items-center gap-1.5">
          <Button size="icon" variant="ghost" className="h-7 w-7" onClick={prevMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="ghost" className="text-sm font-medium" onClick={goToday}>
            {monthLabel}
          </Button>
          <Button size="icon" variant="ghost" className="h-7 w-7" onClick={nextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-7 gap-1.5">
          {WEEKDAYS.map((d) => (
            <div key={d} className="text-center text-xs font-medium text-muted-foreground">
              {d}
            </div>
          ))}
          {cells.map((c) => {
            const solved = solvedByDate.get(c.date) ?? 0
            const minutes = focusMinutesByDate.get(c.date) ?? 0
            const isSelected = selected === c.date
            const selectedToday = isTodayCell(c.date)
            return (
              <button
                key={c.date}
                onClick={() => setSelected(c.date)}
                className={`relative aspect-square rounded-md border p-1 text-left transition-colors ${getHeatColor(solved)} ${
                  !c.inMonth ? 'opacity-40' : ''
                } ${selectedToday ? 'ring-2 ring-primary ring-offset-1 ring-offset-background' : ''} ${
                  isSelected && !selectedToday ? 'ring-1 ring-primary' : ''
                } hover:opacity-90`}
                title={`${c.date}: ${solved} solved, ${minutes} focus min`}
              >
                <span className="text-xs font-medium">{c.day}</span>
                {solved > 0 && (
                  <span className="absolute bottom-0.5 right-1 text-[10px] font-semibold">{solved}</span>
                )}
                {minutes > 0 && (
                  <span
                    className="absolute bottom-0.5 left-1 h-1 w-1 rounded-full bg-blue-400"
                    title={`${minutes} focus min`}
                  />
                )}
              </button>
            )
          })}
        </div>

        <div className="rounded-lg border bg-muted/40 p-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div>
            <p className="text-xs text-muted-foreground capitalize">{selDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</p>
            <p className="mt-1 flex items-center gap-2">
              <ListChecks className="h-4 w-4 text-green-500" />
              <span className="font-semibold">{selSolved} solved</span>
            </p>
            <p className="mt-1 flex items-center gap-2">
              <Timer className="h-4 w-4 text-yellow-500" />
              <span className="font-semibold">{selMinutes} focus min</span>
            </p>
          </div>
          {selected === today && dailyTarget && (
            <div className="sm:border-l sm:border-border sm:pl-3">
              <p className="text-xs text-muted-foreground">Daily target</p>
              <p className="mt-1 text-sm">
                <span className="text-green-500">{dailyTarget.easy_done}</span>
                <span className="text-muted-foreground">/{dailyTarget.easy_target} Easy</span>
              </p>
              <p className="mt-0.5 text-sm">
                <span className="text-yellow-500">{dailyTarget.medium_done}</span>
                <span className="text-muted-foreground">/{dailyTarget.medium_target} Medium</span>
              </p>
              <p className="mt-0.5 text-sm">
                <span className="text-red-500">{dailyTarget.hard_done}</span>
                <span className="text-muted-foreground">/{dailyTarget.hard_target} Hard</span>
              </p>
            </div>
          )}
          {selected === today && (
            <div className="sm:border-l sm:border-border sm:pl-3">
              <p className="text-xs text-muted-foreground">Today</p>
              <p className="mt-1 flex items-center gap-2 text-sm">
                <Check className="h-4 w-4 text-green-500" />
                {todaySolved >= 3 ? 'Daily streak goal met' : `${3 - todaySolved} more to reach the daily goal`}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">{selStreakCount} total submissions logged</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}