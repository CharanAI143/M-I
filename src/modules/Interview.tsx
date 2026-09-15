import { useCallback, useEffect, useRef, useState } from 'react'
import { dbApi } from '@/lib/db'
import { useAppStore } from '@/store'
import type { MockInterviewSession, MockQuestion, QuestionSource } from '@/lib/types'
import {
  buildInterviewQuestions,
  questionGoalRange,
  type InterviewConfig,
} from '@/lib/interview'
import { InterviewSetup } from '@/components/interview/InterviewSetup'
import { InterviewHistory } from '@/components/interview/InterviewHistory'
import { InterviewSession } from '@/components/interview/InterviewSession'
import { InterviewResults } from '@/components/interview/InterviewResults'
import { InterviewDetailDialog } from '@/components/interview/InterviewDetailDialog'
import type { QuestionStatus } from '@/components/interview/interview-utils'

type View = 'setup' | 'session' | 'results'

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
          <InterviewSetup
            config={config}
            onConfigChange={(patch) => setConfig((prev) => ({ ...prev, ...patch }))}
            sourceFilter={sourceFilter}
            onSourceFilterChange={setSourceFilter}
            postedMsg={postedMsg}
            onStart={startInterview}
            onPostToPlanner={postToPlanner}
          />
          <InterviewHistory
            history={history}
            onView={setDetail}
            onDeleted={loadHistory}
          />
        </>
      )}

      {view === 'session' && (
        <InterviewSession
          title={config.title}
          duration={config.duration}
          questions={questions}
          statuses={statuses}
          notes={notes}
          current={current}
          onSetCurrent={setCurrent}
          onStatus={handleStatus}
          onNotesChange={(id, text) => setNotes((prev) => ({ ...prev, [id]: text }))}
          onFinish={finishInterview}
        />
      )}

      {view === 'results' && result && (
        <InterviewResults
          result={result}
          statuses={statuses}
          notes={notes}
          onSave={saveResult}
          onDiscard={discardResult}
        />
      )}

      <InterviewDetailDialog
        detail={detail}
        onClose={() => setDetail(null)}
      />
    </div>
  )
}