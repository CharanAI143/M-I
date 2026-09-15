import { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { NotebookText, Download, Check, Loader2, ExternalLink, GraduationCap } from 'lucide-react'
import {
  loadRefinedNotesFor,
  refinedSourcesFor,
  renderNoteHtml,
  pdfFileName,
  type RefinedNote,
} from '@/lib/notes'

async function saveNotes(topic: string, note: RefinedNote): Promise<string> {
  const html = renderNoteHtml(topic, note)
  const suggestedName = pdfFileName(topic)
  const ipc = (window as any).electron?.ipcRenderer
  if (ipc && typeof ipc.invoke === 'function') {
    const result = await ipc.invoke('notes:save-pdf', { suggestedName, html })
    if (result?.saved) return result.filePath
    if (result?.canceled) return ''
    throw new Error('Save failed')
  }
  // Browser fallback (dev without Electron IPC): offer the printable page.
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = suggestedName.replace(/\.pdf$/, '.html')
  a.click()
  URL.revokeObjectURL(url)
  return suggestedName.replace(/\.pdf$/, '.html')
}

export function TopicNotesDialog({ topicName }: { topicName: string }) {
  const [open, setOpen] = useState(false)
  const [note, setNote] = useState<RefinedNote | null>(null)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [savedPath, setSavedPath] = useState('')

  useEffect(() => {
    if (!open) return
    let cancelled = false
    setLoading(true)
    setNote(null)
    setSavedPath('')
    loadRefinedNotesFor(topicName)
      .then((n) => {
        if (!cancelled) setNote(n)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [open, topicName])

  const handleDownload = async () => {
    if (saving || !note) return
    setSaving(true)
    setSavedPath('')
    try {
      const result = await saveNotes(topicName, note)
      if (result) setSavedPath(result)
    } catch (err) {
      setSavedPath(`Save failed: ${err instanceof Error ? err.message : 'unknown error'}`)
    } finally {
      setSaving(false)
    }
  }

  const sources = refinedSourcesFor(topicName)

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="gap-1.5 shrink-0"
        title="Read refined notes for this topic"
        onClick={() => setOpen(true)}
      >
        <NotebookText className="h-3.5 w-3.5 text-amber-500" />
        Notes
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 pr-6">
              <NotebookText className="h-5 w-5 text-amber-500" />
              Refined Notes — {topicName}
            </DialogTitle>
            <DialogDescription>
              Simple, refined notes with real-world examples. Read now or download as a PDF to keep for later.
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="h-[55vh] rounded-md border p-4">
            {loading && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Preparing notes…
              </div>
            )}
            {!loading && note && (
              <>
                {note.tagline && (
                  <p className="text-sm text-muted-foreground leading-relaxed mb-3">{note.tagline}</p>
                )}
                {note.sections.length === 0 ? (
                  <div className="space-y-2">
                    {refinedSourcesFor(topicName).map((web) => (
                      <a
                        key={web.url}
                        href="#"
                        onClick={(e) => { e.preventDefault(); window.open(web.url, '_blank', 'noopener,noreferrer') }}
                        className="flex items-center gap-2 text-sm text-primary/80 hover:text-primary"
                      >
                        <ExternalLink className="h-3.5 w-3.5 flex-shrink-0" />
                        <span className="truncate">{web.title}</span>
                        <span className="text-xs text-muted-foreground shrink-0">({web.source})</span>
                      </a>
                    ))}
                  </div>
                ) : (
                  note.sections.map((section, idx) => (
                    <div key={idx} className="mb-4">
                      <h4 className="text-sm font-semibold mb-2">{section.heading}</h4>
                      <ul className="space-y-1.5">
                        {section.points.map((point, pIdx) => (
                          <li
                            key={pIdx}
                            className="flex items-start gap-2 text-sm text-muted-foreground leading-relaxed"
                          >
                            <span className="mt-1.5 h-1 w-1 rounded-full bg-amber-400/70 flex-shrink-0" />
                            <span className="break-words">{point}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))
                )}

                {sources.length > 0 && (
                  <>
                    <Separator className="my-4" />
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1.5">
                        <GraduationCap className="h-3.5 w-3.5 text-primary" />
                        Sources — IIT / NIT notes & best references
                      </p>
                      <div className="space-y-1">
                        {sources.map((src) => (
                          <a
                            key={src.url}
                            href="#"
                            onClick={(e) => { e.preventDefault(); window.open(src.url, '_blank', 'noopener,noreferrer') }}
                            className="flex items-center gap-2 text-sm text-primary/80 hover:text-primary"
                          >
                            <ExternalLink className="h-3.5 w-3.5 flex-shrink-0" />
                            <span className="truncate">{src.title}</span>
                            <Badge variant="secondary" className="text-[10px] shrink-0">
                              {src.source}
                            </Badge>
                          </a>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </>
            )}
          </ScrollArea>

          <DialogFooter className="items-center gap-2 sm:space-x-2">
            {savedPath && (
              <p className="text-xs text-muted-foreground break-all flex-1 flex items-center gap-1.5">
                {savedPath.startsWith('Save failed') ? (
                  <span className="text-destructive">{savedPath}</span>
                ) : (
                  <>
                    <Check className="h-3.5 w-3.5 text-green-500 flex-shrink-0" />
                    Saved to {savedPath}
                  </>
                )}
              </p>
            )}
            <Button variant="outline" onClick={() => setOpen(false)}>
              Close
            </Button>
            <Button onClick={handleDownload} disabled={saving || loading || !note}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
              {saving ? 'Saving…' : 'Download PDF'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}