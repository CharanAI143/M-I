import { useCallback, useEffect, useState } from 'react'
import { dbApi } from '@/lib/db'
import { CF_LADDERS, fetchLadderProblems } from '@/lib/ladders'
import { fetchCodeforcesSolved, cfSolveKey } from '@/lib/codeforces'
import type { Ladder } from '@/lib/types'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Loader2, Plus, Trash2, ExternalLink, CheckCircle2, Circle, ChevronDown, ChevronRight } from 'lucide-react'

interface LadderEntry extends Ladder {
  solvedCount: number
}

interface LaddersDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  handle: string
}

export function LaddersDialog({ open, onOpenChange, handle }: LaddersDialogProps) {
  const [entries, setEntries] = useState<LadderEntry[]>([])
  const [solved, setSolved] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(false)
  const [adding, setAdding] = useState(false)
  const [selectedId, setSelectedId] = useState(CF_LADDERS[0]?.id ?? '')
  const [error, setError] = useState('')
  const [expandedId, setExpandedId] = useState<number | null>(null)

  const refresh = useCallback(async () => {
    if (!handle) return
    setLoading(true)
    setError('')
    try {
      const ladders = await dbApi.loadLadders(handle)
      let solvedKeys = new Set<string>()
      try {
        const s = await fetchCodeforcesSolved(handle)
        solvedKeys = s.keys
      } catch {
        // ignore solve-set failures; show ladders with 0 solved
      }
      setSolved(solvedKeys)
      const enhanced: LadderEntry[] = ladders.map((l) => ({
        ...l,
        solvedCount: l.problems.filter((p) => solvedKeys.has(cfSolveKey(p.contestId, p.index))).length,
      }))
      setEntries(enhanced)
    } catch (e) {
      console.error('Failed to load ladders:', e)
      setError('Failed to load ladders.')
    } finally {
      setLoading(false)
    }
  }, [handle])

  useEffect(() => {
    if (open) refresh()
  }, [open, refresh])

  const handleAdd = async () => {
    const def = CF_LADDERS.find((d) => d.id === selectedId)
    if (!def || !handle) return
    setAdding(true)
    setError('')
    try {
      const duplicate = entries.some((l) => l.name === def.name)
      if (duplicate) {
        setError('This ladder is already added.')
        return
      }
      const problems = await fetchLadderProblems(def)
      await dbApi.addLadder({
        platform: 'codeforces',
        handle,
        name: def.name,
        min_rating: def.minRating,
        max_rating: def.maxRating,
        problems,
      })
      await refresh()
    } catch (e) {
      console.error('Failed to add ladder:', e)
      setError('Failed to add ladder. Please try again.')
    } finally {
      setAdding(false)
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await dbApi.deleteLadder(id)
      await refresh()
    } catch (e) {
      console.error('Failed to delete ladder:', e)
    }
  }

  const toggleExpand = async (id: number) => {
    if (expandedId === id) {
      setExpandedId(null)
    } else {
      setExpandedId(id)
      await dbApi.touchLadder(id)
      await refresh()
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Codeforces Ladders</DialogTitle>
          <DialogDescription>
            {handle
              ? `Track your progress across curated problem ladders for @${handle}.`
              : 'Enter your Codeforces username and sync first to add ladders.'}
          </DialogDescription>
        </DialogHeader>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <div className="space-y-4">
          {!handle && (
            <p className="text-sm text-muted-foreground">No Codeforces handle linked yet.</p>
          )}

          {handle && (
            <div className="flex flex-wrap items-end gap-2">
              <div className="flex-1 space-y-1.5">
                <Select value={selectedId} onValueChange={setSelectedId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a ladder" />
                  </SelectTrigger>
                  <SelectContent>
                    {CF_LADDERS.map((def) => (
                      <SelectItem key={def.id} value={def.id}>
                        {def.name} · {def.count} problems
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button size="sm" onClick={handleAdd} disabled={adding || !selectedId}>
                {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                <span className="ml-1">Add Ladder</span>
              </Button>
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-10 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin mr-2" /> Loading ladders...
            </div>
          ) : entries.length === 0 ? (
            <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
              No ladders added yet. Pick one above to get started.
            </div>
          ) : (
            <ScrollArea className="h-72 pr-3">
              <div className="space-y-3">
                {entries.map((l) => {
                  const pct = l.problems.length ? Math.round((l.solvedCount / l.problems.length) * 100) : 0
                  const isExpanded = expandedId === l.id
                  return (
                    <div key={l.id} className="rounded-lg border p-3 space-y-2">
                      <div
                        className="flex items-center justify-between gap-2 cursor-pointer select-none"
                        onClick={() => toggleExpand(l.id)}
                      >
                        <div className="min-w-0 flex items-center gap-2">
                          {isExpanded ? (
                            <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
                          ) : (
                            <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                          )}
                          <div>
                            <p className="font-medium text-sm truncate">{l.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {l.solvedCount} / {l.problems.length} solved
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => { e.stopPropagation(); handleDelete(l.id) }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <Progress value={pct} className="h-2" indicatorClassName="bg-primary" />
                      {isExpanded && (
                        <ScrollArea className="h-32 rounded-md border">
                          <div className="p-1">
                            {l.problems.map((p) => {
                              const isSolved = solved.has(cfSolveKey(p.contestId, p.index))
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
                        </ScrollArea>
                      )}
                    </div>
                  )
                })}
              </div>
            </ScrollArea>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
