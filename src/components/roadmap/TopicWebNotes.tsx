import { Badge } from '@/components/ui/badge'
import { findWebNotes } from '@/lib/notes'
import { ExternalLink, Globe } from 'lucide-react'

export function TopicWebNotes({ topicName }: { topicName: string }) {
  const webNotes = findWebNotes(topicName)
  if (webNotes.length === 0) return null
  return (
    <div>
      <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1.5">
        <Globe className="h-3.5 w-3.5 text-blue-400" />
        Best ready-made notes from the web
      </p>
      <div className="space-y-1">
        {webNotes.map((note) => (
          <a
            key={note.url}
            href="#"
            onClick={(e) => { e.preventDefault(); window.open(note.url, '_blank', 'noopener,noreferrer') }}
            className="flex items-center gap-2 rounded-md border px-2.5 py-1.5 text-sm text-primary/80 hover:text-primary hover:bg-accent/50 transition-colors"
          >
            <ExternalLink className="h-3 w-3 flex-shrink-0" />
            <span className="truncate">{note.title}</span>
            <Badge variant="secondary" className="text-[10px] shrink-0">
              {note.source}
            </Badge>
          </a>
        ))}
      </div>
    </div>
  )
}