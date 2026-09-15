import { useState, useEffect, useCallback, useRef } from 'react'
import { dbApi, useAppStore } from '@/store'
import { calculateStreak, getToday } from '@/lib/utils'
import type {
  ActivityLog,
  SqlPracticeSession,
  SqlProblem,
  SqlResultStatus,
  SqlDifficulty,
} from '@/lib/types'
import {
  buildSqlProblems,
  DEFAULT_SQL_PROBLEMS,
  SQL_COUNTS,
  SQL_DURATIONS,
  SQL_TOPICS,
} from '@/lib/sqlProblems'
import { runSqlQuery, checkSqlAnswer, type SqlQueryResult } from '@/lib/sqlRunner'
import { ActivityHeatMapGrid } from '@/components/ActivityHeatMapGrid'
import TicTacToe from '@/components/games/TicTacToe'
import AnimeQuotePoster from '@/components/AnimeQuotePoster'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
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
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Progress } from '@/components/ui/progress'
import {
  Database,
  Play,
  Check,
  X,
  Lightbulb,
  Flag,
  History,
  Trash2,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Terminal,
  PlayCircle,
  Loader2,
  ChevronRight as ChevronRightIcon,
  Zap,
  CheckCircle2,
  Circle,
  ListTodo,
} from 'lucide-react'

type DbView = 'dashboard' | 'practice'
type PracticeView = 'setup' | 'session' | 'results'

const DIFFICULTY_COLORS: Record<string, string> = {
  Easy: 'text-green-500 border-green-500/40 bg-green-500/10',
  Medium: 'text-yellow-500 border-yellow-500/40 bg-yellow-500/10',
  Hard: 'text-red-500 border-red-500/40 bg-red-500/10',
}

interface SqlTodo {
  id: string
  done: boolean
}

