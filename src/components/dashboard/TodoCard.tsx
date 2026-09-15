import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import type { TodoItem } from '@/lib/types'
import { ListTodo, Loader2, Zap } from 'lucide-react'

interface TodoCardProps {
  todos: TodoItem[]
  picking: boolean
  pickError: string
  isBeginner: boolean
  onPickFresh: () => void
}

export function TodoCard({ todos, picking, pickError, isBeginner, onPickFresh }: TodoCardProps) {
  const todoDone = todos.filter((t) => t.done).length
  const todoTotal = todos.length

  const openUrl = (url?: string) => {
    if (url) window.open(url, '_blank', 'noopener,noreferrer')
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">Todo Questions</CardTitle>
        <div className="flex items-center gap-1">
          {todoTotal > 0 && todoDone === todoTotal && (
            <Button
              size="sm"
              variant="outline"
              onClick={onPickFresh}
              disabled={picking}
              title="All done! Pick a fresh set to keep your streak going."
            >
              {picking ? <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" /> : <Zap className="h-3.5 w-3.5 mr-1" />}
              {isBeginner ? "Pick 5" : "Pick 6"}
            </Button>
          )}
          <ListTodo className="h-5 w-5 text-blue-500" />
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col space-y-3">
        {pickError && <p className="text-center text-xs text-red-400">{pickError}</p>}

        {/* List */}
        {todoTotal === 0 ? (
          <p className="text-center text-xs text-muted-foreground py-4">
            Generating today's questions…
          </p>
        ) : (
          <div className="space-y-1 max-h-[160px] overflow-y-auto">
            {todos.map((t) => (
              <div key={t.id} className="rounded-md border">
                <div className="flex items-center px-2.5 py-1.5">
                  <a
                    href="#"
                    onClick={(e) => { e.preventDefault(); openUrl(t.url) }}
                    className={`text-sm truncate hover:underline ${t.done ? 'line-through text-muted-foreground' : ''}`}
                  >
                    {t.text}
                  </a>
                </div>
                {!t.done && t.tags && t.tags.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1 px-2.5 pb-1.5">
                    <span className="text-[10px] text-muted-foreground">Learn:</span>
                    {t.tags.map((tag) => {
                      const href = t.platform === 'codeforces'
                        ? `https://codeforces.com/problemset?tags=${encodeURIComponent(tag)}`
                        : `https://leetcode.com/tag/${tag}/`
                      return (
                        <a
                          key={tag}
                          href="#"
                          onClick={(e) => { e.preventDefault(); window.open(href, '_blank', 'noopener,noreferrer') }}
                          className="rounded-full bg-secondary px-2 py-0.5 text-[11px] text-foreground/80 hover:bg-secondary/70 hover:underline"
                        >
                          {tag}
                        </a>
                      )
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Summary */}
        {todoTotal > 0 && (
          <div className="text-center text-xs text-muted-foreground">
            {todoDone}/{todoTotal} completed
          </div>
        )}
      </CardContent>
    </Card>
  )
}