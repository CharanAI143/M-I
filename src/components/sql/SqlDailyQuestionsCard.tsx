import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { DIFFICULTY_COLORS } from '@/lib/session-utils'
import type { SqlProblem } from '@/lib/types'
import { CheckCircle2, Circle, ListTodo, PlayCircle, Zap } from 'lucide-react'
import { problemById, type SqlTodo } from './sql-utils'

interface SqlDailyQuestionsCardProps {
  todos: SqlTodo[]
  todoDone: number
  todoTotal: number
  onToggle: (id: string) => void
  onRegenerate: () => void
  onPractice: (p: SqlProblem) => void
}

export function SqlDailyQuestionsCard({
  todos,
  todoDone,
  todoTotal,
  onToggle,
  onRegenerate,
  onPractice,
}: SqlDailyQuestionsCardProps) {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">Daily SQL Questions</CardTitle>
        <div className="flex items-center gap-1">
          {todoTotal > 0 && todoDone === todoTotal && (
            <Button
              size="sm"
              variant="outline"
              onClick={onRegenerate}
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
                      onClick={() => onToggle(t.id)}
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
                      onClick={() => onPractice(p)}
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
  )
}