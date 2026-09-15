import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { DIFFICULTY_COLORS } from '@/lib/session-utils'
import { SOURCE_LABELS } from '@/lib/interview'
import type { MockInterviewSession } from '@/lib/types'
import { Check, X } from 'lucide-react'

interface InterviewDetailDialogProps {
  detail: MockInterviewSession | null
  onClose: () => void
}

export function InterviewDetailDialog({ detail, onClose }: InterviewDetailDialogProps) {
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
              const result = detail.results?.[i]
              const solved = result === 'solved'
              const skipped = result === 'skipped'
              const note = detail.notes?.[q.id]
              return (
                <div key={q.id} className="rounded-lg border p-3">
                  <div className="flex items-center gap-2">
                    {solved ? (
                      <Check className="h-4 w-4 shrink-0 text-green-500" />
                    ) : skipped ? (
                      <X className="h-4 w-4 shrink-0 text-red-500" />
                    ) : (
                      <span className="h-4 w-4 shrink-0 rounded-full border border-muted-foreground/50" />
                    )}
                    <span className="text-sm font-medium">{q.title}</span>
                    {q.source && (
                      <span className="text-[10px] text-muted-foreground">({SOURCE_LABELS[q.source]})</span>
                    )}
                    <Badge variant="outline" className={`ml-auto ${DIFFICULTY_COLORS[q.difficulty]}`}>
                      {q.difficulty}
                    </Badge>
                  </div>
                  {note?.trim() && (
                    <p className="mt-2 rounded-md bg-muted/40 p-2 text-xs whitespace-pre-wrap">{note}</p>
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