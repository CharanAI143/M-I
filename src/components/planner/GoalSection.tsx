import { useState } from 'react'
import { dbApi } from '@/lib/db'
import type { Goal } from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Check, Circle, ExternalLink, Pencil, Plus, Target, Trash2 } from 'lucide-react'
import { GoalDialog } from './GoalDialog'

interface GoalSectionProps {
  goals: Goal[]
  goalProgress: (g: Goal) => number
  solvedQuestionIds: Set<string>
  onReload: () => void
}

export function GoalSection({ goals, goalProgress, solvedQuestionIds, onReload }: GoalSectionProps) {
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