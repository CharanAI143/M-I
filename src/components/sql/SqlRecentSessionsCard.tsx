import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { formatDate } from '@/lib/session-utils'
import type { SqlPracticeSession } from '@/lib/types'
import { ChevronRight as ChevronRightIcon, Play, RotateCcw, Trash2 } from 'lucide-react'

interface SqlRecentSessionsCardProps {
  history: SqlPracticeSession[]
  onRefresh: () => void
  onNewSession: () => void
  onViewDetail: (s: SqlPracticeSession) => void
  onDelete: (id: number) => void
}

export function SqlRecentSessionsCard({
  history,
  onRefresh,
  onNewSession,
  onViewDetail,
  onDelete,
}: SqlRecentSessionsCardProps) {
  return (
    <Card className="lg:col-span-2 flex flex-col h-full min-h-0">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">Recent Practice Sessions</CardTitle>
        <div className="flex items-center gap-1">
          <Button size="sm" variant="outline" onClick={onRefresh} title="Refresh sessions">
            <RotateCcw className="h-3.5 w-3.5" />
          </Button>
          <Button size="sm" className="gap-1.5" onClick={onNewSession}>
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
                        <Button size="icon" variant="ghost" title="View details" onClick={() => onViewDetail(s)}>
                          <ChevronRightIcon className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="ghost" title="Delete" onClick={() => onDelete(s.id)}>
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
  )
}