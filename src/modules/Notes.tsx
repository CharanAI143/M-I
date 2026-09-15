import { useState } from 'react'
import { useAppStore } from '@/store'
import { dbApi } from '@/lib/db'
import type { Note } from '@/lib/types'
import { NoteListPanel } from '@/components/notes/NoteListPanel'
import { NoteEditor } from '@/components/notes/NoteEditor'
import { generateId, sortNotes } from '@/components/notes/notes-utils'

export default function Notes() {
  const { notes, setNotes } = useAppStore()
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const currentNote = notes.find((n) => n.id === selectedId) || null
  const sortedNotes = sortNotes(notes)

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
  }

  const handleDelete = (id: string) => {
    dbApi.deleteNote(id)
    setNotes(notes.filter((n) => n.id !== id))
    if (selectedId === id) setSelectedId(null)
  }

  return (
    <div className="flex h-full gap-2 p-2">
      <NoteListPanel
        notes={sortedNotes}
        selectedId={selectedId}
        onSelect={setSelectedId}
        onNew={handleNewNote}
        onDelete={handleDelete}
      />
      <NoteEditor note={currentNote} />
    </div>
  )
}