import { useState, useEffect, useCallback, useRef } from 'react'
import { dbApi } from '@/lib/db'
import { useAppStore } from '@/store'
import { calculateStreak, getToday } from '@/lib/utils'
import type {
  SqlPracticeSession,
  SqlProblem,
  SqlResultStatus,
} from '@/lib/types'
import {
  buildSqlProblems,
  DEFAULT_SQL_PROBLEMS,
} from '@/lib/sqlProblems'
import { runSqlQuery, checkSqlAnswer, type SqlQueryResult } from '@/lib/sqlRunner'
import type { SqlConfig, SqlTodo } from '@/components/sql/sql-utils'
import { SqlDashboard } from '@/components/sql/SqlDashboard'
import { SqlPracticeSetup } from '@/components/sql/SqlPracticeSetup'
import { SqlSession } from '@/components/sql/SqlSession'
import { SqlResults } from '@/components/sql/SqlResults'

type DbView = 'dashboard' | 'practice'
type PracticeView = 'setup' | 'session' | 'results'

const DEFAULT_CONFIG: SqlConfig = {
  title: '',
  difficulty: 'Mixed',
  topic: 'All Topics',
  count: 5,
  duration: 30,
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
  const [config, setConfig] = useState<SqlConfig>(DEFAULT_CONFIG)
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

  const navigate = (i: number) => {
    setCurrent(i)
    setOutput(null)
    setCheckResult(null)
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
      <SqlDashboard
        sqlActivities={sqlActivities}
        history={history}
        streak={streak}
        totalSolved={totalSolved}
        totalAttempted={totalAttempted}
        accuracy={accuracy}
        todos={todos}
        todoDone={todoDone}
        todoTotal={todoTotal}
        config={config}
        setConfig={setConfig}
        detail={detail}
        setDetail={setDetail}
        showPoster={!!animePoster}
        posterCategory={posterCategory}
        onToggleTodo={toggleTodo}
        onRegenerateTodos={regenerateTodos}
        onPracticeProblem={startSession}
        onStartSession={() => startSession()}
        onNewSession={() => { setDbView('practice'); setPracticeView('setup') }}
        onRefreshHistory={loadHistory}
        onDeleteSession={async (id) => {
          await dbApi.deleteSqlSession(id)
          loadHistory()
        }}
      />
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
        <SqlPracticeSetup
          config={config}
          setConfig={setConfig}
          onStart={() => startSession()}
          onBack={() => setDbView('dashboard')}
        />
      )}

      {practiceView === 'session' && questions.length > 0 && currentQuestion && (
        <SqlSession
          question={currentQuestion}
          index={current}
          total={questions.length}
          results={results}
          duration={config.duration}
          running={running}
          output={output}
          checkResult={checkResult}
          answer={answerFor(currentQuestion.id)}
          showSchema={showSchema}
          onNav={navigate}
          onTimerEnd={() => finishSession(true)}
          onEnd={() => finishSession(false)}
          onExit={() => setDbView('dashboard')}
          onRun={handleRun}
          onCheck={handleCheck}
          onAnswerChange={(v) => setQueryFor(currentQuestion.id, v)}
          setShowSchema={setShowSchema}
          onStatus={handleStatus}
        />
      )}

      {practiceView === 'results' && saveResult && (
        <SqlResults
          saveResult={saveResult}
          results={results}
          answers={answers}
          onDiscard={discardResult}
          onSave={persistSession}
        />
      )}
    </div>
  )
}