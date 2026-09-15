import { useCallback, useEffect, useRef, useState } from 'react'
import { useAppStore } from '@/store'
import { dbApi } from '@/lib/db'
import type { Note } from '@/lib/types'
import { Card, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Download, Pencil, Save, Type } from 'lucide-react'
import { DrawingCanvas, type DrawingCanvasHandle } from './DrawingCanvas'
import { DrawingTools } from './DrawingTools'

interface NoteEditorProps {
  note: Note | null
}

export function NoteEditor({ note }: NoteEditorProps) {
  const { notes, setNotes } = useAppStore()
  const [title, setTitle] = useState('')
  const [textContent, setTextContent] = useState('')
  const [activeTab, setActiveTab] = useState('text')
  const [color, setColor] = useState('#000000')
  const [strokeWidth, setStrokeWidth] = useState(5)

  const canvasRef = useRef<DrawingCanvasHandle>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const drawingSrc = note ? (note.drawing || undefined) : undefined

  useEffect(() => {
    if (note) {
      setTitle(note.title)
      setTextContent(note.content || '')
      setActiveTab('text')
    }
    // Load the note only when the selected note changes; title/content/tab are
    // intentionally excluded so edits aren't clobbered on unrelated rerenders.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [note?.id])

  const scheduleAutoSave = useCallback(() => {
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current)
    autoSaveTimer.current = setTimeout(() => {
      if (note) {
        const drawing =
          activeTab === 'draw' && canvasRef.current
            ? canvasRef.current.toDataURL()
            : note.drawing
        dbApi.saveNote({
          ...note,
          title,
          content: textContent,
          drawing,
          updatedAt: new Date().toISOString(),
        })
        setNotes(
          notes.map((n) =>
            n.id === note.id
              ? { ...n, title, content: textContent, drawing, updatedAt: new Date().toISOString() }
              : n
          )
        )
      }
    }, 800)
  }, [note, title, textContent, activeTab, notes, setNotes])

  useEffect(() => {
    if (note) scheduleAutoSave()
    return () => {
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current)
    }
  }, [title, textContent, note, scheduleAutoSave])

  useEffect(() => {
    if (contentRef.current && contentRef.current.innerText !== textContent) {
      contentRef.current.innerText = textContent
    }
  }, [textContent, note?.id])

  const handleSave = () => {
    if (!note) return
    const drawing =
      activeTab === 'draw' && canvasRef.current
        ? canvasRef.current.toDataURL()
        : note.drawing
    const updated = { ...note, title, content: textContent, drawing, updatedAt: new Date().toISOString() }
    dbApi.saveNote(updated)
    setNotes(notes.map((n) => (n.id === note.id ? updated : n)))
  }

  const handleExportPNG = () => {
    if (activeTab === 'draw') {
      if (!canvasRef.current) return
      const link = document.createElement('a')
      link.download = `${title || 'note'}.png`
      link.href = canvasRef.current.toDataURL()
      link.click()
    } else {
      const textCanvas = document.createElement('canvas')
      textCanvas.width = 800
      textCanvas.height = 600
      const ctx = textCanvas.getContext('2d')!
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, textCanvas.width, textCanvas.height)
      ctx.fillStyle = '#000000'
      ctx.font = 'bold 24px sans-serif'
      ctx.fillText(title || 'Untitled', 20, 40)
      ctx.font = '16px sans-serif'
      const lines = textContent.split('\n')
      lines.forEach((line, i) => {
        ctx.fillText(line, 20, 80 + i * 24)
      })
      const link = document.createElement('a')
      link.download = `${title || 'note'}.png`
      link.href = textCanvas.toDataURL('image/png')
      link.click()
    }
  }

  const handleClear = () => {
    if (activeTab === 'draw') {
      canvasRef.current?.clear()
    } else {
      setTextContent('')
      if (contentRef.current) contentRef.current.innerText = ''
    }
  }

  const handleContentInput = () => {
    if (contentRef.current) {
      setTextContent(contentRef.current.innerText)
    }
  }

  return (
    <Card className="flex-1 flex flex-col">
      {note ? (
        <>
          {/* Toolbar */}
          <CardHeader className="py-2">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleSave}>
                <Save className="mr-1 h-4 w-4" />
                Save
              </Button>
              <Button variant="outline" size="sm" onClick={handleExportPNG}>
                <Download className="mr-1 h-4 w-4" />
                Export PNG
              </Button>
              <Button variant="outline" size="sm" onClick={handleClear}>
                Clear
              </Button>
            </div>
          </CardHeader>

          {/* Title */}
          <div className="px-4 pb-2">
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Note title..."
              className="text-lg font-semibold"
            />
          </div>

          {/* Tabs */}
          <div className="flex-1 overflow-hidden px-4 pb-4">
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="flex h-full flex-col"
            >
              <TabsList className="mb-2 w-fit">
                <TabsTrigger value="text" className="gap-1">
                  <Type className="h-4 w-4" />
                  Text
                </TabsTrigger>
                <TabsTrigger value="draw" className="gap-1">
                  <Pencil className="h-4 w-4" />
                  Draw
                </TabsTrigger>
              </TabsList>

              {/* Text Tab */}
              <TabsContent value="text" className="flex-1 overflow-hidden">
                <div
                  ref={contentRef}
                  contentEditable
                  suppressContentEditableWarning
                  onInput={handleContentInput}
                  className="h-full w-full overflow-y-auto rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-ring"
                  style={{ minHeight: 200 }}
                />
              </TabsContent>

              {/* Draw Tab */}
              <TabsContent value="draw" className="flex-1 overflow-hidden">
                <div className="flex flex-col gap-2 h-full">
                  <DrawingTools
                    color={color}
                    strokeWidth={strokeWidth}
                    onColorChange={setColor}
                    onStrokeWidthChange={setStrokeWidth}
                  />
                  <div className="flex-1 overflow-auto rounded-md border bg-white">
                    <DrawingCanvas
                      ref={canvasRef}
                      color={color}
                      strokeWidth={strokeWidth}
                      src={drawingSrc}
                      srcKey={note.id}
                    />
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </>
      ) : (
        <div className="flex flex-1 items-center justify-center text-muted-foreground">
          <div className="text-center">
            <Pencil className="mx-auto mb-2 h-12 w-12 opacity-30" />
            <p>Select a note or create a new one</p>
          </div>
        </div>
      )}
    </Card>
  )
}