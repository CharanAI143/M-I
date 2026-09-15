import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import type { Ladder } from '@/lib/types'
import { cfSolveKey } from '@/lib/codeforces'
import { CheckCircle2, ChevronDown, Circle, ExternalLink, List } from 'lucide-react'

interface LaddersCardProps {
  ladders: (Ladder & { solvedCount: number })[]
  solvedKeys: Set<string>
  onManage: () => void
}

export function LaddersCard({ ladders, solvedKeys, onManage }: LaddersCardProps) {
  return (
    <Card className="lg:col-span-1 flex flex-col h-full min-h-0">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">Your Ladders</CardTitle>
        <Button size="icon" variant="ghost" onClick={onManage} title="Manage ladders">
          <List className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="pt-0">
        {ladders.length === 0 ? (
          <p className="text-center py-4 text-sm text-muted-foreground">
            No ladders yet. Add one from Profiles.
          </p>
        ) : (
          <div className="space-y-2">
              {ladders.map((l) => {
                const pct = l.problems.length ? Math.round((l.solvedCount / l.problems.length) * 100) : 0
                return (
                  <div key={l.id} className="rounded-lg border p-2.5 space-y-2">
                    <div className="flex items-center gap-2">
                      <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate">{l.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {l.solvedCount} / {l.problems.length} solved
                        </p>
                      </div>
                      <span className="text-xs text-muted-foreground shrink-0 w-9 text-right">{pct}%</span>
                    </div>
                    <Progress value={pct} className="h-1.5" indicatorClassName="bg-primary" />
                    <div className="rounded-md border">
                      <div className="p-1 max-h-[400px] overflow-y-auto overflow-x-hidden">
                        {l.problems.map((p) => {
                          const isSolved = solvedKeys.has(cfSolveKey(p.contestId, p.index))
                          return (
                            <a
                              key={`${p.contestId}${p.index}`}
                              href="#"
                              onClick={(e) => { e.preventDefault(); window.open(p.url, '_blank', 'noopener,noreferrer') }}
                              className="flex items-center gap-2 rounded px-2 py-1 text-sm hover:bg-accent"
                            >
                              {isSolved ? (
                                <CheckCircle2 className="h-4 w-4 shrink-0 text-green-500" />
                              ) : (
                                <Circle className="h-4 w-4 shrink-0 text-muted-foreground" />
                              )}
                              <span className="truncate flex-1">{p.name}</span>
                              <span className="shrink-0 text-xs text-muted-foreground">{p.rating}</span>
                              <ExternalLink className="h-3 w-3 shrink-0 text-muted-foreground" />
                            </a>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                )
              })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}