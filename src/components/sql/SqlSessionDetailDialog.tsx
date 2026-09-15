import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { DIFFICULTY_COLORS } from '@/lib/session-utils'
import type { SqlPracticeSession } from '@/lib/types'
import { Check, X } from 'lucide-react'

interface SqlSessionDetailDialogProps {
  detail: SqlPracticeSession | null
  onClose: () => void
}

export function SqlSessionDetailDialog({ detail, onClose }: SqlSessionDetailDialogProps) {
  return (
    <Dialog open={!!detail} onOpenChange={(open) => { if (!open) onClose() }}>
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
              const rs = detail.results?.[i]
              const answer = detail.answers?.[q.id]
              return (
                <div key={q.id} className="rounded-lg border p-3">
                  <div className="flex items-center gap-2">
                    {rs === 'solved' ? (
                      <Check className="h-4 w-4 shrink-0 text-green-500" />
                    ) : rs === 'wrong' ? (
                      <X className="h-4 w-4 shrink-0 text-orange-500" />
                    ) : rs === 'skipped' ? (
                      <X className="h-4 w-4 shrink-0 text-red-500" />
                    ) : (
                      <span className="h-4 w-4 shrink-0 rounded-full border border-muted-foreground/50" />
                    )}
                    <span className="text-sm font-medium">{q.title}</span>
                    <Badge variant="outline" className={`ml-auto ${DIFFICULTY_COLORS[q.difficulty]}`}>
                      {q.difficulty}
                    </Badge>
                  </div>
                  {answer?.trim() && (
                    <pre className="mt-2 rounded-md bg-muted/40 p-2 text-xs overflow-x-auto whitespace-pre-wrap">
                      {answer}
                    </pre>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}