function formatClock(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds))
  const m = Math.floor(s / 60)
  const sec = s % 60
  const h = Math.floor(m / 60)
  if (h > 0) return `${h}:${String(m % 60).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
  return `${m}:${String(sec).padStart(2, '0')}`
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return iso
  }
}

const problemById = (id: string): SqlProblem | undefined =>
  DEFAULT_SQL_PROBLEMS.find((p) => p.id === id)

function SessionTimer({ duration, onEnd }: { duration: number; onEnd: () => void }) {
  const [remaining, setRemaining] = useState(duration * 60)
  const endRef = useRef(0)
  const doneRef = useRef(false)
  const onEndRef = useRef(onEnd)
  onEndRef.current = onEnd

  useEffect(() => {
    if (endRef.current === 0) {
      endRef.current = Date.now() + duration * 60 * 1000
    }
    const id = setInterval(() => {
      const left = Math.max(0, Math.round((endRef.current - Date.now()) / 1000))
      setRemaining(left)
      if (left <= 0 && !doneRef.current) {
        doneRef.current = true
        onEndRef.current()
      }
    }, 1000)
    return () => clearInterval(id)
  }, [duration])

  const low = remaining <= 300

  return (
    <div className={`font-mono text-2xl font-bold tracking-wider ${low ? 'text-red-500 animate-pulse' : ''}`}>
      {formatClock(remaining)}
    </div>
  )
}

export default function Sql() {
  const activities = useAppStore((s) => s.activities)
  const animePoster = useAppStore((s) => s.settings?.animePoster)
const posterCategory = useAppStore((s) => s.settings?.posterCategory)
  const sqlActivities = activities.filter((a) => a.platform === 'sql')
  const streak = calculateStreak(activities, 'sql')

  const [history, setHistory] = useState<SqlPracticeSession[]>([])
  const [dbView, setDbView] = useState<DbView>('dashboard')

  // ── Daily SQL Questions ─────────────────────────────────────────
  const todayKey = `mi-tracker-sql-todos-${getToday()}`
  const [todos, setTodos] = useState<SqlTodo[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(todayKey) || '[]')
    } catch {
      return []
    }
  })
  const todosGeneratedRef = useRef(false)

  const persistTodos = useCallback(
    (items: SqlTodo[]) => {
      localStorage.setItem(todayKey, JSON.stringify(items))
    },
    [todayKey]
  )

  // Add to the day's SQL activity count (cumulative so sessions and todos earn together).
  const addSqlActivity = useCallback(async (additional: number, date?: string) => {
    if (additional <= 0) return
    const d = date ?? getToday()
    try {
      const rows = await dbApi.loadActivities()
      const existing = rows.find((a) => a.platform === 'sql' && a.date === d)
      const total = (existing?.problems_solved ?? 0) + additional
      await dbApi.logActivity('sql', total, 0, 0, 0, d)
      const updated = await dbApi.loadActivities()
      useAppStore.getState().setActivities(updated)
    } catch {}
  }, [])

  // Auto-generate today's SQL questions once per app run / per day key.
  useEffect(() => {
    if (todosGeneratedRef.current) return
    if (todos.length > 0) {
      todosGeneratedRef.current = true
      return
    }
    const picked = buildSqlProblems(DEFAULT_SQL_PROBLEMS, 'Mixed', 'All Topics', 3)
    const items: SqlTodo[] = picked.map((p) => ({ id: p.id, done: false }))
    setTodos(items)
    persistTodos(items)
    todosGeneratedRef.current = true
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const todoDone = todos.filter((t) => t.done).length
  const todoTotal = todos.length

  const toggleTodo = async (id: string) => {
    const nowDone = todos.some((t) => t.id === id && !t.done)
    const updated = todos.map((t) => (t.id === id ? { ...t, done: !t.done } : t))
    setTodos(updated)
    persistTodos(updated)
    if (nowDone) {
      await addSqlActivity(1)
    }
  }

  const regenerateTodos = () => {
    const picked = buildSqlProblems(DEFAULT_SQL_PROBLEMS, 'Mixed', 'All Topics', 3)
    const items: SqlTodo[] = picked.map((p) => ({ id: p.id, done: false }))
    setTodos(items)
    persistTodos(items)
  }

  // ── Practice session config + live state ────────────────────────
  const [config, setConfig] = useState({
    title: '',
    difficulty: 'Mixed' as SqlDifficulty | 'Mixed',
    topic: 'All Topics',
    count: 5,
    duration: 30,
  })
  const [practiceView, setPracticeView] = useState<PracticeView>('setup')
  const [questions, setQuestions] = useState<SqlProblem[]>([])
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [results, setResults] = useState<SqlResultStatus[]>([])
  const [current, setCurrent] = useState(0)
  const [output, setOutput] = useState<SqlQueryResult | null>(null)
  const [checkResult, setCheckResult] = useState<{ passed: boolean; mismatch?: string } | null>(null)
  const [running, setRunning] = useState(false)
  const [showSchema, setShowSchema] = useState(false)
  const [saveResult, setSaveResult] = useState<Omit<SqlPracticeSession, 'id' | 'created_at'> | null>(null)
  const [detail, setDetail] = useState<SqlPracticeSession | null>(null)
  const startTsRef = useRef(0)

  const loadHistory = useCallback(async () => {
    try {
      setHistory(await dbApi.loadSqlSessions())
    } catch {}
  }, [])

  useEffect(() => {
    loadHistory()
  }, [loadHistory])

  const currentQuestion = questions[current]

  const setQueryFor = (id: string, value: string) =>
    setAnswers((prev) => ({ ...prev, [id]: value }))

  const answerFor = (id: string): string => answers[id] ?? ''

  const startSession = (seeded?: SqlProblem) => {
    let picked: SqlProblem[]
    if (seeded) {
      picked = [seeded]
    } else {
      picked = buildSqlProblems(DEFAULT_SQL_PROBLEMS, config.difficulty, config.topic, config.count)
    }
    if (picked.length === 0) return
    setQuestions(picked)
    setAnswers(Object.fromEntries(picked.map((q) => [q.id, q.starterCode ?? ''])))
    setResults(picked.map(() => null))
    setCurrent(0)
    setOutput(null)
    setCheckResult(null)
    startTsRef.current = Date.now()
    setPracticeView('session')
    setDbView('practice')
  }

  const handleRun = async () => {
    const q = currentQuestion
    if (!q) return
    setRunning(true)
    setOutput(null)
    try {
      const res = await runSqlQuery(q.schema, answerFor(q.id))
      setOutput(res)
    } finally {
      setRunning(false)
    }
  }

  const handleCheck = async () => {
    const q = currentQuestion
    if (!q) return
    setRunning(true)
    try {
      const answer = answerFor(q.id)
      const res = await checkSqlAnswer(q.schema, q.solution, answer)
      setCheckResult(res)
      const outputRes = await runSqlQuery(q.schema, answer)
      setOutput(outputRes)
    } finally {
      setRunning(false)
    }
  }

  const handleStatus = (status: Exclude<SqlResultStatus, null>) => {
    if (status === 'solved' && checkResult?.passed !== true) return
    setResults((prev) => {
      const next = [...prev]
      next[current] = status
      return next
    })
    if (current < questions.length - 1) {
      setCurrent((c) => c + 1)
      setOutput(null)
      setCheckResult(null)
    }
  }

  const finishSession = (autoEnd = false) => {
    const total = questions.length
    const solved = results.filter((s) => s === 'solved').length
    const wrong = results.filter((s) => s === 'wrong').length
    const skipped = results.filter((s) => s === 'skipped').length
    const durationSec = config.duration * 60
    const elapsed = autoEnd
      ? durationSec
      : Math.min(durationSec, Math.floor((Date.now() - startTsRef.current) / 1000))
    const score = total > 0 ? Math.round((solved / total) * 100) : 0

    const session: Omit<SqlPracticeSession, 'id' | 'created_at'> = {
      title: config.title.trim() || 'SQL Practice',
      difficulty: config.difficulty,
      topic: config.topic,
      total_questions: total,
      solved,
      wrong,
      skipped,
      duration_minutes: config.duration,
      elapsed_seconds: elapsed,
      questions,
      answers,
      results,
      score,
      status: 'completed',
      started_at: new Date(startTsRef.current).toISOString(),
      ended_at: new Date().toISOString(),
    }
    setSaveResult(session)
    setPracticeView('results')
  }

  const persistSession = async () => {
    if (!saveResult) return
    try {
      await dbApi.addSqlSession(saveResult)
      await addSqlActivity(saveResult.solved)
    } catch {}
    setSaveResult(null)
    setPracticeView('setup')
    setDbView('dashboard')
    loadHistory()
  }

  const discardResult = () => {
    setSaveResult(null)
    setPracticeView('setup')
    setDbView('dashboard')
  }

  // ── Derived dashboard stats ─────────────────────────────────────
  const totalSolved = history.reduce((sum, s) => sum + s.solved, 0)
  const totalAttempted = history.reduce((sum, s) => sum + (s.solved + s.wrong), 0)
  const accuracy = totalAttempted > 0 ? Math.round((totalSolved / totalAttempted) * 100) : 0

  // ── Dashboard view ──────────────────────────────────────────────
  if (dbView === 'dashboard') {
    return (
      <div className="space-y-6 h-full flex flex-col">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* SQL Streak */}
          <Card className="h-full flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">SQL Practice Streak</CardTitle>
              <Database
                className="h-16 w-16 object-contain animate-float-fire text-emerald-400"
                style={{ filter: 'drop-shadow(0 0 10px rgba(16,185,129,0.55)) drop-shadow(0 0 20px rgba(16,185,129,0.3))' }}
              />
            </CardHeader>
            <CardContent className="flex-1 flex flex-col justify-center">
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-emerald-500">{streak}</span>
                <span className="text-sm text-muted-foreground">days</span>
              </div>
              <Badge variant="secondary" className="mt-2">
                <Zap className="mr-1 h-3 w-3" />
                Keep querying!
              </Badge>
            </CardContent>
          </Card>

          {/* Questions Solved */}
          <Card className="h-full flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Questions Solved</CardTitle>
              <CheckCircle2 className="h-6 w-6 text-green-500" />
            </CardHeader>
            <CardContent className="flex-1 flex flex-col justify-center">
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold">{totalSolved}</span>
                <span className="text-sm text-muted-foreground">questions</span>
              </div>
              <Badge variant="secondary" className="mt-2">
                <History className="mr-1 h-3 w-3" />
                {history.length} session{history.length === 1 ? '' : 's'} completed
              </Badge>
            </CardContent>
          </Card>

          {/* Accuracy */}
          <Card className="h-full flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Accuracy</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col justify-center">
              <div className="flex items-baseline gap-1">
                <span className={`text-4xl font-bold ${accuracy >= 50 ? 'text-green-500' : 'text-red-500'}`}>
                  {accuracy}%
                </span>
              </div>
              {totalAttempted > 0 ? (
                <>
                  <Progress value={accuracy} className="mt-3 h-1.5" indicatorClassName="bg-primary" />
                  <p className="mt-1 text-xs text-muted-foreground">
                    {totalSolved}/{totalAttempted} queries passed
                  </p>
                </>
              ) : (
                <p className="mt-2 text-xs text-muted-foreground">Complete a session to see accuracy.</p>
              )}
            </CardContent>
          </Card>

          {/* Daily SQL Questions */}
          <Card className="h-full flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Daily SQL Questions</CardTitle>
              <div className="flex items-center gap-1">
                {todoTotal > 0 && todoDone === todoTotal && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={regenerateTodos}
                    title="All done! Pick a fresh set to keep your streak going."
                  >
                    <Zap className="h-3.5 w-3.5 mr-1" />
                    Pick 3
                  </Button>
                )}
                <ListTodo className="h-5 w-5 text-emerald-500" />
              </div>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col space-y-3">
              {todoTotal === 0 ? (
                <p className="text-center text-xs text-muted-foreground py-4">
                  Generating today's SQL questions…
                </p>
              ) : (
                <div className="space-y-1 max-h-[160px] overflow-y-auto">
                  {todos.map((t) => {
                    const p = problemById(t.id)
                    if (!p) return null
                    return (
                      <div key={t.id} className="rounded-md border">
                        <div className="flex items-center px-2.5 py-1.5 gap-2">
                          <button
                            type="button"
                            title={t.done ? 'Mark as not done' : 'Mark as solved today'}
                            onClick={() => toggleTodo(t.id)}
                          >
                            {t.done ? (
                              <CheckCircle2 className="h-4 w-4 shrink-0 text-green-500" />
                            ) : (
                              <Circle className="h-4 w-4 shrink-0 text-muted-foreground" />
                            )}
                          </button>
                          <span className={`text-sm truncate flex-1 ${t.done ? 'line-through text-muted-foreground' : ''}`}>
                            {p.title}
                          </span>
                          <Badge variant="outline" className={`shrink-0 text-[10px] px-1.5 py-0 ${DIFFICULTY_COLORS[p.difficulty]}`}>
                            {p.difficulty}
                          </Badge>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="shrink-0 px-2 text-primary hover:text-primary"
                            title="Practice this question"
                            onClick={() => startSession(p)}
                          >
                            <PlayCircle className="h-3.5 w-3.5 mr-1" />
                            Practice
                          </Button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}

              {todoTotal > 0 && (
                <div className="text-center text-xs text-muted-foreground">
                  {todoDone}/{todoTotal} completed
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Row 2: SQL Heat Map */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">SQL Practice Heat Map</CardTitle>
            <Badge variant="secondary" className="text-xs">Platform: SQL</Badge>
          </CardHeader>
          <CardContent>
            <ActivityHeatMapGrid activities={sqlActivities as ActivityLog[]} />
          </CardContent>
        </Card>

        {/* Row 3: Sessions + Right Column Stack (Quick Practice, Tic Tac Toe, Poster) */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-stretch">
          {/* Recent sessions */}
          <Card className="lg:col-span-2 flex flex-col h-full min-h-0">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Recent Practice Sessions</CardTitle>
              <div className="flex items-center gap-1">
                <Button size="sm" variant="outline" onClick={loadHistory} title="Refresh sessions">
                  <RotateCcw className="h-3.5 w-3.5" />
                </Button>
                <Button size="sm" className="gap-1.5" onClick={() => { setConfig((c) => ({ ...c })); setDbView('practice'); setPracticeView('setup') }}>
                  <Play className="h-3.5 w-3.5" />
                  New Session
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              {history.length === 0 ? (
                <p className="text-center py-6 text-sm text-muted-foreground">
                  No SQL sessions yet. Start your first practice session above.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-xs text-muted-foreground">
                        <th className="pb-2 pr-2 font-medium">Title</th>
                        <th className="pb-2 pr-2 font-medium">Solved</th>
                        <th className="pb-2 pr-2 font-medium">Score</th>
                        <th className="pb-2 pr-2 font-medium">Date</th>
                        <th className="pb-2 pr-2 font-medium">Accuracy</th>
                        <th className="pb-2 font-medium" />
                      </tr>
                    </thead>
                    <tbody>
                      {history.map((s) => (
                        <tr key={s.id} className="border-t">
                          <td className="py-2 pr-2 font-medium truncate max-w-[160px]">{s.title}</td>
                          <td className="py-2 pr-2 text-muted-foreground">
                            {s.solved}/{s.total_questions}
                          </td>
                          <td className="py-2 pr-2">
                            <span className={s.score >= 50 ? 'text-green-500' : 'text-red-500'}>{s.score}%</span>
                          </td>
                          <td className="py-2 pr-2 text-muted-foreground">{formatDate(s.ended_at)}</td>
                          <td className="py-2 pr-2">
                            <div className="flex items-center gap-2">
                              <Progress
                                value={s.score}
                                className="h-1.5 w-16"
                                indicatorClassName={s.score >= 50 ? 'bg-green-500' : 'bg-red-500'}
                              />
                            </div>
                          </td>
                          <td className="py-2 text-right">
                            <div className="flex justify-end gap-1">
                              <Button size="icon" variant="ghost" title="View details" onClick={() => setDetail(s)}>
                                <ChevronRightIcon className="h-4 w-4" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                title="Delete"
                                onClick={async () => {
                                  await dbApi.deleteSqlSession(s.id)
                                  loadHistory()
                                }}
                              >
                                <Trash2 className="h-4 w-4 text-red-400" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Right column stack: Quick Practice + Tic Tac Toe + Poster */}
          <div className="lg:col-span-2 flex flex-col gap-6 h-full min-h-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-stretch">
              {/* Quick practice */}
              <Card className="flex flex-col h-full min-h-0">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <PlayCircle className="h-5 w-5 text-primary" />
                <CardTitle className="text-sm font-medium">Quick Practice</CardTitle>
              </div>
              <CardDescription className="text-xs">
                Jump straight into a timed query session.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs">Difficulty</Label>
                <Select
                  value={config.difficulty}
                  onValueChange={(v) => setConfig({ ...config, difficulty: v as SqlDifficulty | 'Mixed' })}
                >
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {['Mixed', 'Easy', 'Medium', 'Hard'].map((d) => (
                      <SelectItem key={d} value={d}>
                        {d}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Topic</Label>
                <Select value={config.topic} onValueChange={(v) => setConfig({ ...config, topic: v })}>
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SQL_TOPICS.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Questions</Label>
                  <Select
                    value={String(config.count)}
                    onValueChange={(v) => setConfig({ ...config, count: Number(v) })}
                  >
                    <SelectTrigger className="h-9 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SQL_COUNTS.map((c) => (
                        <SelectItem key={c} value={String(c)}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Minutes</Label>
                  <Select
                    value={String(config.duration)}
                    onValueChange={(v) => setConfig({ ...config, duration: Number(v) })}
                  >
                    <SelectTrigger className="h-9 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SQL_DURATIONS.map((d) => (
                        <SelectItem key={d} value={String(d)}>
                          {d}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button className="w-full gap-2" onClick={() => startSession()}>
                <Play className="h-4 w-4" />
                Start SQL Session
              </Button>
            </CardContent>
          </Card>

          {/* Tic Tac Toe */}
              <div className="h-full">
                <TicTacToe />
              </div>
            </div>

            {/* Daily anime quote poster */}
            {animePoster && (
              <div className="flex-1 min-h-[200px]">
                <AnimeQuotePoster category={posterCategory} />
              </div>
            )}
          </div>
        </div>

        {/* Session detail dialog */}
        <Dialog open={!!detail} onOpenChange={(open) => { if (!open) setDetail(null) }}>
          <DialogContent className="max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{detail?.title}</DialogTitle>
              <DialogDescription>
                {detail?.difficulty} · {detail?.topic} · {detail?.solved}/{detail?.total_questions} solved · Score {detail?.score}%
              </DialogDescription>
            </DialogHeader>
            {detail && (
              <div className="space-y-3">
                {detail.questions.map((q, i) => {
                  const rs = detail.results?.[i]
                  const answer = detail.answers?.[q.id]
                  return (
                    <div key={q.id} className="rounded-lg border p-3">
                      <div className="flex items-center gap-2">
                        {rs === 'solved' ? (
                          <Check className="h-4 w-4 shrink-0 text-green-500" />
                        ) : rs === 'wrong' ? (
                          <X className="h-4 w-4 shrink-0 text-orange-500" />
                        ) : rs === 'skipped' ? (
                          <X className="h-4 w-4 shrink-0 text-red-500" />
                        ) : (
                          <span className="h-4 w-4 shrink-0 rounded-full border border-muted-foreground/50" />
                        )}
                        <span className="text-sm font-medium">{q.title}</span>
                        <Badge variant="outline" className={`ml-auto ${DIFFICULTY_COLORS[q.difficulty]}`}>
                          {q.difficulty}
                        </Badge>
                      </div>
                      {answer?.trim() && (
                        <pre className="mt-2 rounded-md bg-muted/40 p-2 text-xs overflow-x-auto whitespace-pre-wrap">
                          {answer}
                        </pre>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    )
  }

  // ── Practice view ───────────────────────────────────────────────
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">SQL Practice</h2>
        <p className="text-muted-foreground mt-1">
          Interactive query editor with real tables, instant results, and hand-checked SQL problems
        </p>
      </div>

      {practiceView === 'setup' && (
        <>
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Database className="h-5 w-5 text-primary" />
                <CardTitle className="text-sm font-medium">New SQL Session</CardTitle>
              </div>
              <CardDescription className="text-xs">
                Configure your session — pick a difficulty, a topic, and a time limit.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="space-y-1.5">
                  <Label className="text-xs">Session title</Label>
                  <Input
                    placeholder="e.g. Analytics warm-up"
                    value={config.title}
                    onChange={(e) => setConfig({ ...config, title: e.target.value })}
                    className="h-9 text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Difficulty</Label>
                  <Select
                    value={config.difficulty}
                    onValueChange={(v) => setConfig({ ...config, difficulty: v as SqlDifficulty | 'Mixed' })}
                  >
                    <SelectTrigger className="h-9 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {['Mixed', 'Easy', 'Medium', 'Hard'].map((d) => (
                        <SelectItem key={d} value={d}>
                          {d}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Topic</Label>
                  <Select value={config.topic} onValueChange={(v) => setConfig({ ...config, topic: v })}>
                    <SelectTrigger className="h-9 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SQL_TOPICS.map((t) => (
                        <SelectItem key={t} value={t}>
                          {t}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Questions</Label>
                    <Select
                      value={String(config.count)}
                      onValueChange={(v) => setConfig({ ...config, count: Number(v) })}
                    >
                      <SelectTrigger className="h-9 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {SQL_COUNTS.map((c) => (
                          <SelectItem key={c} value={String(c)}>
                            {c} questions
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Duration</Label>
                    <Select
                      value={String(config.duration)}
                      onValueChange={(v) => setConfig({ ...config, duration: Number(v) })}
                    >
                      <SelectTrigger className="h-9 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {SQL_DURATIONS.map((d) => (
                          <SelectItem key={d} value={String(d)}>
                            {d} min
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Button className="gap-2" onClick={() => startSession()}>
                  <Play className="h-4 w-4" />
                  Start SQL Session
                </Button>
                <Button variant="outline" className="gap-2" onClick={() => setDbView('dashboard')}>
                  <ChevronLeft className="h-4 w-4" />
                  Back to Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {practiceView === 'session' && questions.length > 0 && currentQuestion && (
        <Card className="flex flex-col">
          <CardHeader className="pb-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="min-w-0">
                <CardTitle className="text-base">{currentQuestion.title}</CardTitle>
                <CardDescription className="text-xs">
                  Question {current + 1} of {questions.length}
                </CardDescription>
              </div>
              <div className="flex items-center gap-3">
                <SessionTimer duration={config.duration} onEnd={() => finishSession(true)} />
                <Button variant="destructive" size="sm" className="gap-1.5" onClick={() => finishSession(false)}>
                  <Flag className="h-3.5 w-3.5" />
                  End
                </Button>
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5 pt-2">
              {results.map((s, i) => (
                <button
                  key={i}
                  onClick={() => { setCurrent(i); setOutput(null); setCheckResult(null) }}
                  className={`h-7 w-7 rounded-md text-xs font-semibold transition-colors ${
                    i === current
                      ? 'bg-primary text-primary-foreground'
                      : s === 'solved'
                        ? 'bg-green-500/20 text-green-500 hover:bg-green-500/30'
                        : s === 'wrong'
                          ? 'bg-orange-500/20 text-orange-500 hover:bg-orange-500/30'
                          : s === 'skipped'
                            ? 'bg-red-500/20 text-red-500 hover:bg-red-500/30'
                            : 'bg-secondary text-muted-foreground hover:bg-accent'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          </CardHeader>

          <CardContent className="flex-1 space-y-4">
            <div className="rounded-lg border p-4 space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline" className={DIFFICULTY_COLORS[currentQuestion.difficulty]}>
                  {currentQuestion.difficulty}
                </Badge>
                <Badge variant="secondary">{currentQuestion.topic}</Badge>
                {results[current] === 'solved' && <Badge variant="easy" className="ml-auto">Solved</Badge>}
                {results[current] === 'wrong' && <Badge variant="hard" className="ml-auto">Needs Work</Badge>}
                {results[current] === 'skipped' && <Badge variant="hard" className="ml-auto">Skipped</Badge>}
              </div>
              <p className="text-sm text-muted-foreground">{currentQuestion.description}</p>
              <details className="rounded-md border bg-muted/40 p-3">
                <summary className="flex cursor-pointer items-center gap-1.5 text-xs font-medium text-muted-foreground">
                  <Lightbulb className="h-3.5 w-3.5 text-yellow-500" />
                  Need a hint?
                </summary>
                <p className="mt-2 text-sm">{currentQuestion.hint}</p>
              </details>
              <button
                type="button"
                onClick={() => setShowSchema((v) => !v)}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
              >
                <Database className="h-3.5 w-3.5" />
                {showSchema ? 'Hide schema' : 'Show schema'}
              </button>
              {showSchema && (
                <pre className="overflow-x-auto rounded-md bg-muted/40 p-3 text-xs leading-relaxed text-muted-foreground">
                  {currentQuestion.schema.trim()}
                </pre>
              )}
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-xs">Write your query</Label>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="gap-1.5" onClick={handleRun} disabled={running}>
                    {running ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <PlayCircle className="h-3.5 w-3.5" />}
                    Run
                  </Button>
                  <Button size="sm" className="gap-1.5" onClick={handleCheck} disabled={running}>
                    {running ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                    Check Answer
                  </Button>
                </div>
              </div>
              <textarea
                value={answerFor(currentQuestion.id)}
                onChange={(e) => setQueryFor(currentQuestion.id, e.target.value)}
                placeholder="SELECT ... FROM ...;"
                spellCheck={false}
                className="min-h-[150px] w-full rounded-md border border-input bg-background px-3 py-2 font-mono text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
            </div>

            {output && (
              <div className="rounded-md border">
                <div className="flex items-center justify-between border-b px-3 py-2">
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                    <Terminal className="h-3.5 w-3.5" />
                    Result
                    {!output.error && typeof output.elapsedMs === 'number' && (
                      <span className="text-[10px] text-muted-foreground/70">({output.elapsedMs.toFixed(1)} ms)</span>
                    )}
                  </span>
                  {output.changeCount != null && output.changeCount > 0 && (
                    <span className="text-[10px] text-muted-foreground">
                      {output.changeCount} row{output.changeCount === 1 ? '' : 's'} affected
                    </span>
                  )}
                </div>
                {output.error ? (
                  <p className="px-3 py-3 font-mono text-xs text-red-400">{output.error}</p>
                ) : output.columns.length === 0 ? (
                  <p className="px-3 py-3 text-xs text-muted-foreground">
                    Query ran successfully — no result rows to display.
                  </p>
                ) : (
                  <div className="max-h-[240px] overflow-auto">
                    <table className="w-full text-xs">
                      <thead className="bg-muted/40 sticky top-0">
                        <tr>
                          {output.columns.map((c) => (
                            <th key={c} className="px-3 py-1.5 text-left font-semibold text-muted-foreground">
                              {c}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {output.rows.map((row, ri) => (
                          <tr key={ri} className="border-t">
                            {output.columns.map((c) => (
                              <td key={c} className="px-3 py-1.5 font-mono">
                                {row[c] ?? <span className="text-muted-foreground/50">NULL</span>}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {checkResult && (
              <div
                className={`flex items-start gap-2 rounded-md border px-3 py-2 text-sm ${
                  checkResult.passed
                    ? 'border-green-500/40 bg-green-500/10 text-green-400'
                    : 'border-orange-500/40 bg-orange-500/10 text-orange-400'
                }`}
              >
                {checkResult.passed ? (
                  <>
                    <Check className="h-4 w-4 mt-0.5 shrink-0" />
                    <span>Correct! Your query produces the expected result.</span>
                  </>
                ) : (
                  <>
                    <X className="h-4 w-4 mt-0.5 shrink-0" />
                    <span>{checkResult.mismatch ?? 'Not quite — keep trying.'}</span>
                  </>
                )}
              </div>
            )}

            <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setDbView('dashboard')}>
                  <ChevronLeft className="h-4 w-4" />
                  Exit
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1.5"
                  onClick={() => setCurrent((c) => Math.max(0, c - 1))}
                  disabled={current === 0}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Prev
                </Button>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="secondary" className="gap-1.5" onClick={() => handleStatus('skipped')}>
                  <X className="h-4 w-4" />
                  Skip
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1.5 text-orange-400 hover:text-orange-300"
                  onClick={() => handleStatus('wrong')}
                  disabled={!output || !!output.error}
                  title="Mark as attempted but not correct yet"
                >
                  Needs Work
                </Button>
                <Button
                  size="sm"
                  className="gap-1.5"
                  onClick={() => handleStatus('solved')}
                  disabled={checkResult?.passed !== true}
                  title="Mark solved (only when Check Answer passes)"
                >
                  <Check className="h-4 w-4" />
                  Solved
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1.5"
                  onClick={() => { setCurrent((c) => Math.min(questions.length - 1, c + 1)); setOutput(null); setCheckResult(null) }}
                  disabled={current === questions.length - 1}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {practiceView === 'results' && saveResult && (
        <Card>
          <CardContent className="space-y-5 pt-6">
            <div className="flex flex-col items-center gap-3 text-center">
              <div
                className={`flex h-28 w-28 items-center justify-center rounded-full border-4 ${
                  saveResult.score >= 50 ? 'border-green-500 text-green-500' : 'border-red-500 text-red-500'
                }`}
              >
                <span className="text-3xl font-bold">{saveResult.score}%</span>
              </div>
              <div>
                <div className="flex items-center justify-center gap-2">
                  <Database className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-semibold">
                    {saveResult.score >= 80 ? 'Excellent! Strong query writing round.' : saveResult.score >= 50 ? 'Good effort — keep polishing your joins.' : 'Tough one — review and try again.'}
                  </h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  {saveResult.solved} solved · {saveResult.wrong} needs work · {saveResult.skipped} skipped · {saveResult.total_questions} total · used {formatClock(saveResult.elapsed_seconds)} of {saveResult.duration_minutes} min
                </p>
              </div>
            </div>

            <div className="rounded-lg border">
              <div className="max-h-[320px] overflow-y-auto">
                {saveResult.questions.map((q, i) => {
                  const st = results[i]
                  return (
                    <div key={q.id} className="border-b p-4 last:border-b-0">
                      <div className="flex items-center gap-2">
                        {st === 'solved' ? (
                          <Check className="h-4 w-4 shrink-0 text-green-500" />
                        ) : st === 'wrong' ? (
                          <X className="h-4 w-4 shrink-0 text-orange-500" />
                        ) : st === 'skipped' ? (
                          <X className="h-4 w-4 shrink-0 text-red-500" />
                        ) : (
                          <span className="h-4 w-4 shrink-0 rounded-full border border-muted-foreground/50" />
                        )}
                        <span className="font-medium">{q.title}</span>
                        <Badge variant="outline" className={`ml-auto ${DIFFICULTY_COLORS[q.difficulty]}`}>
                          {q.difficulty}
                        </Badge>
                      </div>
                      <div className="mt-2 flex items-center justify-between gap-2">
                        <p className="text-xs text-muted-foreground capitalize">{q.topic}</p>
                      </div>
                      {answers[q.id]?.trim() && (
                        <pre className="mt-2 rounded-md bg-muted/40 p-2 text-xs overflow-x-auto whitespace-pre-wrap">
                          {answers[q.id]}
                        </pre>
                      )}
                      {st !== 'solved' && (
                        <details className="mt-2 rounded-md border bg-muted/40 p-2">
                          <summary className="cursor-pointer text-xs font-medium text-muted-foreground">
                            Reference solution
                          </summary>
                          <pre className="mt-2 overflow-x-auto font-mono text-xs">{q.solution}</pre>
                        </details>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="flex flex-wrap justify-end gap-2">
              <Button variant="outline" className="gap-1.5" onClick={discardResult}>
                <RotateCcw className="h-4 w-4" />
                Discard
              </Button>
              <Button className="gap-1.5" onClick={persistSession}>
                <Check className="h-4 w-4" />
                Save to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}