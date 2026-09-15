import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import type { Roadmap } from '@/lib/types'
import { BookOpen, Clock, Code, Sparkles } from 'lucide-react'

interface RoadmapHistorySidebarProps {
  history: Roadmap[]
  activeId: number | null
  onSelect: (r: Roadmap) => void
  onNew: () => void
  onDelete: (id: number) => void
}

export function RoadmapHistorySidebar({ history, activeId, onSelect, onNew, onDelete }: RoadmapHistorySidebarProps) {
  return (
    <Card className="w-[280px] flex-shrink-0 flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Roadmaps</CardTitle>
          <Button size="sm" variant="outline" onClick={onNew}>
            <Sparkles className="mr-1 h-4 w-4" />
            New
          </Button>
        </div>
        <CardDescription>Previously generated roadmaps</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden p-0">
        <ScrollArea className="h-full px-3 pb-3">
          {history.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No roadmaps yet. Generate one to get started.
            </p>
          ) : (
            <div className="flex flex-col gap-1">
              {history.map((roadmap) => (
                <button
                  key={roadmap.id}
                  onClick={() => onSelect(roadmap)}
                  className={`group flex w-full items-start justify-between rounded-md px-3 py-2 text-left text-sm transition-colors ${
                    activeId === roadmap.id
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-muted'
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      {roadmap.is_coding ? (
                        <Code className="h-3 w-3 flex-shrink-0" />
                      ) : (
                        <BookOpen className="h-3 w-3 flex-shrink-0" />
                      )}
                      <p className="truncate font-medium">
                        {roadmap.course_name}
                      </p>
                    </div>
                    <p
                      className={`mt-0.5 flex items-center gap-1 text-xs ${
                        activeId === roadmap.id
                          ? 'text-primary-foreground/70'
                          : 'text-muted-foreground'
                      }`}
                    >
                      <Clock className="h-3 w-3" />
                      {new Date(roadmap.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`h-6 w-6 flex-shrink-0 opacity-0 transition-opacity group-hover:opacity-100 ${
                      activeId === roadmap.id
                        ? 'hover:bg-primary-foreground/20'
                        : ''
                    }`}
                    onClick={(e) => {
                      e.stopPropagation()
                      onDelete(roadmap.id)
                    }}
                  >
                    <span className="text-xs">&times;</span>
                  </Button>
                </button>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  )
}