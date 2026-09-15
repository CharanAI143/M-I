import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Plus, Trash2 } from 'lucide-react'
import type { Note } from '@/lib/types'

interface NoteListPanelProps {
  notes: Note[]
  selectedId: string | null
  onSelect: (id: string) => void
  onNew: () => void
  onDelete: (id: string) => void
}

export function NoteListPanel({ notes, selectedId, onSelect, onNew, onDelete }: NoteListPanelProps) {
  return (
    <Card className="w-[300px] flex-shrink-0 flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Notes</CardTitle>
          <Button size="sm" onClick={onNew}>
            <Plus className="mr-1 h-4 w-4" />
            New
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden p-0">
        <ScrollArea className="h-full px-3 pb-3">
          {notes.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No notes yet. Click "New" to create one.
            </p>
          ) : (
            <div className="flex flex-col gap-1">
              {notes.map((note) => (
                <button
                  key={note.id}
                  onClick={() => onSelect(note.id)}
                  className={`group flex w-full items-start justify-between rounded-md px-3 py-2 text-left text-sm transition-colors ${
                    selectedId === note.id
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-muted'
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">
                      {note.title || 'Untitled'}
                    </p>
                    <p
                      className={`mt-0.5 truncate text-xs ${
                        selectedId === note.id
                          ? 'text-primary-foreground/70'
                          : 'text-muted-foreground'
                      }`}
                    >
                      {new Date(note.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`h-6 w-6 flex-shrink-0 opacity-0 transition-opacity group-hover:opacity-100 ${
                      selectedId === note.id
                        ? 'hover:bg-primary-foreground/20'
                        : ''
                    }`}
                    onClick={(e) => {
                      e.stopPropagation()
                      onDelete(note.id)
                    }}
                  >
                    <Trash2 className="h-3 w-3" />
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