import { dbApi } from '@/lib/db'
import type { MockInterviewSession } from '@/lib/types'
import { formatDate } from '@/lib/session-utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ChevronRight, History, Trash2 } from 'lucide-react'
import { DIFFICULTY_COLORS } from '@/lib/session-utils'

interface InterviewHistoryProps {
  history: MockInterviewSession[]
  onView: (s: MockInterviewSession) => void
  onDeleted: () => void
}

export function InterviewHistory({ history, onView, onDeleted }: InterviewHistoryProps) {
  return (
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
                        <Button size="icon" variant="ghost" title="View details" onClick={() => onView(s)}>
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          title="Delete"
                          onClick={async () => {
                            await dbApi.deleteMockInterview(s.id)
                            onDeleted()
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
  )
}