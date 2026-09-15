import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { SessionTimer } from '@/components/SessionTimer'
import { DIFFICULTY_COLORS } from '@/lib/session-utils'
import { SOURCE_LABELS } from '@/lib/interview'
import type { MockQuestion } from '@/lib/types'
import type { QuestionStatus } from './interview-utils'
import { Check, ChevronLeft, ChevronRight, ExternalLink, Flag, Lightbulb, X } from 'lucide-react'

interface InterviewSessionProps {
  title: string
  duration: number
  questions: MockQuestion[]
  statuses: QuestionStatus[]
  notes: Record<string, string>
  current: number
  onSetCurrent: (i: number) => void
  onStatus: (s: 'solved' | 'skipped') => void
  onNotesChange: (id: string, text: string) => void
  onFinish: (autoEnd: boolean) => void
}

export function InterviewSession({
  title,
  duration,
  questions,
  statuses,
  notes,
  current,
  onSetCurrent,
  onStatus,
  onNotesChange,
  onFinish,
}: InterviewSessionProps) {
  if (questions.length === 0) return null

  const q = questions[current]
  const status = statuses[current]
  const noteFor = (id: string): string => notes[id] ?? ''

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <CardTitle className="text-base">
              {title.trim() || 'Mock Interview'}
            </CardTitle>
            <CardDescription className="text-xs">
              Question {current + 1} of {questions.length}
            </CardDescription>
          </div>
          <div className="flex items-center gap-3">
            <SessionTimer duration={duration} onEnd={() => onFinish(true)} />
            <Button variant="destructive" size="sm" className="gap-1.5" onClick={() => onFinish(false)}>
              <Flag className="h-3.5 w-3.5" />
              End
            </Button>
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5 pt-2">
          {statuses.map((s, i) => (
            <button
              key={i}
              onClick={() => onSetCurrent(i)}
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
            onChange={(e) => onNotesChange(q.id, e.target.value)}
            placeholder="Write your approach, code sketch, or observations..."
            className="min-h-[110px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
          <Button
            size="sm"
            variant="outline"
            className="gap-1.5"
            onClick={() => onSetCurrent(Math.max(0, current - 1))}
            disabled={current === 0}
          >
            <ChevronLeft className="h-4 w-4" />
            Prev
          </Button>
          <div className="flex gap-2">
            <Button size="sm" variant="secondary" className="gap-1.5" onClick={() => onStatus('skipped')}>
              <X className="h-4 w-4" />
              Skip
            </Button>
            <Button size="sm" className="gap-1.5" onClick={() => onStatus('solved')}>
              <Check className="h-4 w-4" />
              Solved
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="gap-1.5"
              onClick={() => onSetCurrent(Math.min(questions.length - 1, current + 1))}
              disabled={current === questions.length - 1}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}