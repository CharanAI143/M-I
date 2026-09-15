import { useState, useEffect, useRef, useCallback } from 'react'
import { useAppStore, dbApi } from '@/store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Plus, Trash2, Save, Download, Type, Pencil, Palette } from 'lucide-react'
import type { Note } from '@/lib/types'

const COLORS = ['#000000', '#ef4444', '#3b82f6', '#22c55e', '#eab308', '#ffffff'] as const
const STROKE_WIDTHS = [
  { label: 'Thin', value: 2 },
  { label: 'Medium', value: 5 },
  { label: 'Thick', value: 10 },
] as const

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2)
}

export default function Notes() {
  const { notes, setNotes } = useAppStore()

  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [textContent, setTextContent] = useState('')
  const [activeTab, setActiveTab] = useState('text')
  const [color, setColor] = useState('#000000')
  const [strokeWidth, setStrokeWidth] = useState(5)
  const [isDrawing, setIsDrawing] = useState(false)

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const lastPoint = useRef<{ x: number; y: number } | null>(null)

  const currentNote = notes.find((n) => n.id === selectedId) || null

  useEffect(() => {
    if (currentNote) {
      setTitle(currentNote.title)
      setTextContent(currentNote.content || '')
      const canvas = canvasRef.current
      if (canvas) {
        const ctx = canvas.getContext('2d')
        if (ctx && currentNote.drawing) {
          const img = new Image()
          img.onload = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height)
            ctx.drawImage(img, 0, 0)
          }
          img.src = currentNote.drawing
        } else if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height)
        }
      }
    }
  }, [selectedId])

  const scheduleAutoSave = useCallback(() => {
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current)
    autoSaveTimer.current = setTimeout(() => {
      if (currentNote) {
        const canvas = canvasRef.current
        const drawing = canvas ? canvas.toDataURL('image/png') : currentNote.drawing
        dbApi.saveNote({
          ...currentNote,
          title,
          content: textContent,
          drawing,
          updatedAt: new Date().toISOString(),
        })
        setNotes(
          notes.map((n) =>
            n.id === currentNote.id
              ? { ...n, title, content: textContent, drawing, updatedAt: new Date().toISOString() }
              : n
          )
        )
      }
    }, 800)
  }, [currentNote, title, textContent, notes, setNotes])

  useEffect(() => {
    if (currentNote) scheduleAutoSave()
    return () => {
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current)
    }
  }, [title, textContent, currentNote, scheduleAutoSave])

  useEffect(() => {
    if (contentRef.current && contentRef.current.innerText !== textContent) {
      contentRef.current.innerText = textContent
    }
  }, [selectedId])

  const handleNewNote = () => {
    const note: Note = {
      id: generateId(),
      title: 'Untitled Note',
      content: '',
      drawing: '',
      thumbnail: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    dbApi.saveNote(note)
    setNotes([...notes, note])
    setSelectedId(note.id)
    setActiveTab('text')
  }

  const handleDelete = (id: string) => {
    dbApi.deleteNote(id)
    setNotes(notes.filter((n) => n.id !== id))
    if (selectedId === id) setSelectedId(null)
  }

  const handleSave = () => {
    if (!currentNote) return
    const canvas = canvasRef.current
    const drawing = canvas ? canvas.toDataURL('image/png') : currentNote.drawing
    const updated = { ...currentNote, title, content: textContent, drawing, updatedAt: new Date().toISOString() }
    dbApi.saveNote(updated)
    setNotes(notes.map((n) => (n.id === currentNote.id ? updated : n)))
  }

  const handleExportPNG = () => {
    if (activeTab === 'draw') {
      const canvas = canvasRef.current
      if (!canvas) return
      const link = document.createElement('a')
      link.download = `${title || 'note'}.png`
      link.href = canvas.toDataURL('image/png')
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
      const canvas = canvasRef.current
      if (canvas) {
        const ctx = canvas.getContext('2d')
        if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height)
      }
    } else {
      setTextContent('')
      if (contentRef.current) contentRef.current.innerText = ''
    }
  }

  const getCanvasPoint = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }
    const rect = canvas.getBoundingClientRect()
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    }
  }

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.preventDefault()
    e.currentTarget.setPointerCapture(e.pointerId)
    setIsDrawing(true)
    lastPoint.current = getCanvasPoint(e)
    const canvas = canvasRef.current
    if (canvas) {
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.beginPath()
        const p = lastPoint.current
        ctx.moveTo(p.x, p.y)
        ctx.strokeStyle = color
        ctx.lineWidth = strokeWidth
        ctx.lineCap = 'round'
        ctx.lineJoin = 'round'
      }
    }
  }

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return
    e.preventDefault()
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx || !lastPoint.current) return
    const p = getCanvasPoint(e)
    ctx.beginPath()
    ctx.moveTo(lastPoint.current.x, lastPoint.current.y)
    ctx.lineTo(p.x, p.y)
    ctx.strokeStyle = color
    ctx.lineWidth = strokeWidth
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.stroke()
    lastPoint.current = p
  }

  const handlePointerUp = () => {
    setIsDrawing(false)
    lastPoint.current = null
  }

  const handleContentInput = () => {
    if (contentRef.current) {
      setTextContent(contentRef.current.innerText)
    }
  }

  const sortedNotes = [...notes].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  )

  return (
    <div className="flex h-full gap-2 p-2">
      {/* Note List Panel */}
      <Card className="w-[300px] flex-shrink-0 flex flex-col">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Notes</CardTitle>
            <Button size="sm" onClick={handleNewNote}>
              <Plus className="mr-1 h-4 w-4" />
              New
            </Button>
          </div>
        </CardHeader>
        <CardContent className="flex-1 overflow-hidden p-0">
          <ScrollArea className="h-full px-3 pb-3">
            {sortedNotes.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                No notes yet. Click "New" to create one.
              </p>
            ) : (
              <div className="flex flex-col gap-1">
                {sortedNotes.map((note) => (
                  <button
                    key={note.id}
                    onClick={() => {
                      setSelectedId(note.id)
                      setActiveTab('text')
                    }}
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
                        handleDelete(note.id)
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

      {/* Editor Area */}
      <Card className="flex-1 flex flex-col">
        {currentNote ? (
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
                    {/* Drawing tools */}
                    <div className="flex items-center gap-3 flex-wrap">
                      <div className="flex items-center gap-1">
                        <Palette className="h-4 w-4 text-muted-foreground" />
                        {COLORS.map((c) => (
                          <button
                            key={c}
                            onClick={() => setColor(c)}
                            className={`h-6 w-6 rounded-full border-2 transition-transform ${
                              color === c
                                ? 'scale-110 border-primary'
                                : 'border-muted-foreground/30'
                            }`}
                            style={{ backgroundColor: c }}
                          />
                        ))}
                      </div>
                      <div className="flex items-center gap-1">
                        {STROKE_WIDTHS.map((sw) => (
                          <Button
                            key={sw.value}
                            variant={strokeWidth === sw.value ? 'default' : 'outline'}
                            size="sm"
                            className="h-7 px-2"
                            onClick={() => setStrokeWidth(sw.value)}
                          >
                            {sw.label}
                          </Button>
                        ))}
                      </div>
                    </div>
                    {/* Canvas */}
                    <div className="flex-1 overflow-auto rounded-md border bg-white">
                      <canvas
                        ref={canvasRef}
                        width={800}
                        height={600}
                        className="cursor-crosshair touch-none"
                        onPointerDown={handlePointerDown}
                        onPointerMove={handlePointerMove}
                        onPointerUp={handlePointerUp}
                        onPointerCancel={handlePointerUp}
                        onPointerLeave={handlePointerUp}
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
    </div>
  )
}
