import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { SessionTimer } from '@/components/SessionTimer'
import { DIFFICULTY_COLORS } from '@/lib/session-utils'
import type { SqlProblem, SqlResultStatus } from '@/lib/types'
import type { SqlQueryResult } from '@/lib/sqlRunner'
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Database,
  Flag,
  Lightbulb,
  Loader2,
  PlayCircle,
  Terminal,
  X,
} from 'lucide-react'

interface SqlSessionProps {
  question: SqlProblem
  index: number
  total: number
  results: SqlResultStatus[]
  duration: number
  running: boolean
  output: SqlQueryResult | null
  checkResult: { passed: boolean; mismatch?: string } | null
  answer: string
  showSchema: boolean
  onNav: (i: number) => void
  onTimerEnd: () => void
  onEnd: () => void
  onExit: () => void
  onRun: () => void
  onCheck: () => void
  onAnswerChange: (v: string) => void
  setShowSchema: (v: boolean) => void
  onStatus: (s: Exclude<SqlResultStatus, null>) => void
}

export function SqlSession({
  question,
  index,
  total,
  results,
  duration,
  running,
  output,
  checkResult,
  answer,
  showSchema,
  onNav,
  onTimerEnd,
  onEnd,
  onExit,
  onRun,
  onCheck,
  onAnswerChange,
  setShowSchema,
  onStatus,
}: SqlSessionProps) {
  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <CardTitle className="text-base">{question.title}</CardTitle>
            <CardDescription className="text-xs">
              Question {index + 1} of {total}
            </CardDescription>
          </div>
          <div className="flex items-center gap-3">
            <SessionTimer duration={duration} onEnd={onTimerEnd} />
            <Button variant="destructive" size="sm" className="gap-1.5" onClick={onEnd}>
              <Flag className="h-3.5 w-3.5" />
              End
            </Button>
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5 pt-2">
          {results.map((s, i) => (
            <button
              key={i}
              onClick={() => onNav(i)}
              className={`h-7 w-7 rounded-md text-xs font-semibold transition-colors ${
                i === index
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
            <Badge variant="outline" className={DIFFICULTY_COLORS[question.difficulty]}>
              {question.difficulty}
            </Badge>
            <Badge variant="secondary">{question.topic}</Badge>
            {results[index] === 'solved' && <Badge variant="easy" className="ml-auto">Solved</Badge>}
            {results[index] === 'wrong' && <Badge variant="hard" className="ml-auto">Needs Work</Badge>}
            {results[index] === 'skipped' && <Badge variant="hard" className="ml-auto">Skipped</Badge>}
          </div>
          <p className="text-sm text-muted-foreground">{question.description}</p>
          <details className="rounded-md border bg-muted/40 p-3">
            <summary className="flex cursor-pointer items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <Lightbulb className="h-3.5 w-3.5 text-yellow-500" />
              Need a hint?
            </summary>
            <p className="mt-2 text-sm">{question.hint}</p>
          </details>
          <button
            type="button"
            onClick={() => setShowSchema(!showSchema)}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
          >
            <Database className="h-3.5 w-3.5" />
            {showSchema ? 'Hide schema' : 'Show schema'}
          </button>
          {showSchema && (
            <pre className="overflow-x-auto rounded-md bg-muted/40 p-3 text-xs leading-relaxed text-muted-foreground">
              {question.schema.trim()}
            </pre>
          )}
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label className="text-xs">Write your query</Label>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" className="gap-1.5" onClick={onRun} disabled={running}>
                {running ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <PlayCircle className="h-3.5 w-3.5" />}
                Run
              </Button>
              <Button size="sm" className="gap-1.5" onClick={onCheck} disabled={running}>
                {running ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                Check Answer
              </Button>
            </div>
          </div>
          <textarea
            value={answer}
            onChange={(e) => onAnswerChange(e.target.value)}
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
            <Button variant="outline" size="sm" className="gap-1.5" onClick={onExit}>
              <ChevronLeft className="h-4 w-4" />
              Exit
            </Button>
            <Button size="sm" variant="outline" className="gap-1.5" onClick={() => onNav(Math.max(0, index - 1))} disabled={index === 0}>
              <ChevronLeft className="h-4 w-4" />
              Prev
            </Button>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="secondary" className="gap-1.5" onClick={() => onStatus('skipped')}>
              <X className="h-4 w-4" />
              Skip
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="gap-1.5 text-orange-400 hover:text-orange-300"
              onClick={() => onStatus('wrong')}
              disabled={!output || !!output.error}
              title="Mark as attempted but not correct yet"
            >
              Needs Work
            </Button>
            <Button
              size="sm"
              className="gap-1.5"
              onClick={() => onStatus('solved')}
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
              onClick={() => onNav(Math.min(total - 1, index + 1))}
              disabled={index === total - 1}
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