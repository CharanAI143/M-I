import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatClock } from '@/lib/session-utils'
import { DIFFICULTY_COLORS } from '@/lib/session-utils'
import { SOURCE_LABELS } from '@/lib/interview'
import type { MockInterviewSession } from '@/lib/types'
import type { QuestionStatus } from './interview-utils'
import { Check, ExternalLink, RotateCcw, Trophy, X } from 'lucide-react'

interface InterviewResultsProps {
  result: Omit<MockInterviewSession, 'id' | 'created_at'>
  statuses: QuestionStatus[]
  notes: Record<string, string>
  onSave: () => void
  onDiscard: () => void
}

export function InterviewResults({ result, statuses, notes, onSave, onDiscard }: InterviewResultsProps) {
  return (
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
          <Button variant="outline" className="gap-1.5" onClick={onDiscard}>
            <RotateCcw className="h-4 w-4" />
            Discard
          </Button>
          <Button className="gap-1.5" onClick={onSave}>
            <Check className="h-4 w-4" />
            Save to History
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}