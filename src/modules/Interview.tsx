import { useState, useEffect, useCallback, useRef } from 'react'
import { dbApi, useAppStore } from '@/store'
import type { MockInterviewSession, MockQuestion, QuestionSource } from '@/lib/types'
import {
  buildInterviewQuestions,
  INTERVIEW_COUNTS,
  INTERVIEW_DURATIONS,
  QUESTION_TOPICS,
  QUESTION_SOURCES,
  SOURCE_LABELS,
  questionGoalRange,
  type InterviewConfig,
} from '@/lib/interview'
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
import {
  Mic,
  Play,
  Send,
  ChevronLeft,
  ChevronRight,
  Check,
  X,
  Lightbulb,
  ExternalLink,
  Trophy,
  Flag,
  History,
  Trash2,
  RotateCcw,
} from 'lucide-react'

type View = 'setup' | 'session' | 'results'
type QuestionStatus = 'solved' | 'skipped' | null

const DIFFICULTY_COLORS: Record<string, string> = {
  Easy: 'text-green-500 border-green-500/40 bg-green-500/10',
  Medium: 'text-yellow-500 border-yellow-500/40 bg-yellow-500/10',
  Hard: 'text-red-500 border-red-500/40 bg-red-500/10',
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

export default function Interview() {
  const questionBank = useAppStore((s) => s.questionBank)
  const [view, setView] = useState<View>('setup')
  const [history, setHistory] = useState<MockInterviewSession[]>([])
  const [config, setConfig] = useState<InterviewConfig>({
    title: '',
    difficulty: 'Mixed',
    topic: 'All Topics',
    count: 10,
    duration: 45,
  })
  const [result, setResult] = useState<Omit<MockInterviewSession, 'id' | 'created_at'> | null>(null)
  const [detail, setDetail] = useState<MockInterviewSession | null>(null)

  // Live session state
  const [questions, setQuestions] = useState<MockQuestion[]>([])
  const [statuses, setStatuses] = useState<QuestionStatus[]>([])
  const [notes, setNotes] = useState<Record<string, string>>({})
  const [current, setCurrent] = useState(0)
  const [sourceFilter, setSourceFilter] = useState<'' | QuestionSource>('')
  const [postedMsg, setPostedMsg] = useState<string | null>(null)
  const startTsRef = useRef(0)

  const loadHistory = useCallback(async () => {
    try {
      setHistory(await dbApi.loadMockInterviews())
    } catch {}
  }, [])

  useEffect(() => {
    loadHistory()
  }, [loadHistory])

  const startInterview = () => {
    const picked = buildInterviewQuestions(questionBank, config, sourceFilter || null)
    if (picked.length === 0) return
    setQuestions(picked)
    setStatuses(picked.map(() => null))
    setNotes({})
    setCurrent(0)
    startTsRef.current = Date.now()
    setView('session')
  }

  const finishInterview = (autoEnd = false) => {
    const total = questions.length
    const solved = statuses.filter((s) => s === 'solved').length
    const skipped = statuses.filter((s) => s === 'skipped').length
    const durationSec = config.duration * 60
    const elapsed = autoEnd ? durationSec : Math.min(durationSec, Math.floor((Date.now() - startTsRef.current) / 1000))
    const score = total > 0 ? Math.round((solved / total) * 100) : 0

    const session: Omit<MockInterviewSession, 'id' | 'created_at'> = {
      title: config.title.trim() || 'Mock Interview',
      difficulty: config.difficulty,
      topic: config.topic,
      total_questions: total,
      solved,
      skipped,
      duration_minutes: config.duration,
      elapsed_seconds: elapsed,
      questions,
      notes,
      results: statuses.map((s) => s ?? null),
      score,
      status: 'completed',
      started_at: new Date(startTsRef.current).toISOString(),
      ended_at: new Date().toISOString(),
    }
    setResult(session)
    setView('results')
  }

  const saveResult = async () => {
    if (!result) return
    try {
      await dbApi.addMockInterview(result)
      setResult(null)
      setView('setup')
      loadHistory()
    } catch {}
  }

  const discardResult = () => {
    setResult(null)
    setView('setup')
  }

  const handleStatus = (status: Exclude<QuestionStatus, null>) => {
    setStatuses((prev) => {
      const next = [...prev]
      next[current] = status
      return next
    })
    if (current < questions.length - 1) {
      setCurrent((c) => c + 1)
    }
  }

  const noteFor = (id: string): string => notes[id] ?? ''

  const postToPlanner = async () => {
    const picked = buildInterviewQuestions(questionBank, config, sourceFilter || null)
    if (picked.length === 0) return
    const title = `Interview practice${config.topic !== 'All Topics' ? ` · ${config.topic}` : ''}`
    const range = questionGoalRange()
    try {
      await dbApi.addGoal({
        title,
        type: 'weekly',
        category: 'questions',
        target_value: picked.length,
        current_value: 0,
        unit: 'questions',
        start_date: range.start,
        end_date: range.end,
        status: 'active',
        questions: picked,
      })
      setPostedMsg(`${picked.length} questions posted to Planner — solve them in mock interviews to complete the goal.`)
      window.setTimeout(() => setPostedMsg(null), 6000)
    } catch {
      setPostedMsg(null)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Mock Interview</h2>
        <p className="text-muted-foreground mt-1">
          Timed practice sessions with curated coding questions, notes, and scoring
        </p>
      </div>

      {view === 'setup' && (
        <>
          {/* Config */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Mic className="h-5 w-5 text-primary" />
                <CardTitle className="text-sm font-medium">New Interview</CardTitle>
              </div>
              <CardDescription className="text-xs">
                Configure your session — pick a difficulty, a topic, and a time limit.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
                <div className="space-y-1.5">
                  <Label className="text-xs">Session title</Label>
                  <Input
                    placeholder="e.g. Google warm-up"
                    value={config.title}
                    onChange={(e) => setConfig({ ...config, title: e.target.value })}
                    className="h-9 text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Difficulty</Label>
                  <Select
                    value={config.difficulty}
                    onValueChange={(v) => setConfig({ ...config, difficulty: v as InterviewConfig['difficulty'] })}
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
                  <Select
                    value={config.topic}
                    onValueChange={(v) => setConfig({ ...config, topic: v })}
                  >
                    <SelectTrigger className="h-9 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {QUESTION_TOPICS.map((t) => (
                        <SelectItem key={t} value={t}>
                          {t}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
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
                      {INTERVIEW_COUNTS.map((c) => (
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
                      {INTERVIEW_DURATIONS.map((d) => (
                        <SelectItem key={d} value={String(d)}>
                          {d} min
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-xs text-muted-foreground mr-1">Source:</span>
                {(['', ...QUESTION_SOURCES] as const).map((s) => (
                  <button
                    key={s || 'all'}
                    onClick={() => setSourceFilter(s as '' | QuestionSource)}
                    className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                      sourceFilter === s
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-input bg-background text-foreground hover:bg-accent'
                    }`}
                  >
                    {s === '' ? 'All sources' : SOURCE_LABELS[s]}
                  </button>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Button className="gap-2" onClick={startInterview} disabled={config.count < 1}>
                  <Play className="h-4 w-4" />
                  Start Interview
                </Button>
                <Button
                  variant="outline"
                  className="gap-2"
                  onClick={postToPlanner}
                  disabled={config.count < 1}
                >
                  <Send className="h-4 w-4" />
                  P'o'P
                </Button>
                {postedMsg && (
                  <span className="flex items-center gap-1.5 text-sm text-green-500">
                    <Check className="h-4 w-4" />
                    {postedMsg}
                  </span>
                )}
              </div>
            </CardContent>
          </Card>

          {/* History */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div className="flex items-center gap-2">
                <History className="h-5 w-5 text-primary" />
                <CardTitle className="text-sm font-medium">Interview History</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              {history.length === 0 ? (
                <p className="text-center py-6 text-sm text-muted-foreground">
                  No interviews yet. Complete your first session to see the results here.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-xs text-muted-foreground">
                        <th className="pb-2 pr-2 font-medium">Title</th>
                        <th className="pb-2 pr-2 font-medium">Difficulty</th>
                        <th className="pb-2 pr-2 font-medium">Questions</th>
                        <th className="pb-2 pr-2 font-medium">Score</th>
                        <th className="pb-2 pr-2 font-medium">Date</th>
                        <th className="pb-2 font-medium" />
                      </tr>
                    </thead>
                    <tbody>
                      {history.map((s) => (
                        <tr key={s.id} className="border-t">
                          <td className="py-2 pr-2 font-medium">{s.title}</td>
                          <td className="py-2 pr-2">
                            <Badge variant="outline" className={DIFFICULTY_COLORS[s.difficulty]}>
                              {s.difficulty}
                            </Badge>
                          </td>
                          <td className="py-2 pr-2 text-muted-foreground">
                            {s.solved}/{s.total_questions} solved
                          </td>
                          <td className="py-2 pr-2">
                            <span className={s.score >= 50 ? 'text-green-500' : 'text-red-500'}>
                              {s.score}%
                            </span>
                          </td>
                          <td className="py-2 pr-2 text-muted-foreground">{formatDate(s.ended_at)}</td>
                          <td className="py-2 text-right">
                            <div className="flex justify-end gap-1">
                              <Button size="icon" variant="ghost" title="View details" onClick={() => setDetail(s)}>
                                <ChevronRight className="h-4 w-4" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                title="Delete"
                                onClick={async () => {
                                  await dbApi.deleteMockInterview(s.id)
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
        </>
      )}

      {view === 'session' && questions.length > 0 && (
        <Card className="h-full flex flex-col">
          <CardHeader className="pb-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="min-w-0">
                <CardTitle className="text-base">
                  {config.title.trim() || 'Mock Interview'}
                </CardTitle>
                <CardDescription className="text-xs">
                  Question {current + 1} of {questions.length}
                </CardDescription>
              </div>
              <div className="flex items-center gap-3">
                <SessionTimer duration={config.duration} onEnd={() => finishInterview(true)} />
                <Button variant="destructive" size="sm" className="gap-1.5" onClick={() => finishInterview(false)}>
                  <Flag className="h-3.5 w-3.5" />
                  End
                </Button>
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5 pt-2">
              {statuses.map((s, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className={`h-7 w-7 rounded-md text-xs font-semibold transition-colors ${
                    i === current
                      ? 'bg-primary text-primary-foreground'
                      : s === 'solved'
                        ? 'bg-green-500/20 text-green-500 hover:bg-green-500/30'
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
            {(() => {
              const q = questions[current]
              const status = statuses[current]
              return (
                <>
                  <div className="rounded-lg border p-4 space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="outline" className={DIFFICULTY_COLORS[q.difficulty]}>
                        {q.difficulty}
                      </Badge>
                      <Badge variant="secondary">{q.topic}</Badge>
                      {q.source && (
                        <Badge variant="outline" className="text-muted-foreground">
                          {SOURCE_LABELS[q.source]}
                        </Badge>
                      )}
                      {status === 'solved' && (
                        <Badge variant="easy" className="ml-auto">Solved</Badge>
                      )}
                      {status === 'skipped' && (
                        <Badge variant="hard" className="ml-auto">Skipped</Badge>
                      )}
                    </div>
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="text-lg font-semibold">{q.title}</h3>
                      <Button
                        size="sm"
                        variant="outline"
                        className="shrink-0 gap-1.5"
                        onClick={() => window.open(q.url, '_blank', 'noopener,noreferrer')}
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        Open
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground">{q.description}</p>
                    <details className="rounded-md border bg-muted/40 p-3">
                      <summary className="flex cursor-pointer items-center gap-1.5 text-xs font-medium text-muted-foreground">
                        <Lightbulb className="h-3.5 w-3.5 text-yellow-500" />
                        Need a hint?
                      </summary>
                      <p className="mt-2 text-sm">{q.hint}</p>
                    </details>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs">Notes for this question</Label>
                    <textarea
                      value={noteFor(q.id)}
                      onChange={(e) => setNotes((prev) => ({ ...prev, [q.id]: e.target.value }))}
                      placeholder="Write your approach, code sketch, or observations..."
                      className="min-h-[110px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    />
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
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
                    <div className="flex gap-2">
                      <Button size="sm" variant="secondary" className="gap-1.5" onClick={() => handleStatus('skipped')}>
                        <X className="h-4 w-4" />
                        Skip
                      </Button>
                      <Button size="sm" className="gap-1.5" onClick={() => handleStatus('solved')}>
                        <Check className="h-4 w-4" />
                        Solved
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-1.5"
                        onClick={() => setCurrent((c) => Math.min(questions.length - 1, c + 1))}
                        disabled={current === questions.length - 1}
                      >
                        Next
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </>
              )
            })()}
          </CardContent>
        </Card>
      )}

      {view === 'results' && result && (
        <Card>
          <CardContent className="space-y-5 pt-6">
            <div className="flex flex-col items-center gap-3 text-center">
              <div
                className={`flex h-28 w-28 items-center justify-center rounded-full border-4 ${
                  result.score >= 50 ? 'border-green-500 text-green-500' : 'border-red-500 text-red-500'
                }`}
              >
                <span className="text-3xl font-bold">{result.score}%</span>
              </div>
              <div>
                <div className="flex items-center justify-center gap-2">
                  <Trophy className="h-5 w-5 text-yellow-500" />
                  <h3 className="text-lg font-semibold">
                    {result.score >= 80 ? 'Excellent! Strong interview round.' : result.score >= 50 ? 'Good effort — keep polishing.' : 'Tough one — review and try again.'}
                  </h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  {result.solved} solved · {result.skipped} skipped · {result.total_questions} total · used {formatClock(result.elapsed_seconds)} of {result.duration_minutes} min
                </p>
              </div>
            </div>

            <div className="rounded-lg border">
              <div className="max-h-[320px] overflow-y-auto">
                {result.questions.map((q, i) => {
                  const st = statuses[i]
                  return (
                    <div key={q.id} className="border-b p-4 last:border-b-0">
                      <div className="flex items-center gap-2">
                        {st === 'solved' ? (
                          <Check className="h-4 w-4 shrink-0 text-green-500" />
                        ) : st === 'skipped' ? (
                          <X className="h-4 w-4 shrink-0 text-red-500" />
                        ) : (
                          <span className="h-4 w-4 shrink-0 rounded-full border border-muted-foreground/50" />
                        )}
                        <span className="font-medium">{q.title}</span>
                        {q.source && (
                          <span className="text-[10px] text-muted-foreground">({SOURCE_LABELS[q.source]})</span>
                        )}
                        <Badge variant="outline" className={`ml-auto ${DIFFICULTY_COLORS[q.difficulty]}`}>
                          {q.difficulty}
                        </Badge>
                      </div>
                      <div className="mt-2 flex items-center justify-between gap-2">
                        <p className="text-xs text-muted-foreground capitalize">{q.topic}</p>
                        <a
                          href="#"
                          onClick={(e) => { e.preventDefault(); window.open(q.url, '_blank', 'noopener,noreferrer') }}
                          className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                        >
                          Revisit <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                      {notes[q.id]?.trim() && (
                        <p className="mt-2 rounded-md bg-muted/40 p-2 text-xs text-muted-foreground whitespace-pre-wrap">
                          {notes[q.id]}
                        </p>
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
              <Button className="gap-1.5" onClick={saveResult}>
                <Check className="h-4 w-4" />
                Save to History
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

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
                const result = detail.results?.[i]
                const solved = result === 'solved'
                const skipped = result === 'skipped'
                const note = detail.notes?.[q.id]
                return (
                  <div key={q.id} className="rounded-lg border p-3">
                    <div className="flex items-center gap-2">
                      {solved ? (
                        <Check className="h-4 w-4 shrink-0 text-green-500" />
                      ) : skipped ? (
                        <X className="h-4 w-4 shrink-0 text-red-500" />
                      ) : (
                        <span className="h-4 w-4 shrink-0 rounded-full border border-muted-foreground/50" />
                      )}
                      <span className="text-sm font-medium">{q.title}</span>
                      {q.source && (
                        <span className="text-[10px] text-muted-foreground">({SOURCE_LABELS[q.source]})</span>
                      )}
                      <Badge variant="outline" className={`ml-auto ${DIFFICULTY_COLORS[q.difficulty]}`}>
                        {q.difficulty}
                      </Badge>
                    </div>
                    {note?.trim() && (
                      <p className="mt-2 rounded-md bg-muted/40 p-2 text-xs whitespace-pre-wrap">{note}</p>
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