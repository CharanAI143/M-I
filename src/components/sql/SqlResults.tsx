import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { DIFFICULTY_COLORS, formatClock } from '@/lib/session-utils'
import type { SqlPracticeSession, SqlResultStatus } from '@/lib/types'
import { Check, Database, RotateCcw, X } from 'lucide-react'

interface SqlResultsProps {
  saveResult: Omit<SqlPracticeSession, 'id' | 'created_at'>
  results: SqlResultStatus[]
  answers: Record<string, string>
  onDiscard: () => void
  onSave: () => void
}

export function SqlResults({ saveResult, results, answers, onDiscard, onSave }: SqlResultsProps) {
  return (
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
          <Button variant="outline" className="gap-1.5" onClick={onDiscard}>
            <RotateCcw className="h-4 w-4" />
            Discard
          </Button>
          <Button className="gap-1.5" onClick={onSave}>
            <Check className="h-4 w-4" />
            Save to Dashboard
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}